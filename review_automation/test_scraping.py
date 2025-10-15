# test_scraping.py - 스크래핑 테스트 스크립트
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
from typing import List, Dict
import time

class ReviewScraperTest:
    """리뷰 스크래핑 테스트 클래스"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def test_connection(self) -> bool:
        """더미 사이트 연결 테스트"""
        print(f"\n[1] 더미 사이트 연결 테스트: {self.base_url}")
        print("-" * 50)
        
        try:
            response = self.session.get(self.base_url)
            if response.status_code == 200:
                print("✅ 연결 성공! (Status: 200)")
                print(f"   응답 크기: {len(response.text)} bytes")
                return True
            else:
                print(f"❌ 연결 실패 (Status: {response.status_code})")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ 연결 실패: 더미 사이트가 실행 중인지 확인하세요!")
            print("   다음 명령으로 더미 사이트를 실행하세요:")
            print("   cd dummy_site")
            print("   python app.py")
            return False
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            return False
    
    def scrape_reviews_api(self) -> List[Dict]:
        """API를 통한 리뷰 데이터 수집"""
        print(f"\n[2] API를 통한 리뷰 스크래핑")
        print("-" * 50)
        
        try:
            response = self.session.get(f"{self.base_url}/api/reviews")
            response.raise_for_status()
            
            reviews = response.json()
            print(f"✅ {len(reviews)}개의 리뷰를 가져왔습니다!")
            
            # 리뷰 내용 출력
            for i, review in enumerate(reviews, 1):
                print(f"\n📝 리뷰 #{i}")
                print(f"   ID: {review.get('id')}")
                print(f"   작성자: {review.get('customer_name')}")
                print(f"   평점: {'⭐' * review.get('rating', 0)}")
                print(f"   날짜: {review.get('date')}")
                print(f"   내용: {review.get('review_text')[:50]}...")
                
                if review.get('reply'):
                    print(f"   💬 답변: {review['reply']['text'][:50]}...")
                else:
                    print(f"   💬 답변: 없음")
            
            return reviews
            
        except Exception as e:
            print(f"❌ API 스크래핑 실패: {e}")
            return []
    
    def scrape_reviews_html(self) -> List[Dict]:
        """HTML 파싱을 통한 리뷰 데이터 수집"""
        print(f"\n[3] HTML 파싱을 통한 리뷰 스크래핑")
        print("-" * 50)
        
        try:
            # HTML 페이지 가져오기
            response = self.session.get(f"{self.base_url}/reviews")
            response.raise_for_status()
            
            # BeautifulSoup으로 파싱
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # JavaScript로 동적 생성되는 컨텐츠이므로 직접 파싱은 어려움
            print("⚠️ HTML은 동적으로 생성되므로 API 방식을 권장합니다.")
            
            # 대신 페이지 구조 확인
            title = soup.find('h1')
            if title:
                print(f"   페이지 제목: {title.text}")
            
            container = soup.find('div', class_='container')
            if container:
                print("   ✅ 리뷰 컨테이너 발견")
            
            return []
            
        except Exception as e:
            print(f"❌ HTML 파싱 실패: {e}")
            return []
    
    def add_test_review(self, name: str, text: str, rating: int = 5) -> bool:
        """테스트 리뷰 추가"""
        print(f"\n[4] 테스트 리뷰 추가")
        print("-" * 50)
        
        data = {
            "customer_name": name,
            "review_text": text,
            "rating": rating
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/reviews",
                json=data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 리뷰 추가 성공!")
                print(f"   ID: {result['review']['id']}")
                print(f"   작성자: {result['review']['customer_name']}")
                print(f"   내용: {result['review']['review_text']}")
                return True
            else:
                print(f"❌ 리뷰 추가 실패 (Status: {response.status_code})")
                return False
                
        except Exception as e:
            print(f"❌ 리뷰 추가 중 오류: {e}")
            return False
    
    def add_reply_to_review(self, review_id: str, reply_text: str) -> bool:
        """리뷰에 답변 추가"""
        print(f"\n[5] 리뷰에 답변 추가")
        print("-" * 50)
        
        data = {
            "review_id": review_id,
            "reply_text": reply_text
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/reply",
                json=data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                print(f"✅ 답변 추가 성공!")
                print(f"   리뷰 ID: {review_id}")
                print(f"   답변: {reply_text}")
                return True
            else:
                print(f"❌ 답변 추가 실패 (Status: {response.status_code})")
                return False
                
        except Exception as e:
            print(f"❌ 답변 추가 중 오류: {e}")
            return False
    
    def run_full_test(self):
        """전체 테스트 실행"""
        print("\n" + "="*60)
        print("🧪 리뷰 스크래핑 전체 테스트 시작")
        print("="*60)
        
        # 1. 연결 테스트
        if not self.test_connection():
            print("\n❌ 연결 실패로 테스트 중단")
            return False
        
        # 2. API 스크래핑
        reviews = self.scrape_reviews_api()
        
        # 3. HTML 파싱 테스트
        self.scrape_reviews_html()
        
        # 4. 새 리뷰 추가 테스트
        test_review_added = self.add_test_review(
            name="테스트 사용자",
            text="자동 테스트로 추가된 리뷰입니다. 카페가 너무 좋아요!",
            rating=4
        )
        
        # 5. 답변 추가 테스트 (첫 번째 리뷰에)
        if reviews and len(reviews) > 0:
            first_review = reviews[0]
            if not first_review.get('reply'):
                self.add_reply_to_review(
                    review_id=first_review['id'],
                    reply_text="테스트 답변입니다. 소중한 리뷰 감사합니다!"
                )
        
        # 6. 변경사항 확인
        print(f"\n[6] 변경사항 확인")
        print("-" * 50)
        time.sleep(1)  # 잠시 대기
        updated_reviews = self.scrape_reviews_api()
        
        print("\n" + "="*60)
        print("📊 테스트 결과 요약")
        print("="*60)
        print(f"✅ 초기 리뷰 수: {len(reviews)}개")
        print(f"✅ 테스트 후 리뷰 수: {len(updated_reviews)}개")
        print(f"✅ 답변이 있는 리뷰: {sum(1 for r in updated_reviews if r.get('reply'))}개")
        
        return True


# 단독 실행 테스트
if __name__ == "__main__":
    print("\n🚀 스크래핑 테스트 스크립트")
    print("="*60)
    print("이 스크립트는 더미 사이트의 리뷰를 스크래핑합니다.")
    print("더미 사이트(http://localhost:5000)가 실행 중이어야 합니다.")
    print("="*60)
    
    # 스크래퍼 생성 및 테스트 실행
    scraper = ReviewScraperTest()
    
    # 전체 테스트 실행
    success = scraper.run_full_test()
    
    if success:
        print("\n✅ 모든 테스트 완료!")
        print("\n다음 단계:")
        print("1. backend 폴더에 이 스크래핑 로직을 통합")
        print("2. LLM 연동하여 자동 답변 생성")
        print("3. 데이터베이스에 저장")
    else:
        print("\n❌ 테스트 중 문제가 발생했습니다.")
        print("더미 사이트가 실행 중인지 확인하세요.")
        
    print("\n" + "="*60)