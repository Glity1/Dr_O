import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.models import Review, SystemLog
import time

load_dotenv()

class ReviewScraper:
    def __init__(self, base_url: str = None):
        self.base_url = base_url or os.getenv("DUMMY_SITE_URL", "http://localhost:5000")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def scrape_reviews(self) -> List[Dict]:
        """더미 사이트에서 리뷰를 스크래핑 (API 방식)"""
        try:
            # 더미 사이트는 JSON API를 제공하므로 직접 API를 호출
            api_url = f"{self.base_url}/api/reviews"
            print(f"🔍 {api_url} 에서 리뷰 수집 중...")
            
            response = self.session.get(api_url, timeout=10)
            response.raise_for_status()
            
            # JSON 데이터 파싱
            reviews_data = response.json()
            reviews = []
            
            for review in reviews_data:
                try:
                    # 날짜 파싱 (더미 사이트는 'YYYY-MM-DD' 형식)
                    review_date_str = review.get('date', '')
                    # 시간이 없으면 00:00:00 추가
                    if len(review_date_str) == 10:  # YYYY-MM-DD
                        review_date_str += ' 00:00:00'
                    
                    review_date = datetime.strptime(review_date_str, '%Y-%m-%d %H:%M:%S')
                    
                    reviews.append({
                        'source_id': f"dummy_{review['id']}",
                        'customer_name': review.get('customer_name', '익명'),
                        'review_text': review.get('review_text', ''),
                        'review_date': review_date
                    })
                    
                except Exception as e:
                    print(f"⚠️  개별 리뷰 파싱 에러: {e}")
                    print(f"    문제 리뷰 데이터: {review}")
                    continue
            
            print(f"✓ {len(reviews)}개의 리뷰를 수집했습니다.")
            return reviews
            
        except requests.RequestException as e:
            print(f"❌ 스크래핑 실패: {e}")
            return []
    
    def save_reviews_to_db(self, db: Session, reviews: List[Dict]) -> int:
        """수집한 리뷰를 DB에 저장 (중복 체크)"""
        saved_count = 0
        
        for review_data in reviews:
            try:
                # 중복 체크
                existing = db.query(Review).filter(
                    Review.source_id == review_data['source_id']
                ).first()
                
                if existing:
                    print(f"⏭️  이미 존재하는 리뷰: {review_data['source_id']}")
                    continue
                
                # 새 리뷰 저장
                new_review = Review(**review_data)
                db.add(new_review)
                db.commit()
                saved_count += 1
                print(f"✓ 새 리뷰 저장: {review_data['customer_name']} - {review_data['source_id']}")
                
            except Exception as e:
                db.rollback()
                print(f"❌ 리뷰 저장 실패: {e}")
                
                # 에러 로그 저장
                log = SystemLog(
                    log_type="error",
                    message=f"리뷰 저장 실패: {review_data.get('source_id')}",
                    details={"error": str(e), "review_data": review_data}
                )
                db.add(log)
                db.commit()
        
        return saved_count
    
    def run_scraping_job(self, db: Session):
        """스크래핑 작업 실행 (로깅 포함)"""
        start_time = time.time()
        
        # 시작 로그
        log = SystemLog(
            log_type="scraping",
            message="스크래핑 작업 시작",
            details={"url": self.base_url}
        )
        db.add(log)
        db.commit()
        
        try:
            reviews = self.scrape_reviews()
            saved_count = self.save_reviews_to_db(db, reviews)
            
            elapsed = round(time.time() - start_time, 2)
            
            # 완료 로그
            log = SystemLog(
                log_type="scraping",
                message=f"스크래핑 완료: {saved_count}개 저장",
                details={
                    "total_scraped": len(reviews),
                    "saved_count": saved_count,
                    "elapsed_seconds": elapsed
                }
            )
            db.add(log)
            db.commit()
            
            print(f"\n📊 스크래핑 결과:")
            print(f"   - 수집: {len(reviews)}개")
            print(f"   - 저장: {saved_count}개")
            print(f"   - 소요시간: {elapsed}초")
            
            return saved_count
            
        except Exception as e:
            # 에러 로그
            log = SystemLog(
                log_type="error",
                message=f"스크래핑 작업 실패: {str(e)}",
                details={"error": str(e)}
            )
            db.add(log)
            db.commit()
            raise


# 테스트용 실행 코드
if __name__ == "__main__":
    from database import SessionLocal
    
    scraper = ReviewScraper()
    db = SessionLocal()
    
    try:
        scraper.run_scraping_job(db)
    finally:
        db.close()