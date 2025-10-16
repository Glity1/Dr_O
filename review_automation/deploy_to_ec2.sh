#!/bin/bash

# EC2 빠른 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 설정
EC2_USER="ubuntu"
EC2_HOST=""  # EC2 IP 주소
EC2_KEY=""   # .pem 파일 경로
PROJECT_DIR="/home/ubuntu/review-system"

echo -e "${GREEN}======================================"
echo "   EC2 배포 스크립트"
echo "======================================${NC}"
echo ""

# EC2 정보 확인
if [ -z "$EC2_HOST" ] || [ -z "$EC2_KEY" ]; then
    echo -e "${RED}❌ EC2_HOST 또는 EC2_KEY가 설정되지 않았습니다.${NC}"
    echo ""
    echo "사용법:"
    echo "1. 이 스크립트를 열어 EC2_HOST와 EC2_KEY 변수를 설정하세요."
    echo "   EC2_HOST=\"your-ec2-ip\""
    echo "   EC2_KEY=\"path/to/your-key.pem\""
    echo ""
    echo "또는 환경 변수로 설정:"
    echo "   export EC2_HOST=your-ec2-ip"
    echo "   export EC2_KEY=path/to/your-key.pem"
    echo "   ./deploy_to_ec2.sh"
    exit 1
fi

# SSH 키 권한 확인
if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}❌ SSH 키 파일을 찾을 수 없습니다: $EC2_KEY${NC}"
    exit 1
fi

chmod 400 "$EC2_KEY"

echo -e "${YELLOW}배포 대상: ${EC2_USER}@${EC2_HOST}${NC}"
echo ""

# 1. 연결 테스트
echo -e "${YELLOW}🔌 EC2 연결 테스트...${NC}"
if ssh -i "$EC2_KEY" -o ConnectTimeout=10 "${EC2_USER}@${EC2_HOST}" "echo 'Connection successful'" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 연결 성공${NC}"
else
    echo -e "${RED}❌ EC2에 연결할 수 없습니다. 호스트와 키를 확인하세요.${NC}"
    exit 1
fi

# 2. Git 저장소 확인
echo ""
echo -e "${YELLOW}📦 Git 저장소 확인...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git 저장소가 아닙니다. git init를 먼저 실행하세요.${NC}"
    exit 1
fi

# 커밋되지 않은 변경사항 확인
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  커밋되지 않은 변경사항이 있습니다.${NC}"
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. 환경 변수 파일 확인
echo ""
echo -e "${YELLOW}🔑 환경 변수 확인...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 파일이 없습니다. .env.example을 참고하여 생성하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env 파일 확인${NC}"

# 4. 프로젝트 파일 압축
echo ""
echo -e "${YELLOW}📦 프로젝트 압축 중...${NC}"
tar -czf project.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env' \
    --exclude='project.tar.gz' \
    .
echo -e "${GREEN}✓ 압축 완료${NC}"

# 5. 파일 전송
echo ""
echo -e "${YELLOW}📤 EC2로 파일 전송 중...${NC}"
scp -i "$EC2_KEY" project.tar.gz "${EC2_USER}@${EC2_HOST}:/tmp/"
scp -i "$EC2_KEY" .env "${EC2_USER}@${EC2_HOST}:/tmp/"
echo -e "${GREEN}✓ 전송 완료${NC}"

# 6. EC2에서 배포 실행
echo ""
echo -e "${YELLOW}🚀 EC2에서 배포 실행 중...${NC}"
ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" << 'ENDSSH'
set -e

# 프로젝트 디렉토리 생성
mkdir -p /home/ubuntu/review-system
cd /home/ubuntu/review-system

# 기존 파일 백업
if [ -d "backup" ]; then
    rm -rf backup
fi
mkdir -p backup
if [ "$(ls -A .)" ]; then
    mv * backup/ 2>/dev/null || true
fi

# 새 파일 압축 해제
tar -xzf /tmp/project.tar.gz -C .
mv /tmp/.env .

# Docker 컨테이너 정지 및 삭제
if [ -f docker-compose.yml ]; then
    docker-compose down || true
fi

# 이미지 빌드
echo "🏗️  Docker 이미지 빌드 중..."
docker-compose build --no-cache

# 컨테이너 시작
echo "🚀 컨테이너 시작 중..."
docker-compose up -d

# 서비스 준비 대기
echo "⏳ 서비스 준비 대기 중..."
sleep 30

# 상태 확인
echo "📊 컨테이너 상태:"
docker-compose ps

# 헬스체크
echo "🏥 헬스체크 실행 중..."
curl -f http://localhost:8000/health || echo "백엔드 헬스체크 실패"
curl -f http://localhost:5000/ || echo "더미 사이트 헬스체크 실패"

echo "✅ 배포 완료!"
ENDSSH

# 7. 정리
echo ""
echo -e "${YELLOW}🧹 임시 파일 정리...${NC}"
rm -f project.tar.gz
echo -e "${GREEN}✓ 정리 완료${NC}"

# 8. 배포 결과
echo ""
echo -e "${GREEN}======================================"
echo "   배포 성공! 🎉"
echo "======================================${NC}"
echo ""
echo "접속 URL:"
echo "  - 프론트엔드: http://${EC2_HOST}"
echo "  - 백엔드 API: http://${EC2_HOST}:8000"
echo "  - 더미 사이트: http://${EC2_HOST}:5000"
echo ""
echo "로그 확인:"
echo "  ssh -i $EC2_KEY ${EC2_USER}@${EC2_HOST}"
echo "  cd /home/ubuntu/review-system"
echo "  docker-compose logs -f"
echo ""
echo "컨테이너 재시작:"
echo "  ssh -i $EC2_KEY ${EC2_USER}@${EC2_HOST}"
echo "  cd /home/ubuntu/review-system"
echo "  docker-compose restart"
echo ""