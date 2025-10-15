# schemas.py - Pydantic 스키마
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ReviewBase(BaseModel):
    customer_name: str
    review_text: str
    review_url: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    review_date: datetime
    keywords: Optional[List[str]] = None
    sentiment: Optional[str] = None
    generated_reply: Optional[str] = None
    reply_posted: bool = False
    reply_posted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_reviews: int
    replied_reviews: int
    pending_reviews: int
    positive_count: int
    negative_count: int
    neutral_count: int