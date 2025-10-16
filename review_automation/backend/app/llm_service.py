import os
import logging
import warnings

# gRPC 경고 억제
os.environ['GRPC_VERBOSITY'] = 'ERROR'
os.environ['GRPC_TRACE'] = ''
logging.getLogger('absl').setLevel(logging.ERROR)
warnings.filterwarnings('ignore')

import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional, Dict
from sqlalchemy.orm import Session
from app.models import Review, SystemLog
import time

load_dotenv()

class LLMService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다.")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-lite')
        
        # 기본 프롬프트 설정
        self.system_prompt = """당신은 친절하고 전문적인 식당 사장님입니다.
고객의 리뷰에 진심어린 답변을 작성해주세요.

답변 작성 가이드라인:
1. 고객의 이름을 언급하며 감사 인사로 시작하세요
2. 리뷰의 핵심 내용(긍정적/부정적)에 구체적으로 반응하세요
3. 긍정적 리뷰: 감사함을 표현하고 다음 방문을 기대한다고 말하세요
4. 부정적 리뷰: 진심으로 사과하고 개선 의지를 보여주세요
5. 2-3문장으로 간결하게 작성하세요
6. 자연스럽고 따뜻한 한국어 구어체를 사용하세요
7. 과도한 존댓말이나 형식적인 표현은 피하세요
"""
    
    def generate_reply(self, review: Review) -> Optional[str]:
        """리뷰에 대한 답변 생성"""
        try:
            prompt = f"""{self.system_prompt}

고객명: {review.customer_name}
리뷰 내용: {review.review_text}

위 리뷰에 대한 답변을 작성해주세요:"""

            print(f"🤖 LLM 답변 생성 중... (리뷰 ID: {review.id})")
            
            response = self.model.generate_content(prompt)
            generated_reply = response.text.strip()
            
            print(f"✓ 답변 생성 완료: {generated_reply[:50]}...")
            return generated_reply
            
        except Exception as e:
            print(f"❌ LLM 답변 생성 실패: {e}")
            return None
    
    def extract_keywords(self, review_text: str) -> list:
        """리뷰에서 키워드 추출 (간단한 버전)"""
        try:
            prompt = f"""다음 리뷰에서 핵심 키워드를 3-5개 추출해주세요.
음식, 서비스, 분위기 등 주요 요소를 중심으로 추출하세요.
결과는 쉼표로 구분된 단어만 반환하세요.

리뷰: {review_text}

키워드:"""

            response = self.model.generate_content(prompt)
            keywords_str = response.text.strip()
            keywords = [k.strip() for k in keywords_str.split(',')]
            
            return keywords[:5]  # 최대 5개
            
        except Exception as e:
            print(f"⚠️  키워드 추출 실패: {e}")
            return []
    
    def analyze_sentiment(self, review_text: str) -> str:
        """감성 분석 (긍정/부정/중립)"""
        try:
            prompt = f"""다음 리뷰의 감성을 분석하세요.
'긍정', '부정', '중립' 중 하나만 반환하세요.

리뷰: {review_text}

감성:"""

            response = self.model.generate_content(prompt)
            sentiment = response.text.strip()
            
            # 결과 정규화
            if '긍정' in sentiment:
                return '긍정'
            elif '부정' in sentiment:
                return '부정'
            else:
                return '중립'
                
        except Exception as e:
            print(f"⚠️  감성 분석 실패: {e}")
            return '중립'
    
    def process_review(self, db: Session, review_id: int) -> bool:
        """리뷰를 처리하여 답변 생성 및 DB 업데이트"""
        try:
            review = db.query(Review).filter(Review.id == review_id).first()
            
            if not review:
                print(f"❌ 리뷰를 찾을 수 없음: ID {review_id}")
                return False
            
            if review.generated_reply:
                print(f"⏭️  이미 답변이 생성된 리뷰: ID {review_id}")
                return False
            
            print(f"\n{'='*50}")
            print(f"📝 리뷰 처리 시작 (ID: {review.id})")
            print(f"고객: {review.customer_name}")
            print(f"리뷰: {review.review_text[:100]}...")
            print(f"{'='*50}")
            
            # 답변 생성
            reply = self.generate_reply(review)
            if not reply:
                return False
            
            # 키워드 추출
            keywords = self.extract_keywords(review.review_text)
            
            # 감성 분석
            sentiment = self.analyze_sentiment(review.review_text)
            
            # DB 업데이트
            review.generated_reply = reply
            review.keywords = keywords
            review.sentiment = sentiment
            db.commit()
            
            # 성공 로그
            log = SystemLog(
                log_type="llm",
                message=f"답변 생성 완료: 리뷰 ID {review.id}",
                details={
                    "review_id": review.id,
                    "keywords": keywords,
                    "sentiment": sentiment,
                    "reply_length": len(reply)
                }
            )
            db.add(log)
            db.commit()
            
            print(f"\n✅ 처리 완료!")
            print(f"   답변: {reply}")
            print(f"   키워드: {keywords}")
            print(f"   감성: {sentiment}\n")
            
            return True
            
        except Exception as e:
            db.rollback()
            print(f"❌ 리뷰 처리 실패: {e}")
            
            # 에러 로그
            log = SystemLog(
                log_type="error",
                message=f"리뷰 처리 실패: ID {review_id}",
                details={"error": str(e)}
            )
            db.add(log)
            db.commit()
            
            return False
    
    def process_all_pending_reviews(self, db: Session, max_count: int = 10):
        """답변이 없는 모든 리뷰 처리"""
        pending_reviews = db.query(Review).filter(
            Review.generated_reply.is_(None)
        ).limit(max_count).all()
        
        print(f"\n🚀 {len(pending_reviews)}개의 대기 중인 리뷰 처리 시작...\n")
        
        success_count = 0
        for review in pending_reviews:
            if self.process_review(db, review.id):
                success_count += 1
            time.sleep(1)  # API rate limit 고려
        
        print(f"\n📊 처리 완료: {success_count}/{len(pending_reviews)}개 성공")
        return success_count


# 테스트용 실행 코드
if __name__ == "__main__":
    from database import SessionLocal
    
    llm_service = LLMService()
    db = SessionLocal()
    
    try:
        # 모든 대기 중인 리뷰 처리
        llm_service.process_all_pending_reviews(db)
    finally:
        db.close()