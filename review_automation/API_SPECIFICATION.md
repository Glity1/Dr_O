# Dr.O AI 리뷰 분석 플랫폼 API 명세서

## 📋 개요
- **서비스명**: Dr.O AI 리뷰 분석 플랫폼
- **버전**: 1.0.0
- **기본 URL**: `http://localhost:8000`
- **인증**: 없음 (개발 환경)

## 🏗️ 아키텍처
```
Frontend (React + Vite) → Backend (FastAPI) → Database (PostgreSQL)
                     ↓
              Dummy Site (Flask)
```

## 📊 데이터베이스 스키마

### Review 테이블
```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(200) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    review_text TEXT NOT NULL,
    review_date TIMESTAMP NOT NULL,
    keywords JSON,
    generated_reply TEXT,
    reply_posted BOOLEAN DEFAULT FALSE,
    reply_posted_at TIMESTAMP,
    sentiment VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### SystemLog 테이블
```sql
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API 엔드포인트

### 1. 기본 정보
```http
GET /
```
**응답:**
```json
{
  "message": "AI 리뷰 답변 시스템 API",
  "version": "1.0.0",
  "endpoints": {
    "reviews": "/reviews/recent",
    "stats": "/stats",
    "scrape": "/scrape",
    "generate": "/generate-replies"
  }
}
```

### 2. 리뷰 관리

#### 2.1 최근 리뷰 조회
```http
GET /reviews/recent?limit=20&offset=0
```
**파라미터:**
- `limit` (int, optional): 조회할 리뷰 수 (기본값: 20)
- `offset` (int, optional): 건너뛸 리뷰 수 (기본값: 0)

**응답:**
```json
[
  {
    "id": 1,
    "customer_name": "김고객",
    "review_text": "정말 좋은 서비스입니다!",
    "review_date": "2024-01-15T10:30:00",
    "generated_reply": "감사합니다!",
    "keywords": ["서비스", "좋음"],
    "sentiment": "긍정",
    "reply_posted": true,
    "reply_posted_at": "2024-01-15T11:00:00"
  }
]
```

#### 2.2 답변 대기 리뷰 조회
```http
GET /reviews/pending
```
**응답:** 최근 리뷰 조회와 동일한 형식

#### 2.3 특정 리뷰 조회
```http
GET /reviews/{review_id}
```
**파라미터:**
- `review_id` (int): 리뷰 ID

**응답:** 단일 리뷰 객체

#### 2.4 답변 재생성
```http
POST /reviews/{review_id}/regenerate-reply
```
**파라미터:**
- `review_id` (int): 리뷰 ID

**응답:**
```json
{
  "success": true,
  "message": "답변이 재생성되었습니다"
}
```

### 3. 통계 및 분석

#### 3.1 기본 통계
```http
GET /stats
```
**응답:**
```json
{
  "total_reviews": 100,
  "replied_reviews": 85,
  "pending_reviews": 15,
  "positive_reviews": 60,
  "negative_reviews": 25,
  "neutral_reviews": 15
}
```

#### 3.2 감성 추이
```http
GET /stats/sentiment-trend?days=7
```
**파라미터:**
- `days` (int, optional): 조회할 일수 (기본값: 7)

**응답:**
```json
{
  "2024-01-15": {
    "긍정": 5,
    "부정": 2,
    "중립": 1
  },
  "2024-01-16": {
    "긍정": 3,
    "부정": 1,
    "중립": 0
  }
}
```

### 4. 작업 실행

#### 4.1 리뷰 스크래핑
```http
POST /scrape
```
**응답:**
```json
{
  "success": true,
  "message": "5개의 새로운 리뷰를 저장했습니다",
  "saved_count": 5
}
```

#### 4.2 AI 답변 생성
```http
POST /generate-replies?max_count=100
```
**파라미터:**
- `max_count` (int, optional): 처리할 최대 리뷰 수 (기본값: 100)

**응답:**
```json
{
  "success": true,
  "message": "10개의 답변을 생성했습니다",
  "processed_count": 10
}
```

#### 4.3 답변 게시
```http
POST /post-replies?max_count=10
```
**파라미터:**
- `max_count` (int, optional): 게시할 최대 답변 수 (기본값: 10)

**응답:**
```json
{
  "success": true,
  "message": "8개의 답변을 게시했습니다",
  "posted_count": 8
}
```

### 5. 고객 스토리

#### 5.1 고객 스토리 생성
```http
POST /generate-customer-story
```
**요청 본문:**
```json
{
  "name": "김고객",
  "totalReviews": 10,
  "positiveReviews": 8,
  "loyaltyScore": 85,
  "topKeywords": [
    {"keyword": "서비스", "count": 5},
    {"keyword": "친절", "count": 3}
  ],
  "firstReviewDate": "2024-01-01",
  "lastReviewDate": "2024-01-15",
  "reviewSamples": ["정말 좋습니다", "추천합니다"]
}
```

**응답:**
```json
{
  "story": "김고객님은 2024년 1월부터 꾸준히 리뷰를 작성하신 충성 고객입니다..."
}
```

### 6. 시스템 로그

#### 6.1 최근 로그 조회
```http
GET /logs/recent?limit=50
```
**파라미터:**
- `limit` (int, optional): 조회할 로그 수 (기본값: 50)

**응답:**
```json
[
  {
    "id": 1,
    "type": "scraping",
    "message": "스크래핑 작업 완료",
    "details": {"saved_count": 5},
    "created_at": "2024-01-15T10:30:00"
  }
]
```

## 🚨 에러 응답

### 일반적인 에러 형식
```json
{
  "detail": "에러 메시지"
}
```

### HTTP 상태 코드
- `200`: 성공
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

## 🔧 환경 변수

### Backend
- `GEMINI_API_KEY`: Google Gemini AI API 키
- `DUMMY_SITE_URL`: 더미 사이트 URL (기본값: http://dummy_site:5000)
- `DATABASE_URL`: PostgreSQL 연결 URL

### Frontend
- `VITE_API_URL`: 백엔드 API URL (기본값: http://localhost:8000)

## 📱 프론트엔드 API 서비스

### 주요 함수들
```javascript
// 리뷰 관련
getRecentReviews(limit, offset)
getPendingReviews()
getReview(reviewId)
regenerateReply(reviewId)

// 통계 관련
getStats()
getSentimentTrend(days)

// 작업 실행
triggerScraping()
triggerReplyGeneration(maxCount)
postReplies(maxCount)

// 고객 스토리
generateCustomerStory(customerData)

// 로그
getRecentLogs(limit)
```

## 🐳 Docker 구성

### 서비스 목록
1. **review_backend**: FastAPI 백엔드 서버 (포트: 8000)
2. **review_frontend**: React 프론트엔드 (포트: 3000)
3. **review_db**: PostgreSQL 데이터베이스 (포트: 5432)
4. **review_dummy_site**: Flask 더미 사이트 (포트: 5000)

### 실행 명령
```bash
docker-compose up -d
```

## 📈 성능 고려사항

1. **API 타임아웃**: 30초
2. **데이터베이스 연결 풀**: 기본 설정
3. **캐싱**: 현재 미구현 (향후 Redis 도입 고려)
4. **로딩 상태**: 프론트엔드에서 처리

## 🔒 보안 고려사항

1. **CORS**: 현재 모든 origin 허용 (프로덕션에서는 제한 필요)
2. **API 키**: 환경 변수로 관리
3. **입력 검증**: Pydantic 스키마로 처리
4. **SQL 인젝션**: SQLAlchemy ORM 사용으로 방지

## 📝 개발 가이드라인

1. **코드 스타일**: PEP 8 (Python), ESLint (JavaScript)
2. **커밋 메시지**: Conventional Commits
3. **API 문서**: FastAPI 자동 생성 문서 활용
4. **테스트**: pytest (백엔드), Jest (프론트엔드)

