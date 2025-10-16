from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base
import json

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # 리뷰 원본 URL 또는 ID (중복 체크용) - 맨 위로 이동
    source_id = Column(String(200), unique=True, nullable=False, index=True)
    
    # 리뷰 기본 정보
    customer_name = Column(String(100), nullable=False)
    review_text = Column(Text, nullable=False)
    review_date = Column(DateTime, nullable=False)
    
    # 키워드 (JSON 형태로 저장)
    keywords = Column(JSON, nullable=True)
    
    # LLM 생성 답변
    generated_reply = Column(Text, nullable=True)
    
    # 답변 상태
    reply_posted = Column(Boolean, default=False)
    reply_posted_at = Column(DateTime, nullable=True)
    
    # 감성 분석 (긍정/부정/중립)
    sentiment = Column(String(20), nullable=True)
    
    # 타임스탬프
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Review(id={self.id}, customer={self.customer_name}, date={self.review_date})>"


class SystemLog(Base):
    """시스템 로그 테이블 (스크래핑 이력, 에러 등 기록)"""
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    log_type = Column(String(50), nullable=False)  # scraping, llm, posting, error
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<SystemLog(type={self.log_type}, time={self.created_at})>"