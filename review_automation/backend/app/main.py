from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import Review, SystemLog
from app.scraper import ReviewScraper
from app.llm_service import LLMService
from typing import List, Dict
from datetime import datetime, timedelta
from pydantic import BaseModel

app = FastAPI(title="AI 리뷰 답변 시스템")

# CORS 설정 (프론트엔드에서 API 호출 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 서비스 인스턴스
scraper = ReviewScraper()
llm_service = LLMService()


# === Pydantic 모델 (응답 스키마) ===
class ReviewResponse(BaseModel):
    id: int
    customer_name: str
    review_text: str
    review_date: datetime
    generated_reply: str | None
    keywords: list | None
    sentiment: str | None
    reply_posted: bool
    
    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total_reviews: int
    replied_reviews: int
    pending_reviews: int
    positive_reviews: int
    negative_reviews: int
    neutral_reviews: int


# === API 엔드포인트 ===

@app.get("/")
def read_root():
    return {
        "message": "AI 리뷰 답변 시스템 API",
        "version": "1.0.0",
        "endpoints": {
            "reviews": "/reviews/recent",
            "stats": "/stats",
            "scrape": "/scrape",
            "generate": "/generate-replies"
        }
    }


@app.get("/reviews/recent", response_model=List[ReviewResponse])
def get_recent_reviews(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """최근 리뷰 목록 조회"""
    reviews = db.query(Review)\
        .order_by(desc(Review.review_date))\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return reviews


@app.get("/reviews/pending", response_model=List[ReviewResponse])
def get_pending_reviews(db: Session = Depends(get_db)):
    """답변 대기 중인 리뷰 목록"""
    reviews = db.query(Review)\
        .filter(Review.generated_reply.is_(None))\
        .order_by(desc(Review.review_date))\
        .all()
    
    return reviews


@app.get("/reviews/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    """특정 리뷰 조회"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다")
    
    return review


@app.get("/stats", response_model=StatsResponse)
def get_statistics(db: Session = Depends(get_db)):
    """통계 데이터"""
    total = db.query(Review).count()
    replied = db.query(Review).filter(Review.generated_reply.isnot(None)).count()
    pending = total - replied
    
    positive = db.query(Review).filter(Review.sentiment == '긍정').count()
    negative = db.query(Review).filter(Review.sentiment == '부정').count()
    neutral = db.query(Review).filter(Review.sentiment == '중립').count()
    
    return StatsResponse(
        total_reviews=total,
        replied_reviews=replied,
        pending_reviews=pending,
        positive_reviews=positive,
        negative_reviews=negative,
        neutral_reviews=neutral
    )


@app.get("/stats/sentiment-trend")
def get_sentiment_trend(days: int = 7, db: Session = Depends(get_db)):
    """최근 N일간 감성 추이"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    reviews = db.query(
        func.date(Review.review_date).label('date'),
        Review.sentiment,
        func.count(Review.id).label('count')
    ).filter(
        Review.review_date >= cutoff_date
    ).group_by(
        func.date(Review.review_date),
        Review.sentiment
    ).all()
    
    # 날짜별로 데이터 구조화
    trend_data = {}
    for date, sentiment, count in reviews:
        date_str = str(date)
        if date_str not in trend_data:
            trend_data[date_str] = {"긍정": 0, "부정": 0, "중립": 0}
        trend_data[date_str][sentiment] = count
    
    return trend_data


@app.post("/scrape")
def trigger_scraping(db: Session = Depends(get_db)):
    """스크래핑 작업 실행"""
    try:
        saved_count = scraper.run_scraping_job(db)
        return {
            "success": True,
            "message": f"{saved_count}개의 새로운 리뷰를 저장했습니다",
            "saved_count": saved_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"스크래핑 실패: {str(e)}")


@app.post("/generate-replies")
def trigger_reply_generation(
    max_count: int = 10,
    db: Session = Depends(get_db)
):
    """LLM 답변 생성 작업 실행"""
    try:
        success_count = llm_service.process_all_pending_reviews(db, max_count)
        return {
            "success": True,
            "message": f"{success_count}개의 답변을 생성했습니다",
            "processed_count": success_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"답변 생성 실패: {str(e)}")


@app.post("/reviews/{review_id}/regenerate-reply")
def regenerate_reply(review_id: int, db: Session = Depends(get_db)):
    """특정 리뷰의 답변 재생성"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다")
    
    # 기존 답변 초기화
    review.generated_reply = None
    db.commit()
    
    # 답변 재생성
    success = llm_service.process_review(db, review_id)
    
    if success:
        return {"success": True, "message": "답변이 재생성되었습니다"}
    else:
        raise HTTPException(status_code=500, detail="답변 재생성 실패")


@app.get("/logs/recent")
def get_recent_logs(limit: int = 50, db: Session = Depends(get_db)):
    """최근 시스템 로그"""
    logs = db.query(SystemLog)\
        .order_by(desc(SystemLog.created_at))\
        .limit(limit)\
        .all()
    
    return [
        {
            "id": log.id,
            "type": log.log_type,
            "message": log.message,
            "details": log.details,
            "created_at": log.created_at
        }
        for log in logs
    ]
    
@app.post("/post-replies")
def post_replies_to_dummy_site(
    max_count: int = 10,
    db: Session = Depends(get_db)
):
    """생성된 답변을 더미 사이트에 자동 게시"""
    import os
    import requests
    
    try:
        # 답변이 생성되었지만 아직 게시되지 않은 리뷰 조회
        reviews_to_post = db.query(Review)\
            .filter(
                Review.generated_reply.isnot(None),
                Review.reply_posted == False
            )\
            .limit(max_count)\
            .all()
        
        if not reviews_to_post:
            return {
                "success": True,
                "message": "게시할 답변이 없습니다",
                "posted_count": 0
            }
        
        dummy_site_url = os.getenv("DUMMY_SITE_URL", "http://dummy_site:5000")
        posted_count = 0
        
        for review in reviews_to_post:
            try:
                # 더미 사이트에 답변 게시
                response = requests.post(
                    f"{dummy_site_url}/api/reviews/{review.source_id}/reply",
                    json={"reply": review.generated_reply},
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    # 게시 성공 표시
                    review.reply_posted = True
                    review.reply_posted_at = datetime.now()
                    posted_count += 1
                    
            except Exception as e:
                print(f"답변 게시 실패 (리뷰 ID: {review.id}): {str(e)}")
                continue
        
        db.commit()
        
        return {
            "success": True,
            "message": f"{posted_count}개의 답변을 게시했습니다",
            "posted_count": posted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"답변 게시 실패: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)