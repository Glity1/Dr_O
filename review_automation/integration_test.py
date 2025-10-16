"""
통합 테스트 스크립트
전체 플로우를 자동으로 테스트합니다.
"""
import requests
import time
import json
from datetime import datetime

# 설정
DUMMY_SITE_URL = "http://localhost:5000"
BACKEND_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_step(step_num, message):
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f"Step {step_num}: {message}")
    print(f"{'='*60}{Colors.END}\n")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.YELLOW}ℹ {message}{Colors.END}")

def wait_for_services():
    """모든 서비스가 준비될 때까지 대기"""
    print_step(0, "서비스 연결 확인 중...")
    
    services = {
        "Dummy Site": DUMMY_SITE_URL,
        "Backend API": f"{BACKEND_URL}/health",
    }
    
    for name, url in services.items():
        max_retries = 30
        for i in range(max_retries):
            try:
                response = requests.get(url, timeout=2)
                if response.status_code == 200:
                    print_success(f"{name} 연결 성공!")
                    break
            except requests.exceptions.RequestException:
                if i == max_retries - 1:
                    print_error(f"{name} 연결 실패")
                    return False
                print_info(f"{name} 대기 중... ({i+1}/{max_retries})")
                time.sleep(2)
    
    return True

def test_1_create_review():
    """테스트 1: 더미 사이트에 새 리뷰 작성"""
    print_step(1, "더미 사이트에 새 리뷰 작성")
    
    review_data = {
        "customer_name": f"테스트고객_{datetime.now().strftime('%H%M%S')}",
        "review_text": "음식이 정말 맛있었어요! 특히 파스타가 일품이었습니다. 다만 서빙이 조금 느렸어요.",
        "rating": 4
    }
    
    try:
        response = requests.post(
            f"{DUMMY_SITE_URL}/api/reviews",
            json=review_data,
            timeout=10
        )
        
        # 200 또는 201 모두 성공으로 처리
        if response.status_code in [200, 201]:
            review = response.json()
            print_success("리뷰 작성 성공!")
            print_info(f"작성자: {review['customer_name']}")
            print_info(f"내용: {review['review_text'][:50]}...")
            return review.get('id', review.get('review_id'))
        else:
            print_error(f"리뷰 작성 실패: {response.status_code}")
            print_error(f"응답: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"예외 발생: {str(e)}")
        return None

def test_2_scrape_reviews():
    """테스트 2: 백엔드에서 리뷰 스크래핑"""
    print_step(2, "백엔드에서 리뷰 스크래핑 트리거")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/scrape",  # /api/scrape → /scrape
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success("스크래핑 성공!")
            print_info(f"수집된 리뷰 수: {result.get('saved_count', 0)}")  # scraped_count → saved_count
            return True
        else:
            print_error(f"스크래핑 실패: {response.status_code}")
            print_error(f"응답: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"예외 발생: {str(e)}")
        return False

def test_3_generate_replies():
    """테스트 3: LLM 답변 생성"""
    print_step(3, "답변이 없는 리뷰에 대해 LLM 답변 생성")
    
    try:
        # 답변이 없는 리뷰 확인
        response = requests.get(
            f"{BACKEND_URL}/reviews/pending",  # /api/reviews/unanswered → /reviews/pending
            timeout=10
        )
        
        if response.status_code != 200:
            print_error("답변 없는 리뷰 조회 실패")
            return False
        
        unanswered_reviews = response.json()
        print_info(f"답변 없는 리뷰: {len(unanswered_reviews)}개")
        
        if len(unanswered_reviews) == 0:
            print_info("답변할 리뷰가 없습니다.")
            return True
        
        # 답변 생성
        response = requests.post(
            f"{BACKEND_URL}/generate-replies",  # /api/generate-replies → /generate-replies
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success("답변 생성 성공!")
            print_info(f"생성된 답변 수: {result.get('processed_count', 0)}")  # generated_count → processed_count
            
            # 생성된 답변 샘플 출력
            if result.get('processed_count', 0) > 0:
                response = requests.get(f"{BACKEND_URL}/reviews/recent", timeout=10)  # /api/reviews/recent → /reviews/recent
                if response.status_code == 200:
                    recent_reviews = response.json()
                    if recent_reviews:
                        print_info("\n생성된 답변 샘플:")
                        first_review = recent_reviews[0]
                        review_text = first_review.get('review_text', '')
                        reply_text = first_review.get('generated_reply', '')
                        
                        if review_text:
                            review_preview = review_text[:50] if len(review_text) > 50 else review_text
                        else:
                            review_preview = "(없음)"
                            
                        if reply_text:
                            reply_preview = reply_text[:100] if len(reply_text) > 100 else reply_text
                        else:
                            reply_preview = "(없음)"
                        
                        print(f"{Colors.YELLOW}{'─'*50}")
                        print(f"리뷰: {review_preview}...")
                        print(f"답변: {reply_preview}...")
                        print(f"{'─'*50}{Colors.END}")
            
            return True
        else:
            print_error(f"답변 생성 실패: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"예외 발생: {str(e)}")
        return False

def test_4_post_replies():
    """테스트 4: 더미 사이트에 답변 게시"""
    print_step(4, "생성된 답변을 더미 사이트에 자동 게시")
    
    try:
        # 답변이 생성되었지만 게시되지 않은 리뷰 확인
        response = requests.get(
            f"{BACKEND_URL}/reviews/recent?limit=50",
            timeout=10
        )
        
        if response.status_code != 200:
            print_error("리뷰 조회 실패")
            return False
        
        reviews = response.json()
        to_post = [r for r in reviews if r.get('generated_reply') and not r.get('reply_posted')]
        
        if not to_post:
            print_info("게시할 답변이 없습니다.")
            return True
        
        print_info(f"게시할 답변: {len(to_post)}개")
        
        posted_count = 0
        for review in to_post[:5]:  # 최대 5개만 테스트
            try:
                # 더미 사이트에 답변 게시
                response = requests.post(
                    f"{DUMMY_SITE_URL}/api/reviews/{review['source_id']}/reply",
                    json={"reply": review['generated_reply']},
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    posted_count += 1
                    print_success(f"답변 게시 성공 (리뷰 ID: {review['source_id']})")
                    
            except Exception as e:
                print_error(f"답변 게시 실패: {str(e)}")
                continue
        
        if posted_count > 0:
            print_success(f"총 {posted_count}개의 답변을 게시했습니다!")
            return True
        else:
            print_error("답변 게시 실패")
            return False
            
    except Exception as e:
        print_error(f"예외 발생: {str(e)}")
        return False

def test_5_verify_on_dummy_site():
    """테스트 5: 더미 사이트에서 답변 확인"""
    print_step(5, "더미 사이트에서 답변이 정상 게시되었는지 확인")
    
    try:
        response = requests.get(
            f"{DUMMY_SITE_URL}/api/reviews",
            timeout=10
        )
        
        if response.status_code == 200:
            reviews = response.json()
            replied_reviews = [r for r in reviews if r.get('reply')]
            
            print_success(f"더미 사이트 조회 성공!")
            print_info(f"전체 리뷰: {len(reviews)}개")
            print_info(f"답변이 달린 리뷰: {len(replied_reviews)}개")
            
            if replied_reviews:
                print_info("\n최근 답변 샘플:")
                latest = replied_reviews[-1]
                reply_text = latest.get('reply', '')
                review_text = latest.get('review_text', '')
                
                # None 체크 후 슬라이스
                if reply_text:
                    reply_preview = reply_text[:100] if len(reply_text) > 100 else reply_text
                else:
                    reply_preview = "(답변 없음)"
                
                if review_text:
                    review_preview = review_text[:50] if len(review_text) > 50 else review_text
                else:
                    review_preview = "(리뷰 없음)"
                
                print(f"{Colors.YELLOW}{'─'*50}")
                print(f"고객: {latest.get('customer_name', '알 수 없음')}")
                print(f"리뷰: {review_preview}...")
                print(f"답변: {reply_preview}...")
                print(f"{'─'*50}{Colors.END}")
            
            return True
        else:
            print_error(f"더미 사이트 조회 실패: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"예외 발생: {str(e)}")
        return False

def test_edge_cases():
    """엣지 케이스 테스트"""
    print_step(6, "엣지 케이스 테스트")
    
    edge_cases = [
        {
            "name": "매우 짧은 리뷰",
            "data": {
                "customer_name": "짧은리뷰테스트",
                "review_text": "좋아요",
                "rating": 5
            }
        },
        {
            "name": "매우 긴 리뷰",
            "data": {
                "customer_name": "긴리뷰테스트",
                "review_text": "정말 훌륭한 경험이었습니다. " * 50,
                "rating": 5
            }
        },
        {
            "name": "부정적 리뷰",
            "data": {
                "customer_name": "부정적리뷰테스트",
                "review_text": "음식이 차갑게 나왔고 서비스도 불친절했습니다. 다시 가고 싶지 않아요.",
                "rating": 1
            }
        },
        {
            "name": "특수문자 포함 리뷰",
            "data": {
                "customer_name": "특수문자테스트",
                "review_text": "음식 👍👍👍 완전 대박!!! @#$% 최고예요 ㅋㅋㅋ",
                "rating": 5
            }
        }
    ]
    
    passed = 0
    failed = 0
    
    for case in edge_cases:
        print(f"\n{Colors.YELLOW}테스트: {case['name']}{Colors.END}")
        try:
            # 리뷰 작성
            response = requests.post(
                f"{DUMMY_SITE_URL}/api/reviews",
                json=case['data'],
                timeout=10
            )
            
            # 200 또는 201 모두 성공
            if response.status_code in [200, 201]:
                print_success(f"리뷰 작성 성공")
                passed += 1
            else:
                print_error(f"리뷰 작성 실패: {response.status_code}")
                failed += 1
                
        except Exception as e:
            print_error(f"예외 발생: {str(e)}")
            failed += 1
        
        time.sleep(1)
    
    print(f"\n{Colors.BLUE}엣지 케이스 테스트 결과:{Colors.END}")
    print_success(f"통과: {passed}/{len(edge_cases)}")
    if failed > 0:
        print_error(f"실패: {failed}/{len(edge_cases)}")
    
    return failed == 0

def main():
    print(f"{Colors.BLUE}")
    print("=" * 60)
    print("  리뷰 자동화 시스템 통합 테스트")
    print("=" * 60)
    print(f"{Colors.END}")
    
    # 서비스 대기
    if not wait_for_services():
        print_error("\n서비스 연결 실패. docker-compose up 상태를 확인하세요.")
        return
    
    time.sleep(2)
    
    # 테스트 실행
    results = {
        "리뷰 작성": test_1_create_review() is not None,
        "리뷰 스크래핑": test_2_scrape_reviews(),
        "답변 생성": test_3_generate_replies(),
        "답변 게시": test_4_post_replies(),
        "답변 확인": test_5_verify_on_dummy_site(),
        "엣지 케이스": test_edge_cases()
    }
    
    # 결과 요약
    print(f"\n{Colors.BLUE}{'='*60}")
    print("  테스트 결과 요약")
    print(f"{'='*60}{Colors.END}\n")
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}: 통과")
        else:
            print_error(f"{test_name}: 실패")
    
    print(f"\n{Colors.BLUE}전체 결과: {passed}/{total} 통과{Colors.END}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}🎉 모든 테스트 통과! 시스템이 정상 작동합니다.{Colors.END}")
    else:
        print(f"\n{Colors.RED}⚠️  일부 테스트 실패. 로그를 확인하세요.{Colors.END}")

if __name__ == "__main__":
    main()