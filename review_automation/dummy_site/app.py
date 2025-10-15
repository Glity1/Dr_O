# dummy_site/app.py
from flask import Flask, render_template, request, jsonify, render_template_string
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

# HTML 템플릿 (templates 폴더가 없을 경우를 위해 인라인으로 정의)
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>우리 카페 - 고객 리뷰</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .review-form {
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1em;
        }
        
        .star {
            font-size: 30px;
            color: #ddd;
            cursor: pointer;
        }
        
        .star.active {
            color: #ffc107;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            cursor: pointer;
        }
        
        .reviews-list {
            padding: 30px;
        }
        
        .review-item {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .author {
            font-weight: 600;
            color: #333;
        }
        
        .date {
            color: #999;
            font-size: 0.9em;
        }
        
        .review-content {
            color: #666;
            line-height: 1.6;
            margin: 10px 0;
        }
        
        .reply-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-top: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>☕ 우리 카페</h1>
            <p>고객님의 소중한 의견을 들려주세요</p>
        </div>
        
        <div class="review-form">
            <h3>리뷰 작성하기</h3>
            <form id="reviewForm">
                <div class="form-group">
                    <input type="text" id="customerName" placeholder="이름" required>
                </div>
                <div class="form-group">
                    <div id="rating">
                        <span class="star" data-rating="1">★</span>
                        <span class="star" data-rating="2">★</span>
                        <span class="star" data-rating="3">★</span>
                        <span class="star" data-rating="4">★</span>
                        <span class="star" data-rating="5">★</span>
                    </div>
                </div>
                <div class="form-group">
                    <textarea id="reviewText" rows="4" placeholder="리뷰를 작성해주세요" required></textarea>
                </div>
                <button type="submit" class="submit-btn">리뷰 등록</button>
            </form>
        </div>
        
        <div class="reviews-list" id="reviewsList"></div>
    </div>
    
    <script>
        let selectedRating = 5;
        
        // 별점 선택
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                updateStars();
            });
        });
        
        function updateStars() {
            document.querySelectorAll('.star').forEach((star, index) => {
                star.classList.toggle('active', index < selectedRating);
            });
        }
        updateStars();
        
        // 폼 제출
        document.getElementById('reviewForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                customer_name: document.getElementById('customerName').value,
                review_text: document.getElementById('reviewText').value,
                rating: selectedRating
            };
            
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('리뷰가 등록되었습니다!');
                document.getElementById('reviewForm').reset();
                loadReviews();
            }
        });
        
        // 리뷰 로드
        async function loadReviews() {
            const response = await fetch('/api/reviews');
            const reviews = await response.json();
            
            const reviewsList = document.getElementById('reviewsList');
            reviewsList.innerHTML = '';
            
            reviews.reverse().forEach(review => {
                const div = document.createElement('div');
                div.className = 'review-item';
                div.setAttribute('data-review-id', review.id);
                
                let replyHtml = '';
                if (review.reply) {
                    replyHtml = `
                        <div class="reply-box">
                            <strong>${review.reply.author}:</strong> ${review.reply.text}
                            <div style="font-size: 0.8em; color: #999; margin-top: 5px;">${review.reply.date}</div>
                        </div>
                    `;
                }
                
                div.innerHTML = `
                    <div>
                        <span class="author">${review.customer_name}</span>
                        <span class="date">${review.date}</span>
                    </div>
                    <div>평점: ${'★'.repeat(review.rating) + '☆'.repeat(5-review.rating)}</div>
                    <div class="review-content">${review.review_text}</div>
                    ${replyHtml}
                `;
                reviewsList.appendChild(div);
            });
        }
        
        loadReviews();
        setInterval(loadReviews, 5000);
    </script>
</body>
</html>
"""

# 앱 시작 시 초기 데이터 설정
if not os.path.exists(DATA_FILE):
    save_reviews(INITIAL_REVIEWS)

@app.route('/')
@app.route('/reviews')
def index():
    """메인 페이지 - 리뷰 목록 표시"""
    return render_template_string(HTML_TEMPLATE)

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
    
    return jsonify({"status": "success", "review": new_review})

@app.route('/api/reply', methods=['POST'])
def add_reply():
    """리뷰에 답변 추가 API"""
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

if __name__ == '__main__':
    print("\n" + "="*50)
    print("더미 리뷰 사이트가 시작됩니다!")
    print("브라우저에서 접속: http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)