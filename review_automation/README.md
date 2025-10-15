# README.md
# 리뷰 자동 답변 시스템

## 📋 프로젝트 개요
고객 리뷰를 자동으로 수집하고 AI를 활용하여 맞춤형 답변을 생성하는 시스템입니다.

## 🚀 시작하기

### 필수 요구사항
- Docker & Docker Compose
- Gemini API Key
- Python 3.11+ (로컬 개발 시)
- Node.js 18+ (프론트엔드 개발 시)

### 설치 및 실행

1. **프로젝트 클론**
   ```bash
   git clone <repository-url>
   cd review_automation
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 열어 GEMINI_API_KEY 입력
   ```

3. **Docker로 실행**
   ```bash
   make init  # 초기 설정
   make up    # 서비스 시작
   ```

4. **접속 URL**
   - 관리자 대시보드: http://localhost:3000
   - API 문서: http://localhost:8000/docs
   - 더미 리뷰 사이트: http://localhost:5000

## 📁 프로젝트 구조
```
review_automation/
├── backend/          # FastAPI 백엔드
├── frontend/         # React 대시보드
├── dummy_site/       # 테스트용 더미 사이트
├── docker-compose.yml
└── .env
```

## 🛠 개발 가이드

### 로컬 개발 환경

**백엔드 개발**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**프론트엔드 개발**
```bash
cd frontend
npm install
npm start
```

### API 엔드포인트

- `GET /api/reviews` - 리뷰 목록 조회
- `GET /api/reviews/recent` - 최근 답변한 리뷰
- `GET /api/reviews/pending` - 대기 중인 리뷰
- `POST /api/reviews/{id}/generate-reply` - 답변 생성
- `POST /api/reviews/{id}/post-reply` - 답변 게시
- `GET /api/stats` - 통계 데이터
- `POST /api/scrape` - 수동 스크래핑

## 📊 주요 기능

### 1. 자동 리뷰 수집
- 30분마다 자동으로 새 리뷰 스크래핑
- 중복 리뷰 자동 필터링

### 2. AI 답변 생성
- Gemini API를 활용한 맞춤형 답변
- 감정 분석 기반 톤 조정
- 키워드 자동 추출

### 3. 대시보드
- 실시간 통계 및 차트
- 리뷰 검색 및 필터링
- 답변 관리 및 수정

## 🔧 설정 옵션

### 스크래핑 간격 변경
`.env` 파일에서 `SCRAPING_INTERVAL` 값 수정 (초 단위)

### 자동 답변 게시
`.env` 파일에서 `AUTO_POST_ENABLED=true` 설정

## 📝 문제 해결

### 데이터베이스 연결 오류
```bash
docker-compose down
docker-compose up postgres -d
# 5초 대기 후
docker-compose up backend
```

### 포트 충돌
다른 포트 사용 시 `docker-compose.yml` 파일의 ports 섹션 수정