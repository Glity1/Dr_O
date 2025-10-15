import { useState } from 'react';
import { RefreshCw, ThumbsUp, ThumbsDown, Minus, Tag } from 'lucide-react';
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

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case '긍정':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case '부정':
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case '긍정':
        return 'bg-green-100 text-green-800';
      case '부정':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        리뷰가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div 
          key={review.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {review.customer_name}
                </h3>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(review.sentiment)}`}>
                  {getSentimentIcon(review.sentiment)}
                  <span>{review.sentiment || '분석 중'}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">{formatDate(review.review_date)}</p>
            </div>
            
            {review.generated_reply && (
              <button
                onClick={() => handleRegenerate(review.id)}
                disabled={regenerating === review.id}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating === review.id ? 'animate-spin' : ''}`} />
                재생성
              </button>
            )}
          </div>

          {/* 리뷰 내용 */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
          </div>

          {/* 키워드 */}
          {review.keywords && review.keywords.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400" />
              {review.keywords.map((keyword, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* 생성된 답변 */}
          {review.generated_reply ? (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">🤖 AI 생성 답변:</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-800 leading-relaxed">{review.generated_reply}</p>
              </div>
              {review.reply_posted && (
                <p className="text-xs text-green-600 mt-2">✓ 게시 완료</p>
              )}
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-orange-600">⏳ 답변 생성 대기 중...</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;