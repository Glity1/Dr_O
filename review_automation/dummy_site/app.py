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

# 초기 더미 데이터
INITIAL_REVIEWS = [
    {
        "id": "rev001",
        "customer_name": "김민수",
        "review_text": "커피가 정말 맛있어요! 분위기도 아늑하고 직원분들도 친절하시네요. 다음에 또 방문하고 싶습니다.",
        "date": "2025-01-13",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev002",
        "customer_name": "이영희",
        "review_text": "음료는 괜찮았는데 대기 시간이 너무 길었어요. 주문하고 20분이나 기다렸습니다.",
        "date": "2025-01-13",
        "rating": 3,
        "reply": None
    },
    {
        "id": "rev003",
        "customer_name": "박철수",
        "review_text": "디저트가 신선하고 맛있었습니다! 특히 티라미수가 일품이에요. 조용한 분위기도 마음에 듭니다.",
        "date": "2025-01-14",
        "rating": 5,
        "reply": None
    },
    {
        "id": "rev004",
        "customer_name": "정수진",
        "review_text": "와이파이가 잘 안 되고 콘센트도 부족해요. 노트북 작업하기에는 불편합니다.",
        "date": "2025-01-14",
        "rating": 2,
        "reply": None
    },
    {
        "id": "rev005",
        "customer_name": "홍길동",
        "review_text": "라떼 아트가 정말 예쁘고 맛도 좋았어요! 사진 찍기에도 좋고 인스타그램에 올렸더니 반응이 좋네요.",
        "date": "2025-01-14",
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