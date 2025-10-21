# 🤖 AI 리뷰 답변 자동화 시스템 (DrO)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-19.1-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-green.svg)

Google Gemini AI를 활용한 스마트한 고객 리뷰 관리 및 자동 답변 생성 시스템입니다.

## 📖 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [설치 및 실행](#-설치-및-실행)
- [사용 방법](#-사용-방법)
- [API 문서](#-api-문서)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 가이드](#-개발-가이드)
- [라이선스](#-라이선스)

## 🎯 프로젝트 소개

온라인 쇼핑몰 및 스마트스토어 운영자를 위한 AI 기반 리뷰 관리 솔루션입니다. 
고객 리뷰를 자동으로 수집하고, Google Gemini AI가 맞춤형 답변을 생성하여 
고객 응대 시간을 획기적으로 단축시킵니다.

### 왜 이 프로젝트가 필요한가요?

- ⏰ **시간 절약**: 하루 수백 개의 리뷰에 일일이 답변하는 시간 절약
- 🎯 **일관된 품질**: AI가 항상 친절하고 전문적인 답변 생성
- 📊 **데이터 분석**: 리뷰 감성 분석 및 키워드 추출로 인사이트 확보
- 🚀 **자동화**: 수집부터 답변 생성, 게시까지 전 과정 자동화

## ✨ 주요 기능

### 🔄 자동 리뷰 수집
- 스마트스토어/쇼핑몰 사이트에서 자동 스크래핑
- 중복 리뷰 자동 필터링
- 실시간 새 리뷰 감지 및 알림

### 🤖 AI 답변 생성
- **Google Gemini 2.5 Flash Lite** 활용
- 고객 이름 맞춤형 답변
- 긍정/부정 리뷰 자동 구분 및 적절한 톤 선택
- 2-3문장의 자연스러운 한국어 답변

### 📈 감성 분석 & 키워드 추출
- 리뷰 감성 자동 분석 (긍정/중립/부정)
- 핵심 키워드 자동 추출 (음식, 서비스, 분위기 등)
- 시계열 감성 추이 분석

### 📊 대시보드
- **실시간 통계**: 총 리뷰 수, 답변률, 감성 분포
- **차트 시각화**: Recharts 기반 데이터 시각화
- **고객 관리**: VIP 고객, 충성 고객, 블랙리스트 분류
- **고객 스토리**: AI가 생성하는 고객별 맞춤 스토리

### 🎨 쇼핑몰 더미 사이트
- 실제 쇼핑몰과 동일한 UI/UX
- 상품 상세 페이지, 리뷰 시스템
- 리뷰 작성 및 답변 게시 테스트

## 🛠 기술 스택

### Backend
- **프레임워크**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy
- **데이터베이스**: PostgreSQL 15
- **AI 모델**: Google Gemini 2.5 Flash Lite
- **스크래핑**: BeautifulSoup4, Requests
- **서버**: Uvicorn

### Frontend
- **프레임워크**: React 19.1
- **라우팅**: React Router DOM 7
- **차트**: Recharts 3.2
- **스타일링**: Tailwind CSS 3.4
- **아이콘**: Lucide React
- **HTTP**: Axios
- **빌더**: Vite (Rolldown)

### DevOps
- **컨테이너**: Docker, Docker Compose
- **웹서버**: Nginx (프론트엔드)
- **CI/CD**: GitHub Actions (예정)

### 더미 사이트
- **프레임워크**: Flask
- **스타일링**: Custom CSS + Font Awesome
- **데이터 저장**: JSON 파일

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자                                 │
└────────────────┬───────────────────┬────────────────────────┘
                 │                   │
         ┌───────▼────────┐  ┌───────▼──────────┐
         │  프론트엔드      │  │   더미 사이트      │
         │  (React)        │  │   (Flask)         │
         │  Port: 3000     │  │   Port: 5000      │
         └───────┬─────────┘  └──────────┬────────┘
                 │                       │
                 │    ┌──────────────────┘
                 │    │
         ┌───────▼────▼────┐
         │   백엔드 API     │
         │   (FastAPI)     │
         │   Port: 8000    │
         └───────┬──────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐  ┌────▼─────┐  ┌──▼────────┐
│Gemini │  │PostgreSQL│  │  Scraper  │
│  AI   │  │   DB     │  │           │
└───────┘  └──────────┘  └───────────┘
```

## 🚀 설치 및 실행

### 사전 요구사항

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [Google Gemini API Key](https://ai.google.dev/)
- Git

### 1️⃣ 프로젝트 클론

```bash
git clone https://github.com/Glity1/Dr_O.git
cd Dr_O
```

### 2️⃣ 환경 변수 설정

```bash
cd review_automation
```

`.env` 파일을 생성하고 다음 내용을 입력:

```env
# Gemini API Key (필수)
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DATABASE_URL=postgresql://review_user:review_password@postgres:5432/review_db
POSTGRES_HOST=postgres
POSTGRES_USER=review_user
POSTGRES_PASSWORD=review_password
POSTGRES_DB=review_db

# Service URLs
DUMMY_SITE_URL=http://dummy_site:5000
EC2_PUBLIC_IP=localhost

# Python
PYTHONUNBUFFERED=1
```

### 3️⃣ Docker로 실행

```bash
# 모든 서비스 시작
docker-compose up -d

# 빌드 포함 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

### 4️⃣ 접속

서비스가 시작되면 다음 URL로 접속:

| 서비스 | URL | 설명 |
|--------|-----|------|
| 🎨 프론트엔드 | http://localhost:3000 | 관리자 대시보드 |
| 🔧 백엔드 API | http://localhost:8000/docs | API 문서 (Swagger) |
| 🛍️ 더미 사이트 | http://localhost:5000 | 테스트용 쇼핑몰 |
| 🗄️ PostgreSQL | localhost:5432 | 데이터베이스 |

## 📱 사용 방법

### 기본 워크플로우

1. **리뷰 수집**
   - 더미 사이트(http://localhost:5000)에서 리뷰 작성
   - 또는 대시보드에서 "스크래핑 실행" 버튼 클릭

2. **AI 답변 생성**
   - 대시보드에서 "답변 생성" 버튼 클릭
   - AI가 자동으로 모든 대기 중인 리뷰에 답변 생성

3. **답변 확인 및 수정**
   - 생성된 답변 검토
   - 필요시 수정 가능

4. **답변 게시**
   - "답변 게시" 버튼으로 더미 사이트에 자동 게시
   - 더미 사이트에서 확인 가능

### 주요 화면

#### 📊 대시보드
- 리뷰 통계 카드 (총 리뷰, 답변 완료, 대기 중)
- 감성 분석 차트
- 최근 리뷰 목록

#### 🤖 AI 분석
- 감성 추이 차트
- 키워드 클라우드
- 자동 답변 관리

#### 👥 고객 관리
- VIP 고객 관리
- 충성도 분석
- 고객별 AI 스토리 생성

## 📚 API 문서

### 리뷰 API

#### 최근 리뷰 조회
```http
GET /reviews/recent?limit=20&offset=0
```

#### 답변 대기 중인 리뷰
```http
GET /reviews/pending
```

#### 특정 리뷰 조회
```http
GET /reviews/{review_id}
```

### 작업 실행 API

#### 스크래핑 실행
```http
POST /scrape
```

#### AI 답변 생성
```http
POST /generate-replies?max_count=100
```

#### 답변 게시
```http
POST /post-replies?max_count=10
```

#### 특정 리뷰 답변 재생성
```http
POST /reviews/{review_id}/regenerate-reply
```

### 통계 API

#### 전체 통계
```http
GET /stats
```

#### 감성 추이
```http
GET /stats/sentiment-trend?days=7
```

#### 고객 스토리 생성
```http
POST /generate-customer-story
Content-Type: application/json

{
  "name": "김민수",
  "totalReviews": 10,
  "positiveReviews": 8,
  "loyaltyScore": 85,
  "topKeywords": [{"keyword": "커피", "count": 5}],
  "firstReviewDate": "2024-01-01",
  "lastReviewDate": "2025-01-20",
  "reviewSamples": ["맛있어요", "분위기 좋아요"]
}
```

자세한 API 문서는 http://localhost:8000/docs 에서 확인하세요.

## 📁 프로젝트 구조

```
DrO/
├── review_automation/
│   ├── backend/                    # FastAPI 백엔드
│   │   ├── app/
│   │   │   ├── main.py            # FastAPI 앱 메인
│   │   │   ├── models.py          # SQLAlchemy 모델
│   │   │   ├── database.py        # DB 연결 설정
│   │   │   ├── llm_service.py     # Gemini AI 서비스
│   │   │   ├── scraper.py         # 리뷰 스크래핑
│   │   │   ├── crud.py            # DB CRUD 작업
│   │   │   └── schemas.py         # Pydantic 스키마
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── frontend/                   # React 프론트엔드
│   │   ├── src/
│   │   │   ├── components/        # React 컴포넌트
│   │   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── services/          # API 서비스
│   │   │   ├── hooks/             # Custom Hooks
│   │   │   ├── App.jsx            # 메인 앱
│   │   │   └── main.jsx           # 엔트리 포인트
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── dummy_site/                 # 테스트용 쇼핑몰
│   │   ├── templates/
│   │   │   └── index.html         # 쇼핑몰 UI
│   │   ├── static/
│   │   │   ├── style.css          # 스타일시트
│   │   │   └── script.js          # JavaScript
│   │   ├── app.py                 # Flask 앱
│   │   ├── reviews_data.json      # 리뷰 데이터
│   │   └── Dockerfile
│   │
│   ├── docker-compose.yml          # Docker Compose 설정
│   ├── .env                        # 환경 변수
│   ├── Makefile                    # 편의 명령어
│   └── API_SPECIFICATION.md        # API 상세 명세
│
└── README.md                       # 이 파일
```

## 🔧 개발 가이드

### 로컬 개발 환경 설정

#### 백엔드 개발

```bash
cd review_automation/backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행 (핫 리로드)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 프론트엔드 개발

```bash
cd review_automation/frontend

# 의존성 설치
npm install

# 개발 서버 실행 (핫 리로드)
npm run dev

# 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

#### 더미 사이트 개발

```bash
cd review_automation/dummy_site

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행
python app.py
```

### 데이터베이스 관리

#### 테이블 초기화

```bash
cd review_automation/backend
python app/init_db.py
```

#### 테이블 삭제 및 재생성

```bash
python app/init_db.py drop
# 'yes' 입력
python app/init_db.py
```

### Docker 명령어

```bash
# 전체 서비스 시작
docker-compose up -d

# 특정 서비스만 시작
docker-compose up -d backend

# 서비스 중지
docker-compose down

# 볼륨 포함 완전 삭제
docker-compose down -v

# 로그 확인
docker-compose logs -f [서비스명]

# 컨테이너 재시작
docker-compose restart [서비스명]

# 빌드 없이 재시작
docker-compose up -d --no-deps [서비스명]
```

### 테스트

```bash
# 백엔드 테스트
cd review_automation/backend
pytest

# 프론트엔드 테스트
cd review_automation/frontend
npm test

# E2E 테스트
python review_automation/integration_test.py
```

## 🐛 문제 해결

### 포트 충돌

다른 애플리케이션이 포트를 사용 중인 경우 `docker-compose.yml`에서 포트 변경:

```yaml
ports:
  - "8001:8000"  # 8000 → 8001로 변경
```

### 데이터베이스 연결 오류

```bash
# PostgreSQL 컨테이너 재시작
docker-compose restart postgres

# 데이터베이스 로그 확인
docker-compose logs postgres
```

### Gemini API 오류

- API 키가 유효한지 확인
- API 할당량 초과 여부 확인
- https://ai.google.dev/ 에서 API 상태 확인

### 프론트엔드 빌드 오류

```bash
cd review_automation/frontend

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어 후 빌드
npm run build -- --force
```

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👥 팀

- **개발자**: DrO Team
- **AI 모델**: Google Gemini 2.5 Flash Lite
- **프로젝트 기간**: 2025.01 - 현재

## 🙏 감사의 말

- Google Gemini API
- FastAPI 커뮤니티
- React 커뮤니티
- 모든 오픈소스 기여자들

## 📞 문의

- GitHub Issues: [https://github.com/Glity1/Dr_O/issues](https://github.com/Glity1/Dr_O/issues)
- Email: your-email@example.com

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!
