# Windows PowerShell용 통합 테스트 실행 스크립트

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  리뷰 관리 시스템 통합 테스트 시작" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 환경 변수 파일 확인
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env 파일이 없습니다. .env.example을 참고하여 생성하세요." -ForegroundColor Red
    exit 1
}

Write-Host "✓ 환경 변수 파일 확인 완료" -ForegroundColor Green
Write-Host ""

# 기존 컨테이너 정리
Write-Host "🧹 기존 컨테이너 정리 중..." -ForegroundColor Yellow
docker-compose down -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  컨테이너 정리 중 경고 발생 (무시 가능)" -ForegroundColor Yellow
}
Write-Host "✓ 정리 완료" -ForegroundColor Green
Write-Host ""

# 이미지 빌드
Write-Host "🏗️  Docker 이미지 빌드 중..." -ForegroundColor Yellow
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 빌드 완료" -ForegroundColor Green
Write-Host ""

# 컨테이너 시작
Write-Host "🚀 컨테이너 시작 중..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 컨테이너 시작 실패" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 컨테이너 시작 완료" -ForegroundColor Green
Write-Host ""

# 서비스 준비 대기
Write-Host "⏳ 서비스 준비 대기 중 (30초)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# 컨테이너 상태 확인
Write-Host "📊 컨테이너 상태 확인:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# 통합 테스트 실행
Write-Host "🧪 통합 테스트 실행 중..." -ForegroundColor Yellow
Write-Host ""

# Python 설치 확인
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}

if ($null -eq $pythonCmd) {
    Write-Host "❌ Python이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "Python 3.8 이상을 설치해주세요: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "또는 수동으로 테스트하세요:" -ForegroundColor Yellow
    Write-Host "  - 프론트엔드: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  - 백엔드 API: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "  - 더미 사이트: http://localhost:5000" -ForegroundColor Cyan
} else {
    # requests 라이브러리 확인
    & $pythonCmd -c "import requests" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 requests 라이브러리 설치 중..." -ForegroundColor Yellow
        & $pythonCmd -m pip install requests
    }
    
    # 테스트 실행
    & $pythonCmd integration_test.py
    $testResult = $LASTEXITCODE
    
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    if ($testResult -eq 0) {
        Write-Host "✅ 모든 테스트 통과!" -ForegroundColor Green
        Write-Host "======================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "다음 단계:" -ForegroundColor Yellow
        Write-Host "1. docker-compose logs [서비스명] 으로 로그 확인" -ForegroundColor Cyan
        Write-Host "2. http://localhost:3000 에서 대시보드 확인" -ForegroundColor Cyan
        Write-Host "3. http://localhost:5000 에서 더미 사이트 확인" -ForegroundColor Cyan
        Write-Host "4. AWS EC2 배포 준비" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 테스트 실패" -ForegroundColor Red
        Write-Host "======================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "트러블슈팅:" -ForegroundColor Yellow
        Write-Host "1. docker-compose logs 로 에러 확인" -ForegroundColor Cyan
        Write-Host "2. 각 서비스별 로그 확인:" -ForegroundColor Cyan
        Write-Host "   - docker-compose logs backend" -ForegroundColor Gray
        Write-Host "   - docker-compose logs dummy_site" -ForegroundColor Gray
        Write-Host "   - docker-compose logs postgres" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "💡 컨테이너가 실행 중입니다." -ForegroundColor Yellow
Write-Host "   종료하려면: docker-compose down" -ForegroundColor Cyan
Write-Host ""