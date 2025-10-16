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
        selectedRating = 5;
        updateStars();
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