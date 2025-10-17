#!/bin/bash

# EC2 배포 스크립트
# 사용법: ./deploy_to_ec2.sh <EC2_IP> <PEM_KEY_PATH>

set -e

if [ "$#" -ne 2 ]; then
    echo "사용법: $0 <EC2_IP> <PEM_KEY_PATH>"
    echo "예시: $0 3.233.86.118 /c/Users/sean1/Downloads/review-automation-key.pem"
    exit 1
fi

EC2_IP=$1
PEM_KEY=$2
EC2_USER="ubuntu"

echo "🚀 EC2 배포 시작: $EC2_IP"

# 1. 키 권한 설정
chmod 400 "$PEM_KEY"

# 2. 프로젝트 파일 압축
echo "📦 프로젝트 파일 압축 중..."
tar -czf review-automation.tar.gz \
    --exclude='backend/venv' \
    --exclude='backend/__pycache__' \
    --exclude='backend/app/__pycache__' \
    --exclude='frontend/node_modules' \
    --exclude='frontend/dist' \
    --exclude='.git' \
    backend/ dummy_site/ frontend/ docker-compose.yml .env Makefile 2>/dev/null || {
    echo "❌ 압축 실패. 필수 폴더가 있는지 확인하세요."
    exit 1
}

echo "✅ 압축 완료"

# 3. EC2로 파일 전송
echo "📤 EC2로 파일 전송 중..."
scp -i "$PEM_KEY" -o StrictHostKeyChecking=no \
    review-automation.tar.gz \
    "$EC2_USER@$EC2_IP:/home/$EC2_USER/"

if [ $? -ne 0 ]; then
    echo "❌ 파일 전송 실패"
    exit 1
fi

echo "✅ 파일 전송 완료"

# 4. EC2에서 배포 실행
echo "🔧 EC2에서 설정 및 실행 중..."
echo "⏳ 이 과정은 5-10분 정도 걸립니다..."
ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'ENDSSH'

# 기존 디렉토리 정리
if [ -d "review-automation" ]; then
    cd review-automation
    docker compose down 2>/dev/null || true
    cd ..
    rm -rf review-automation
fi

# 압축 해제
mkdir -p review-automation
cd review-automation
tar -xzf ../review-automation.tar.gz
rm ../review-automation.tar.gz

# Docker 및 Docker Compose 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Docker 설치 중..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo usermod -aG docker $USER
fi

# Docker Compose 실행
echo "🐳 Docker Compose 실행 중..."
docker compose up -d --build

# 잠시 대기
sleep 5

# 상태 확인
echo ""
echo "✅ 컨테이너 상태:"
docker compose ps

echo ""
echo "📊 최근 로그:"
docker compose logs --tail=30

ENDSSH

# 5. 정리
rm review-automation.tar.gz

echo ""
echo "=========================================="
echo "✅ 배포 완료!"
echo "=========================================="
echo ""
echo "🌐 서비스 접속 URL:"
echo "   - 프론트엔드: http://$EC2_IP:3000"
echo "   - 백엔드 API: http://$EC2_IP:8000"
echo "   - API 문서: http://$EC2_IP:8000/docs"
echo "   - 더미 사이트: http://$EC2_IP:5001"
echo ""
echo "📝 SSH 접속: ssh -i $PEM_KEY ubuntu@$EC2_IP"
echo "📊 로그 확인: ssh -i $PEM_KEY ubuntu@$EC2_IP 'cd review-automation && docker compose logs -f'"