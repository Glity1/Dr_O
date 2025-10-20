from flask import Flask, render_template, request, jsonify
from datetime import datetime
import uuid
import json
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dummy-secret-key'

# 간단한 파일 기반 스토리지
DATA_FILE = 'reviews_data.json'

def load_reviews():
    """저장된 리뷰 데이터 로드"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_reviews(reviews):
    """리뷰 데이터 저장"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)

# 최근 7일간의 더미 데이터 추가
from datetime import datetime, timedelta

def get_recent_dates():
    """최근 7일간의 날짜 리스트 생성"""
    today = datetime.now()
    dates = []
    for i in range(7):
        date = today - timedelta(days=i)
        dates.append(date.strftime("%Y-%m-%d"))
    return dates

def generate_recent_reviews():
    """최근 7일간의 더미 리뷰 데이터 생성"""
    dates = get_recent_dates()
    reviews = []
    
    # VIP 고객 데이터 (2명)
    vip_customers = [
        {
            "name": "김VIP",
            "templates": [
                "정말 최고의 카페입니다! 매일 와도 질리지 않아요. 직원분들도 친절하고 커피 맛도 완벽해요. 단골 1년째입니다!",
                "이 카페 덕분에 하루가 즐거워져요. 시그니처 메뉴 다 맛있고 분위기도 최고입니다. 강력 추천!",
                "친구들한테 자랑하고 다니는 카페예요. 가격도 합리적이고 서비스도 훌륭합니다. 계속 방문할 예정이에요!"
            ]
        },
        {
            "name": "박골드",
            "templates": [
                "이 카페는 정말 특별해요! 매번 새로운 메뉴가 나와서 기대됩니다. 직원분들도 항상 웃으며 맞아주세요.",
                "커피의 품질이 정말 뛰어나요. 원두도 좋고 추출도 완벽합니다. 이 정도 퀄리티면 가격이 아깝지 않아요!",
                "디저트와 커피의 조화가 완벽해요. 특히 케이크가 정말 맛있어서 매번 주문합니다. 최고의 카페입니다!"
            ]
        }
    ]
    
    # 충성 고객 데이터 (5명)
    loyal_customers = [
        {
            "name": "이충성",
            "templates": [
                "좋은 카페네요! 커피 맛도 괜찮고 분위기도 좋아요. 가끔 방문하는데 만족합니다.",
                "직원분들이 친절하시고 서비스가 좋아요. 가격 대비 만족스럽습니다.",
                "이 카페에서 공부하기 좋아요. 조용하고 편안한 분위기입니다."
            ]
        },
        {
            "name": "최단골",
            "templates": [
                "단골 6개월째입니다. 매번 일관된 맛과 서비스에 만족해요. 계속 방문할 예정입니다.",
                "가격이 조금 비싸긴 하지만 품질이 좋아서 괜찮아요. 특히 아메리카노가 맛있어요.",
                "친구들과 자주 오는 카페예요. 모두 만족하고 있습니다."
            ]
        },
        {
            "name": "정애정",
            "templates": [
                "이 카페 분위기가 정말 좋아요! 사진 찍기도 좋고 인스타에 올리기 좋습니다.",
                "커피 맛은 보통이지만 분위기와 서비스가 좋아서 자주 와요.",
                "직원분들이 항상 밝게 맞아주셔서 기분이 좋아집니다."
            ]
        },
        {
            "name": "한사랑",
            "templates": [
                "가격 대비 괜찮은 카페예요. 특별히 맛있지는 않지만 나쁘지도 않아요.",
                "조용해서 공부하기 좋습니다. 커피도 괜찮고요.",
                "친구 추천으로 왔는데 나쁘지 않네요. 가끔 올 것 같아요."
            ]
        },
        {
            "name": "오만족",
            "templates": [
                "이 카페에서 일하는 것 같아요. 매일 오는데 항상 일관된 품질입니다.",
                "가격이 좀 있지만 커피 품질이 좋아서 괜찮아요. 단골이 될 것 같습니다.",
                "직원분들이 친절하고 서비스가 좋아요. 추천합니다!"
            ]
        }
    ]
    
    # 블랙리스트 고객 데이터 (2명)
    blacklist_customers = [
        {
            "name": "김악성",
            "templates": [
                "최악의 카페입니다. 커피도 맛없고 직원도 불친절해요. 돈이 아까워요.",
                "다시는 안 올 카페예요. 서비스도 엉망이고 음식도 맛없어요. 비추천!",
                "정말 실망스러운 카페입니다. 기대했던 것과 완전 달라요. 돈 날렸어요.",
                "직원이 무뚝뚝하고 서비스가 최악이에요. 이런 카페는 처음 봅니다.",
                "가격만 비싸고 품질은 형편없어요. 절대 추천하지 않습니다."
            ]
        },
        {
            "name": "박불만",
            "templates": [
                "정말 별로예요. 커피도 시원하고 맛도 없어요. 직원도 불친절하고...",
                "이런 카페가 어떻게 운영되는지 모르겠어요. 서비스가 엉망입니다.",
                "돈 주고 화받는 카페네요. 다시는 안 올 거예요.",
                "최악의 경험이었습니다. 친구들한테도 비추천할게요.",
                "정말 실망이에요. 기대했던 것과 완전 달라요."
            ]
        }
    ]
    
    # 각 날짜별로 다양한 감성의 리뷰 생성
    review_templates = [
        # 긍정적 리뷰들
        {
            "customer_name": "김민수",
            "review_text": "커피가 정말 맛있어요! 분위기도 아늑하고 직원분들도 친절하시네요. 다음에 또 방문하고 싶습니다.",
            "rating": 5
        },
        {
            "customer_name": "이영희",
            "review_text": "세 번째 방문인데 역시 실망시키지 않네요. 오늘 주문한 플랫화이트 완벽했습니다. 단골 확정!",
            "rating": 5
        },
        {
            "customer_name": "박철수",
            "review_text": "친구들에게도 추천해서 같이 왔는데 모두 만족했어요. 시그니처 메뉴 다 맛있습니다!",
            "rating": 5
        },
        {
            "customer_name": "최지영",
            "review_text": "디저트가 정말 맛있어요! 특히 케이크가 부드럽고 달콤해서 기분이 좋아졌습니다.",
            "rating": 5
        },
        {
            "customer_name": "정민호",
            "review_text": "SNS에서 봤는데 실제로 와보니 더 좋네요! 인테리어도 예쁘고 사진 찍기 좋아요.",
            "rating": 4
        },
        # 부정적 리뷰들
        {
            "customer_name": "김불만",
            "review_text": "커피가 너무 차갑고 맛이 없어요. 가격도 비싸고 직원도 불친절했습니다. 다시는 안 올 것 같아요.",
            "rating": 1
        },
        {
            "customer_name": "이실망",
            "review_text": "기대했던 것보다 훨씬 별로였어요. 대기시간도 길고 음식도 맛없고... 돈이 아까웠습니다.",
            "rating": 2
        },
        {
            "customer_name": "박화나",
            "review_text": "직원이 너무 무뚝뚝하고 서비스가 별로예요. 커피도 시원하고... 개선이 필요해 보입니다.",
            "rating": 2
        },
        # 중립적 리뷰들
        {
            "customer_name": "최보통",
            "review_text": "그냥 평범한 카페네요. 특별히 좋지도 나쁘지도 않고... 가격 대비 적당한 것 같아요.",
            "rating": 3
        },
        {
            "customer_name": "정중립",
            "review_text": "음... 뭐랄까, 그냥 그런 카페입니다. 분위기는 괜찮은데 커피 맛은 보통이에요.",
            "rating": 3
        }
    ]
    
    review_id = 1
    
    # VIP 고객 리뷰 생성 (각자 5-7개 리뷰)
    for vip_customer in vip_customers:
        for i in range(5 + (review_id % 3)):  # 5-7개 리뷰
            date = dates[i % len(dates)]  # 최근 7일 중 랜덤
            template = vip_customer["templates"][i % len(vip_customer["templates"])]
            review = {
                "id": f"vip_{review_id:03d}",
                "customer_name": vip_customer["name"],
                "review_text": template,
                "date": date,
                "rating": 5,  # VIP는 항상 5점
                "reply": None
            }
            reviews.append(review)
            review_id += 1
    
    # 충성 고객 리뷰 생성 (각자 3-5개 리뷰)
    for loyal_customer in loyal_customers:
        for i in range(3 + (review_id % 3)):  # 3-5개 리뷰
            date = dates[i % len(dates)]
            template = loyal_customer["templates"][i % len(loyal_customer["templates"])]
            review = {
                "id": f"loyal_{review_id:03d}",
                "customer_name": loyal_customer["name"],
                "review_text": template,
                "date": date,
                "rating": 4,  # 충성 고객은 4점
                "reply": None
            }
            reviews.append(review)
            review_id += 1
    
    # 블랙리스트 고객 리뷰 생성 (각자 5-6개 리뷰)
    for blacklist_customer in blacklist_customers:
        for i in range(5 + (review_id % 2)):  # 5-6개 리뷰
            date = dates[i % len(dates)]
            template = blacklist_customer["templates"][i % len(blacklist_customer["templates"])]
            review = {
                "id": f"black_{review_id:03d}",
                "customer_name": blacklist_customer["name"],
                "review_text": template,
                "date": date,
                "rating": 1,  # 블랙리스트는 1점
                "reply": None
            }
            reviews.append(review)
            review_id += 1
    
    # 기존 일반 리뷰들도 추가
    for i, date in enumerate(dates):
        # 각 날짜별로 1-2개의 일반 리뷰 생성
        num_reviews = 1 + (i % 2)  # 1-2개씩
        
        for j in range(num_reviews):
            template = review_templates[(i * 3 + j) % len(review_templates)]
            review = {
                "id": f"recent_{review_id:03d}",
                "customer_name": template["customer_name"],
                "review_text": template["review_text"],
                "date": date,
                "rating": template["rating"],
                "reply": None
            }
            reviews.append(review)
            review_id += 1
    
    return reviews

# 최근 7일간의 더미 데이터로 교체
INITIAL_REVIEWS = generate_recent_reviews()

# 기존 더미 데이터 (참고용 - 주석 처리)
OLD_INITIAL_REVIEWS = [
    # 충성 고객 - 긍정적, 여러 번 방문
    {
        "id": "rev001",
        "customer_name": "김민수",
        "review_text": "커피가 정말 맛있어요! 분위기도 아늑하고 직원분들도 친절하시네요. 다음에 또 방문하고 싶습니다.",
        "date": "2024-12-15",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev002",
        "customer_name": "김민수",
        "review_text": "세 번째 방문인데 역시 실망시키지 않네요. 오늘 주문한 플랫화이트 완벽했습니다. 단골 확정!",
        "date": "2025-01-05",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev003",
        "customer_name": "김민수",
        "review_text": "친구들에게도 추천해서 같이 왔는데 모두 만족했어요. 시그니처 메뉴 다 맛있습니다!",
        "date": "2025-01-18",
        "rating": 5,
        "reply": None
    },
    
    # 불만 고객 - 부정적, 개선 요구
    {
        "id": "rev004",
        "customer_name": "이영희",
        "review_text": "음료는 괜찮았는데 대기 시간이 너무 길었어요. 주문하고 20분이나 기다렸습니다.",
        "date": "2024-12-20",
        "rating": 3,
        "reply": None
    },
    {
        "id": "rev005",
        "customer_name": "정수진",
        "review_text": "와이파이가 잘 안 되고 콘센트도 부족해요. 노트북 작업하기에는 불편합니다.",
        "date": "2025-01-10",
        "rating": 2,
        "reply": None
    },
    {
        "id": "rev006",
        "customer_name": "강민호",
        "review_text": "가격 대비 양이 너무 적어요. 커피 맛은 좋지만 가성비는 별로입니다. 주차장도 협소해서 불편했습니다.",
        "date": "2025-01-12",
        "rating": 2,
        "reply": None
    },
    
    # 디저트 애호가
    {
        "id": "rev007",
        "customer_name": "박철수",
        "review_text": "디저트가 신선하고 맛있었습니다! 특히 티라미수가 일품이에요. 조용한 분위기도 마음에 듭니다.",
        "date": "2024-12-25",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev008",
        "customer_name": "박철수",
        "review_text": "이번엔 치즈케이크를 먹어봤는데 티라미수만큼 훌륭하네요. 디저트 맛집 인정!",
        "date": "2025-01-08",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev009",
        "customer_name": "최은지",
        "review_text": "스콘이 겉은 바삭하고 속은 촉촉해서 완벽했어요. 크림도 달지 않아서 좋았습니다.",
        "date": "2025-01-14",
        "rating": 5,
        "reply": None
    },
    
    # SNS 인플루언서 타입
    {
        "id": "rev010",
        "customer_name": "홍길동",
        "review_text": "라떼 아트가 정말 예쁘고 맛도 좋았어요! 사진 찍기에도 좋고 인스타그램에 올렸더니 반응이 좋네요.",
        "date": "2025-01-15",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev011",
        "customer_name": "송지은",
        "review_text": "인테리어가 너무 감성적이에요! 사진 찍기 좋은 포인트가 많아서 좋았습니다. 음료 맛도 비주얼만큼 훌륭해요.",
        "date": "2025-01-16",
        "rating": 5,
        "reply": None
    },
    
    # 가족 단위 고객
    {
        "id": "rev012",
        "customer_name": "윤서현",
        "review_text": "아이들과 함께 방문했는데 키즈 메뉴도 있고 직원분들이 아이들에게 친절하셨어요. 가족 단위로 오기 좋습니다.",
        "date": "2025-01-11",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev013",
        "customer_name": "김태희",
        "review_text": "유모차 출입이 편하고 수유실도 있어서 좋았어요. 디카페인 옵션도 다양해서 만족스러웠습니다.",
        "date": "2025-01-13",
        "rating": 5,
        "reply": None
    },
    
    # 직장인 고객
    {
        "id": "rev014",
        "customer_name": "이준호",
        "review_text": "점심시간에 근처 직장인들이 많이 오는데 회전율이 빠르고 테이크아웃도 편리해요. 아메리카노 진하고 좋습니다.",
        "date": "2025-01-09",
        "rating": 4,
        "reply": None
    },
    {
        "id": "rev015",
        "customer_name": "박상민",
        "review_text": "미팅하기 좋은 공간이에요. 조용하고 와이파이도 빠르고 콘센트도 많아서 업무 보기 편합니다.",
        "date": "2025-01-17",
        "rating": 5,
        "reply": None
    },
    
    # 학생 고객
    {
        "id": "rev016",
        "customer_name": "한지민",
        "review_text": "스터디하기 딱 좋아요. 조용하고 자리도 넓직해서 책 펴놓고 공부하기 편합니다. 가격도 합리적이에요.",
        "date": "2025-01-07",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev017",
        "customer_name": "정우성",
        "review_text": "시험 기간에 자주 오는데 오래 앉아있어도 눈치 안 주셔서 감사해요. 아이스 아메리카노 리필되면 더 좋을 것 같아요.",
        "date": "2025-01-16",
        "rating": 4,
        "reply": None
    },
    
    # 커피 마니아
    {
        "id": "rev018",
        "customer_name": "조현우",
        "review_text": "원두 선택이 다양하고 바리스타분이 추출에 신경 쓰시는 게 느껴져요. 핸드드립 에티오피아 예가체프 최고였습니다!",
        "date": "2025-01-06",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev019",
        "customer_name": "서민재",
        "review_text": "커피 산미와 쓴맛의 밸런스가 좋네요. 크레마도 풍부하고 온도도 적당했습니다. 전문성이 느껴지는 곳입니다.",
        "date": "2025-01-14",
        "rating": 5,
        "reply": None
    },
    
    # 중립적 평가
    {
        "id": "rev020",
        "customer_name": "임수빈",
        "review_text": "무난한 카페예요. 맛도 분위기도 나쁘지 않은데 특별히 인상 깊은 건 없었습니다. 근처 카페들과 비슷한 수준이에요.",
        "date": "2025-01-15",
        "rating": 3,
        "reply": None
    },
    
    # 재방문 의사 없는 고객
    {
        "id": "rev021",
        "customer_name": "백승호",
        "review_text": "커피가 너무 미지근하게 나왔어요. 다시 데워달라고 했더니 불친절하게 대응하셔서 기분이 안 좋았습니다.",
        "date": "2025-01-10",
        "rating": 1,
        "reply": None
    },
    {
        "id": "rev022",
        "customer_name": "황지우",
        "review_text": "주문한 메뉴가 다르게 나왔는데 확인도 제대로 안 하시고 바로 가져가셨어요. 실망스럽습니다.",
        "date": "2025-01-12",
        "rating": 2,
        "reply": None
    },
    
    # 계절 메뉴 관련
    {
        "id": "rev023",
        "customer_name": "오세훈",
        "review_text": "겨울 시즌 메뉴로 나온 딸기 라떼 정말 맛있어요! 생딸기 듬뿍 들어가서 상큼하고 달콤합니다.",
        "date": "2025-01-18",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev024",
        "customer_name": "남궁민",
        "review_text": "핫초코가 진하고 고소해요. 추운 날 마시기 딱 좋네요. 마시멜로도 통통하게 올려주셔서 좋았어요.",
        "date": "2025-01-11",
        "rating": 5,
        "reply": None
    },
    
    # 특별한 날 방문
    {
        "id": "rev025",
        "customer_name": "안소희",
        "review_text": "생일 케이크 주문했는데 너무 예뻐서 감동받았어요! 맛도 훌륭하고 포장도 깔끔하게 해주셨습니다.",
        "date": "2024-12-28",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev026",
        "customer_name": "최현석",
        "review_text": "첫 데이트로 방문했는데 분위기 좋고 조용해서 대화하기 편했어요. 커플석도 있어서 좋았습니다!",
        "date": "2025-01-13",
        "rating": 5,
        "reply": None
    },
    
    # 노인 고객
    {
        "id": "rev027",
        "customer_name": "이순자",
        "review_text": "나이 많은 사람도 편하게 올 수 있어요. 메뉴판 글씨도 크고 직원분들이 친절하게 설명해주셔서 감사했습니다.",
        "date": "2025-01-09",
        "rating": 5,
        "reply": None
    },
    
    # 건강 관심 고객
    {
        "id": "rev028",
        "customer_name": "문지영",
        "review_text": "저당 옵션이 있어서 좋아요. 오트밀크로도 주문할 수 있고 당도 조절도 가능해서 만족스럽습니다.",
        "date": "2025-01-17",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev029",
        "customer_name": "권혁수",
        "review_text": "비건 디저트도 있어서 좋았어요. 맛도 일반 디저트 못지않게 맛있습니다. 건강 관리하면서 즐길 수 있어요.",
        "date": "2025-01-16",
        "rating": 5,
        "reply": None
    },
    
    # 단체 고객
    {
        "id": "rev030",
        "customer_name": "양승리",
        "review_text": "동창회로 10명 정도 방문했는데 단체석도 있고 메뉴도 빨리 나와서 좋았어요. 추천합니다!",
        "date": "2025-01-14",
        "rating": 5,
        "reply": None
    },
    
    # 반려동물 동반 고객
    {
        "id": "rev031",
        "customer_name": "장서윤",
        "review_text": "펫프렌들리 카페라 강아지 데리고 왔어요. 테라스 자리가 있어서 좋고 반려동물 메뉴도 있어서 만족스럽습니다!",
        "date": "2025-01-15",
        "rating": 5,
        "reply": None
    },
    
    # 외국인 고객
    {
        "id": "rev032",
        "customer_name": "Emily Kim",
        "review_text": "영어 메뉴판도 있고 직원분이 영어로 설명해주셔서 편했어요. 커피 맛도 좋고 한국 전통 디저트도 신기했습니다.",
        "date": "2025-01-12",
        "rating": 5,
        "reply": None
    },
    
    # 야간 방문 고객
    {
        "id": "rev033",
        "customer_name": "노승현",
        "review_text": "늦은 시간까지 영업해서 좋아요. 밤에 작업하러 오기 딱 좋습니다. 야간 할인도 있으면 더 좋을 것 같아요.",
        "date": "2025-01-17",
        "rating": 4,
        "reply": None
    },
    
    # 재료 품질 칭찬
    {
        "id": "rev034",
        "customer_name": "곽동현",
        "review_text": "우유가 신선해요. 보통 카페는 우유 맛이 좀 그런데 여기는 프리미엄 우유 쓰시는 게 느껴집니다.",
        "date": "2025-01-16",
        "rating": 5,
        "reply": None
    },
    
    # 주차 관련
    {
        "id": "rev035",
        "customer_name": "하준영",
        "review_text": "주차 공간이 넓어서 차 가지고 오기 편해요. 발레파킹 서비스도 있어서 좋습니다.",
        "date": "2025-01-18",
        "rating": 5,
        "reply": None
    },
    
    # 음악/분위기
    {
        "id": "rev036",
        "customer_name": "표지훈",
        "review_text": "재즈 음악이 적당한 볼륨으로 나와서 분위기 좋아요. 너무 시끄럽지도 조용하지도 않아서 딱 좋습니다.",
        "date": "2025-01-15",
        "rating": 5,
        "reply": None
    },
    
    # 청결도
    {
        "id": "rev037",
        "customer_name": "신예진",
        "review_text": "화장실도 깨끗하고 테이블도 수시로 닦아주셔서 좋아요. 청결 관리가 잘 되어 있는 카페입니다.",
        "date": "2025-01-17",
        "rating": 5,
        "reply": None
    },
    
    # 배달 서비스
    {
        "id": "rev038",
        "customer_name": "홍성민",
        "review_text": "배달 주문했는데 포장도 튼튼하게 해주시고 음료도 흘리지 않게 잘 와서 만족스러웠어요.",
        "date": "2025-01-18",
        "rating": 5,
        "reply": None
    },
    
    # 악성 고객 (극소수)
    {
        "id": "rev039",
        "customer_name": "익명1",
        "review_text": "최악이에요. 직원 태도도 별로고 커피도 맛없어요. 다시는 안 갑니다. 별 하나도 아깝네요.",
        "date": "2025-01-11",
        "rating": 1,
        "reply": None
    },
    
    # 추가 긍정 리뷰들
    {
        "id": "rev040",
        "customer_name": "류시원",
        "review_text": "신메뉴로 나온 흑임자 라떼 완전 추천이에요! 고소하고 달달해서 너무 맛있어요. 꼭 드셔보세요!",
        "date": "2025-01-18",
        "rating": 5,
        "reply": None
    }
]

# 앱 시작 시 초기 데이터 설정
if not os.path.exists(DATA_FILE):
    save_reviews(INITIAL_REVIEWS)

@app.route('/')
@app.route('/reviews')
def index():
    """메인 페이지 - 리뷰 목록 표시"""
    return render_template('index.html')

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """리뷰 목록 API"""
    reviews = load_reviews()
    return jsonify(reviews)

@app.route('/api/reviews', methods=['POST'])
def add_review():
    """새 리뷰 추가 API"""
    data = request.json
    reviews = load_reviews()
    
    new_review = {
        "id": f"rev{str(uuid.uuid4())[:8]}",
        "customer_name": data.get('customer_name', '익명'),
        "review_text": data.get('review_text', ''),
        "date": datetime.now().strftime('%Y-%m-%d'),
        "rating": data.get('rating', 5),
        "reply": None
    }
    
    reviews.append(new_review)
    save_reviews(reviews)
    
    return jsonify({"status": "success", "review": new_review}), 200

@app.route('/api/reply', methods=['POST'])
def add_reply():
    """리뷰에 답변 추가 API (기존 방식)"""
    data = request.json
    review_id = data.get('review_id')
    reply_text = data.get('reply_text')
    
    reviews = load_reviews()
    
    for review in reviews:
        if review['id'] == review_id:
            review['reply'] = {
                "text": reply_text,
                "date": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "author": "사장님"
            }
            save_reviews(reviews)
            return jsonify({"status": "success", "message": "Reply added"})
    
    return jsonify({"status": "error", "message": "Review not found"}), 404

@app.route('/api/reviews/<review_id>/reply', methods=['POST'])
def add_reply_restful(review_id):
    """RESTful 방식의 답변 추가 API (자동화용)"""
    data = request.json
    reply_text = data.get('reply', data.get('reply_text'))
    
    if not reply_text:
        return jsonify({"status": "error", "message": "Reply text is required"}), 400
    
    reviews = load_reviews()
    
    for review in reviews:
        if review['id'] == review_id:
            review['reply'] = {
                "text": reply_text,
                "date": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "author": "사장님"
            }
            save_reviews(reviews)
            return jsonify({
                "status": "success", 
                "message": "Reply added",
                "review": review
            }), 201
    
    return jsonify({"status": "error", "message": "Review not found"}), 404

if __name__ == '__main__':
    print("\n" + "="*50)
    print("더미 리뷰 사이트가 시작됩니다!")
    print("브라우저에서 접속: http://localhost:5000")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5000)