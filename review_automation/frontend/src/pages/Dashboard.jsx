import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentReviews, getStats, getSentimentTrend, triggerScraping } from '../services/api';
import PageHeader from '../components/PageHeader';
import WhiteBox from '../components/WhiteBox';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import ReviewList from '../components/ReviewList';
import SentimentChart from '../components/SentimentChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keywordRanking, setKeywordRanking] = useState([]);

  // 키워드 랭킹 분석 함수
  const analyzeKeywords = (reviewsData) => {
    const keywordCount = {};
    
    reviewsData.forEach(review => {
      if (review.keywords && Array.isArray(review.keywords)) {
        review.keywords.forEach(keyword => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
      }
    });
    
    // 빈도순으로 정렬하고 상위 5개만 반환
    return Object.entries(keywordCount)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 병렬로 모든 데이터 가져오기
      const [reviewsData, statsData, trendDataRes] = await Promise.all([
        getRecentReviews(50, 0),
        getStats(),
        getSentimentTrend(7)
      ]);

      setReviews(reviewsData);
      setStats(statsData);
      setTrendData(trendDataRes);
      setKeywordRanking(analyzeKeywords(reviewsData));
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
      setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <ErrorBoundary error={error} onRetry={fetchAllData} />;
  }

  return (
    <div className="p-6">
      <PageHeader 
        title="AI 리뷰 답변 대시보드"
        subtitle="실시간으로 리뷰를 관리하고 AI 답변을 생성하세요"
      />

      {/* 좌우 2컬럼 레이아웃: 좌측(통계+차트), 우측(스크래핑/새로고침+키워드) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* 좌측 3칸: 통계 카드 + 감성추이 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 통계 카드 - 2x3 그리드로 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats ? [
              { title: '전체 리뷰', value: stats.total_reviews },
              { title: '답변 완료', value: stats.replied_reviews },
              { title: '답변 대기', value: stats.pending_reviews },
              { title: '긍정 리뷰', value: stats.positive_reviews },
              { title: '부정 리뷰', value: stats.negative_reviews },
              { title: '중립 리뷰', value: stats.neutral_reviews }
            ].map((card, index) => (
              <WhiteBox key={index} padding="p-4" shadow="shadow-sm" hover>
                <div className="flex items-center justify-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-black">{card.value}</p>
                  </div>
                </div>
              </WhiteBox>
            )) : (
              [1, 2, 3, 4, 5, 6].map(i => (
                <WhiteBox key={i} padding="p-4" className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </WhiteBox>
              ))
            )}
          </div>
          {/* 감성 추이 차트 */}
          <SentimentChart trendData={trendData} />
        </div>

        {/* 우측 1칸: 스크래핑/새로고침 박스 + 키워드 랭킹 */}
        <div className="space-y-6">
          {/* 상단 2개 박스 그룹 - 답변 대기와 중립 리뷰 간격과 동일 */}
          <div className="space-y-4">
            {/* 리뷰 스크래핑 박스 - 답변 대기 박스와 동일한 높이 */}
            <WhiteBox padding="p-4" shadow="shadow-sm" hover>
              <div className="flex items-center justify-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">리뷰 스크래핑</p>
                  <button
                    onClick={async () => {
                      try {
                        await triggerScraping();
                        fetchAllData();
                      } catch (e) {
                        console.error('스크래핑 실패', e);
                      }
                    }}
                    className="text-2xl font-bold text-black hover:text-yellow-600 transition-colors"
                  >
                    실행
                  </button>
                </div>
              </div>
            </WhiteBox>

            {/* 새로고침 박스 - 중립 리뷰 박스와 동일한 높이 */}
            <WhiteBox padding="p-4" shadow="shadow-sm" hover>
              <div className="flex items-center justify-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">데이터 새로고침</p>
                  <button
                    onClick={fetchAllData}
                    className="text-2xl font-bold text-black hover:text-yellow-600 transition-colors"
                  >
                    새로고침
                  </button>
                </div>
              </div>
            </WhiteBox>
          </div>

          {/* 키워드 랭킹 - 감성 추이 차트와 동일한 높이 */}
          <WhiteBox padding="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">키워드 랭킹</h3>
            <div style={{ height: '300px' }} className="flex flex-col justify-center">
              {keywordRanking.length > 0 ? (
                <div className="space-y-3">
                  {keywordRanking.map((item, index) => (
                    <div key={item.keyword} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-600' : 
                          index === 2 ? 'bg-gray-500' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {item.keyword}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{item.count}회</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(item.count / keywordRanking[0].count) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm">아직 키워드 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </WhiteBox>
      </div>

      </div>

      {/* 최근 리뷰 제목 - 흰색 박스 */}
      <WhiteBox padding="p-6" className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">최근 리뷰</h2>
          
          <div className="flex items-center space-x-6">
            {/* 리뷰 통계 요약 */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700">긍정 {reviews.filter(r => r.sentiment === '긍정').length}개</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700">부정 {reviews.filter(r => r.sentiment === '부정').length}개</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">분석중 {reviews.filter(r => !r.sentiment || r.sentiment === '분석중').length}개</span>
              </div>
            </div>
            
            {/* 전체 보기 버튼 */}
            <button 
              onClick={() => navigate('/customers')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              전체 보기
            </button>
          </div>
        </div>
      </WhiteBox>

      {/* 리뷰 목록 */}
      {loading ? (
        <WhiteBox padding="p-8" className="text-center">
          <LoadingSpinner />
        </WhiteBox>
      ) : (
        <ReviewList reviews={reviews.slice(0, 6)} onReviewUpdate={fetchAllData} />
      )}
    </div>
  );
};

export default Dashboard;