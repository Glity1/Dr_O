# crud.py - 데이터베이스 CRUD 작업
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app import models, schemas

def create_review(db: Session, review_data: dict) -> models.Review:
    """새 리뷰 생성"""
    db_review = models.Review(**review_data)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_review(db: Session, review_id: int) -> Optional[models.Review]:
    """특정 리뷰 조회"""
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def get_reviews(db: Session, skip: int = 0, limit: int = 100) -> List[models.Review]:
    """리뷰 목록 조회"""
    return db.query(models.Review).offset(skip).limit(limit).all()

def get_pending_reviews(db: Session) -> List[models.Review]:
    """답변 대기 중인 리뷰 조회"""
    return db.query(models.Review).filter(
        models.Review.generated_reply == None
    ).all()

def update_review_reply(db: Session, review_id: int, reply_text: str) -> Optional[models.Review]:
    """리뷰에 답변 추가"""
    review = get_review(db, review_id)
    if review:
        review.generated_reply = reply_text
        review.updated_at = datetime.now()
        db.commit()
        db.refresh(review)
    return review

def mark_reply_posted(db: Session, review_id: int) -> Optional[models.Review]:
    """답변 게시 완료 표시"""
    review = get_review(db, review_id)
    if review:
        review.reply_posted = True
        review.reply_posted_at = datetime.now()
        db.commit()
        db.refresh(review)
    return review

def get_stats(db: Session) -> dict:
    """통계 데이터 조회"""
    total = db.query(models.Review).count()
    replied = db.query(models.Review).filter(models.Review.generated_reply != None).count()
    posted = db.query(models.Review).filter(models.Review.reply_posted == True).count()
    
    positive = db.query(models.Review).filter(models.Review.sentiment == 'positive').count()
    negative = db.query(models.Review).filter(models.Review.sentiment == 'negative').count()
    neutral = db.query(models.Review).filter(models.Review.sentiment == 'neutral').count()
    
    return {
        'total_reviews': total,
        'replied_reviews': replied,
        'posted_replies': posted,
        'pending_reviews': total - replied,
        'positive_count': positive,
        'negative_count': negative,
        'neutral_count': neutral
    }