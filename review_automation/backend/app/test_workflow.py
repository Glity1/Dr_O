"""
전체 워크플로우 테스트 스크립트
1. 더미 사이트에서 리뷰 스크래핑
2. LLM으로 답변 생성
3. 결과 확인
"""

from database import SessionLocal
from scraper import ReviewScraper
from llm_service import LLMService
from models import Review, SystemLog
import time

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def test_scraping():
    """스크래핑 테스트"""
    print_header("1단계: 리뷰 스크래핑 테스트")
    
    db = SessionLocal()
    scraper = ReviewScraper()
    
    try:
        saved_count = scraper.run_scraping_job(db)
        print(f"\n✅ 스크래핑 성공: {saved_count}개의 새 리뷰 저장")
        return True
    except Exception as e:
        print(f"\n❌ 스크래핑 실패: {e}")
        return False
    finally:
        db.close()

def test_llm_generation():
    """LLM 답변 생성 테스트"""
    print_header("2단계: LLM 답변 생성 테스트")
    
    db = SessionLocal()
    llm_service = LLMService()
    
    try:
        # 답변이 없는 리뷰 찾기
        pending_reviews = db.query(Review).filter(
            Review.generated_reply.is_(None)
        ).limit(3).all()
        
        if not pending_reviews:
            print("⚠️  답변 대기 중인 리뷰가 없습니다.")
            return False
        
        print(f"\n{len(pending_reviews)}개의 리뷰에 대한 답변 생성 중...\n")
        
        success_count = 0
        for review in pending_reviews:
            if llm_service.process_review(db, review.id):
                success_count += 1
            time.sleep(2)  # API rate limit 고려
        
        print(f"\n✅ 답변 생성 완료: {success_count}/{len(pending_reviews)}개 성공")
        return True
        
    except Exception as e:
        print(f"\n❌ 답변 생성 실패: {e}")
        return False
    finally:
        db.close()

def show_results():
    """결과 확인"""
    print_header("3단계: 결과 확인")
    
    db = SessionLocal()
    
    try:
        # 통계
        total = db.query(Review).count()
        replied = db.query(Review).filter(Review.generated_reply.isnot(None)).count()
        
        print(f"\n📊 전체 통계:")
        print(f"   - 총 리뷰: {total}개")
        print(f"   - 답변 완료: {replied}개")
        print(f"   - 답변 대기: {total - replied}개")
        
        # 최근 답변 샘플
        recent_reviews = db.query(Review).filter(
            Review.generated_reply.isnot(None)
        ).order_by(Review.updated_at.desc()).limit(3).all()
        
        if recent_reviews:
            print(f"\n📝 최근 생성된 답변 (샘플):")
            for i, review in enumerate(recent_reviews, 1):
                print(f"\n[{i}] {review.customer_name}님의 리뷰")
                print(f"    리뷰: {review.review_text[:50]}...")
                print(f"    답변: {review.generated_reply}")
                print(f"    키워드: {review.keywords}")
                print(f"    감성: {review.sentiment}")
        
    finally:
        db.close()

def show_logs():
    """시스템 로그 확인"""
    print_header("시스템 로그")
    
    db = SessionLocal()
    
    try:
        logs = db.query(SystemLog).order_by(
            SystemLog.created_at.desc()
        ).limit(5).all()
        
        for log in logs:
            print(f"\n[{log.log_type.upper()}] {log.created_at}")
            print(f"   {log.message}")
            if log.details:
                print(f"   상세: {log.details}")
        
    finally:
        db.close()

def main():
    """전체 테스트 실행"""
    print("\n" + "🚀 "*20)
    print("   AI 리뷰 답변 시스템 - 통합 테스트")
    print("🚀 "*20)
    
    # 1. 스크래핑
    if not test_scraping():
        print("\n⚠️  스크래핑 실패. 더미 사이트가 실행 중인지 확인하세요.")
        return
    
    time.sleep(2)
    
    # 2. LLM 답변 생성
    if not test_llm_generation():
        print("\n⚠️  답변 생성 실패. 일단 Gemini API 키를 확인하세요.")
        return
    
    time.sleep(2)
    
    # 3. 결과 확인
    show_results()
    
    # 4. 로그 확인
    show_logs()
    
    print("\n" + "✨ "*20)
    print("   테스트 완료!")
    print("✨ "*20)
    print("\n💡 다음 단계:")
    print("   1. 백엔드 서버 실행: python main.py")
    print("   2. 브라우저에서 http://localhost:8000/docs 접속")
    print("   3. API 엔드포인트 테스트")
    print()

if __name__ == "__main__":
    main()