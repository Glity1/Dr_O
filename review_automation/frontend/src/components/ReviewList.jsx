import { useState } from 'react';
import { regenerateReply } from '../services/api';

const ReviewList = ({ reviews, onReviewUpdate }) => {
  const [regenerating, setRegenerating] = useState(null);

  const handleRegenerate = async (reviewId) => {
    if (!confirm('이 리뷰의 답변을 재생성하시겠습니까?')) return;
    
    setRegenerating(reviewId);
    try {
      await regenerateReply(reviewId);
      alert('답변이 재생성되었습니다!');
      if (onReviewUpdate) onReviewUpdate();
    } catch (error) {
      alert('답변 재생성에 실패했습니다: ' + error.message);
    } finally {
      setRegenerating(null);
    }
  };

  const getSentimentIcon = () => null;

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case '긍정':
        return 'bg-green-100 text-green-700';
      case '부정':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 border-2 border-yellow-400">
        리뷰가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <div 
          key={review.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border-2 border-yellow-400"
        >
          {/* 헤더 - 고객명과 감성 분석 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {review.customer_name}
              </h3>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(review.sentiment)}`}>
                {getSentimentIcon(review.sentiment)}
                <span>{review.sentiment || '분석 중'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">{formatDate(review.review_date)}</p>
          </div>

          {/* 키워드 섹션 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">키워드</div>
            {review.keywords && review.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {review.keywords.slice(0, 6).map((keyword, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
                {review.keywords.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{review.keywords.length - 6}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">키워드 없음</p>
            )}
          </div>

          {/* 답변 상태 */}
          <div className="pt-3 border-t border-gray-100">
            {review.generated_reply ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-xs text-gray-600 font-medium">답변 완료</span>
                </div>
                {review.reply_posted && (
                  <span className="text-xs text-gray-600">게시됨</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-yellow-600">답변 대기 중</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;