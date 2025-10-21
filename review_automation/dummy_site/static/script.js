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

// 탭 전환
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // 모든 탭 비활성화
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // 선택한 탭 활성화
        tab.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

// 썸네일 이미지 클릭
document.querySelectorAll('.thumbnail-images img').forEach(thumb => {
    thumb.addEventListener('click', () => {
        const mainImage = document.querySelector('.main-image img');
        mainImage.src = thumb.src.replace('w=100', 'w=500');
        
        document.querySelectorAll('.thumbnail-images img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    });
});

// 수량 조절
const qtyInput = document.querySelector('.quantity-control input');
const qtyBtns = document.querySelectorAll('.qty-btn');

qtyBtns[0].addEventListener('click', () => {
    if (qtyInput.value > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
        updateTotalPrice();
    }
});

qtyBtns[1].addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
    updateTotalPrice();
});

qtyInput.addEventListener('change', updateTotalPrice);

function updateTotalPrice() {
    const basePrice = 57850;
    const qty = parseInt(qtyInput.value);
    const total = basePrice * qty;
    document.querySelector('.total-amount').textContent = total.toLocaleString() + '원';
}

// 리뷰 작성 모달
const writeReviewBtn = document.getElementById('writeReviewBtn');
const reviewModal = document.getElementById('reviewModal');
const closeModal = document.getElementById('closeModal');

writeReviewBtn.addEventListener('click', () => {
    reviewModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    reviewModal.classList.remove('active');
});

reviewModal.addEventListener('click', (e) => {
    if (e.target === reviewModal) {
        reviewModal.classList.remove('active');
    }
});

// 폼 제출
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        customer_name: document.getElementById('customerName').value,
        review_text: document.getElementById('reviewText').value,
        rating: selectedRating
    };
    
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('리뷰가 등록되었습니다! 감사합니다 😊');
            document.getElementById('reviewForm').reset();
            selectedRating = 5;
            updateStars();
            reviewModal.classList.remove('active');
            
            // 리뷰 탭으로 자동 이동
            document.querySelector('[data-tab="review"]').click();
            
            // 리뷰 새로고침
            loadReviews();
        } else {
            alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
});

// 장바구니, 구매 버튼
document.querySelector('.btn-cart').addEventListener('click', () => {
    const cartBadge = document.querySelector('.cart-badge');
    const currentCount = parseInt(cartBadge.textContent);
    cartBadge.textContent = currentCount + parseInt(qtyInput.value);
    
    // 애니메이션
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
    }, 300);
    
    alert('장바구니에 추가되었습니다! 🛒');
});

document.querySelector('.btn-buy').addEventListener('click', () => {
    alert('주문 페이지로 이동합니다! (데모 사이트)');
});

// 리뷰 로드
async function loadReviews() {
    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        const reviewsList = document.getElementById('reviewsList');
        const reviewCount = document.getElementById('reviewCount');
        
        reviewCount.textContent = reviews.length;
        reviewsList.innerHTML = '';
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="empty-message">아직 작성된 리뷰가 없습니다.<br>첫 번째 리뷰를 남겨주세요!</p>';
            return;
        }
        
        reviews.reverse().forEach(review => {
            const div = document.createElement('div');
            div.className = 'review-item';
            div.setAttribute('data-review-id', review.id);
            
            let replyHtml = '';
            if (review.reply) {
                replyHtml = `
                    <div class="reply-box">
                        <strong><i class="fas fa-store"></i> ${review.reply.author}:</strong> 
                        ${review.reply.text}
                        <div style="font-size: 0.85em; color: #999; margin-top: 8px;">
                            <i class="far fa-clock"></i> ${review.reply.date}
                        </div>
                    </div>
                `;
            }
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <span class="author"><i class="fas fa-user-circle"></i> ${review.customer_name}</span>
                        <span class="date">${review.date}</span>
                    </div>
                </div>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                <div class="review-content">${review.review_text}</div>
                ${replyHtml}
            `;
            reviewsList.appendChild(div);
        });
        
        // 리뷰 통계 업데이트
        updateReviewStats(reviews);
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        document.getElementById('reviewsList').innerHTML = 
            '<p class="empty-message">리뷰를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 리뷰 통계 업데이트
function updateReviewStats(reviews) {
    if (reviews.length === 0) return;
    
    const ratings = reviews.map(r => r.rating);
    const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    
    // 평균 평점 업데이트
    document.querySelector('.rating-number').textContent = avgRating;
    
    // 별점 비율 계산
    const ratingCounts = [0, 0, 0, 0, 0];
    ratings.forEach(rating => {
        ratingCounts[rating - 1]++;
    });
    
    const statBars = document.querySelectorAll('.stat-bar');
    statBars.forEach((bar, index) => {
        const percentage = (ratingCounts[4 - index] / reviews.length * 100).toFixed(0);
        const fill = bar.querySelector('.fill');
        const percentText = bar.querySelector('span:last-child');
        
        fill.style.width = percentage + '%';
        percentText.textContent = percentage + '%';
    });
    
    // 상단 리뷰 개수 업데이트
    document.querySelector('.review-count').textContent = `(${reviews.length}개 리뷰)`;
}

// 초기 로드
loadReviews();

// 5초마다 리뷰 새로고침
setInterval(loadReviews, 5000);
