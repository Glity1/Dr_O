import { useState, useEffect } from 'react';
import { getRecentReviews, getStats, getSentimentTrend } from '../services/api';
import StatsCards from './StatsCards';
import ReviewList from './ReviewList';
import SentimentChart from './SentimentChart';
import ActionButtons from './ActionButtons';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 병렬로 모든 데이터 가져오기
      const [reviewsData, statsData, trendDataRes] = await Promise.all([
        getRecentReviews(20, 0),
        getStats(),
        getSentimentTrend(7)
      ]);

      setReviews(reviewsData);
      setStats(statsData);
      setTrendData(trendDataRes);
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">연결 오류</h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🤖 AI 리뷰 답변 대시보드
              </h1>
              <p className="text-gray-600 mt-1">
                실시간으로 리뷰를 관리하고 AI 답변을 생성하세요
              </p>
            </div>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 액션 버튼 */}
        <ActionButtons onUpdate={fetchAllData} />

        {/* 통계 카드 */}
        <StatsCards stats={stats} />

        {/* 차트와 리뷰 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <SentimentChart trendData={trendData} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">빠른 통계</h3>
            {stats && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">답변 완료율</span>
                    <span className="font-semibold text-gray-900">
                      {stats.total_reviews > 0 
                        ? Math.round((stats.replied_reviews / stats.total_reviews) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.total_reviews > 0 
                          ? (stats.replied_reviews / stats.total_reviews) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">긍정 비율</span>
                    <span className="font-semibold text-green-600">
                      {stats.total_reviews > 0 
                        ? Math.round((stats.positive_reviews / stats.total_reviews) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.total_reviews > 0 
                          ? (stats.positive_reviews / stats.total_reviews) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">부정 비율</span>
                    <span className="font-semibold text-red-600">
                      {stats.total_reviews > 0 
                        ? Math.round((stats.negative_reviews / stats.total_reviews) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.total_reviews > 0 
                          ? (stats.negative_reviews / stats.total_reviews) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 리뷰 목록 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">최근 리뷰</h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">데이터 로딩 중...</p>
            </div>
          ) : (
            <ReviewList reviews={reviews} onReviewUpdate={fetchAllData} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;