import React, { useState, useEffect } from 'react';
import { getRecentReviews, getStats } from '../services/api';
import { Bell } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';

const AIAnalysis = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [satisfactionAnalysis, setSatisfactionAnalysis] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        getRecentReviews(100, 0),
        getStats()
      ]);
      
      setReviews(reviewsData);
      setStats(statsData);
      
      // 피드백 보고서 생성
      generateFeedbackReport(reviewsData);
      
      // 만족도 분석 생성
      generateSatisfactionAnalysis(reviewsData);
      
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFeedbackReport = (reviewsData) => {
    // 긍정/부정 리뷰 분류
    const positiveReviews = reviewsData.filter(r => r.sentiment === '긍정');
    const negativeReviews = reviewsData.filter(r => r.sentiment === '부정');
    
    // 키워드 분석
    const allKeywords = reviewsData
      .filter(r => r.keywords && r.keywords.length > 0)
      .flatMap(r => r.keywords);
    
    const keywordCount = {};
    allKeywords.forEach(keyword => {
      keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    });
    
    const topKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // 개선점 추출 (부정 리뷰에서)
    const improvementPoints = negativeReviews
      .filter(r => r.keywords && r.keywords.length > 0)
      .flatMap(r => r.keywords)
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {});
    
    const topImprovements = Object.entries(improvementPoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // 강점 추출 (긍정 리뷰에서)
    const strengths = positiveReviews
      .filter(r => r.keywords && r.keywords.length > 0)
      .flatMap(r => r.keywords)
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {});
    
    const topStrengths = Object.entries(strengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    setFeedbackReport({
      totalReviews: reviewsData.length,
      positiveCount: positiveReviews.length,
      negativeCount: negativeReviews.length,
      topKeywords,
      topImprovements,
      topStrengths,
      positiveRatio: (positiveReviews.length / reviewsData.length * 100).toFixed(1),
      negativeRatio: (negativeReviews.length / reviewsData.length * 100).toFixed(1)
    });
  };

  const generateSatisfactionAnalysis = (reviewsData) => {
    // 시간대별 리뷰 분석
    const hourlyData = {};
    reviewsData.forEach(review => {
      const hour = new Date(review.review_date).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourlyData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    // 요일별 리뷰 분석
    const weeklyData = {};
    reviewsData.forEach(review => {
      const day = new Date(review.review_date).getDay();
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      weeklyData[dayNames[day]] = (weeklyData[dayNames[day]] || 0) + 1;
    });
    
    const peakDays = Object.entries(weeklyData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    // 감정별 리뷰 길이 분석
    const sentimentLengths = {
      긍정: [],
      부정: [],
      중립: []
    };
    
    reviewsData.forEach(review => {
      if (review.sentiment && sentimentLengths[review.sentiment]) {
        sentimentLengths[review.sentiment].push(review.review_text.length);
      }
    });
    
    const avgLengths = {};
    Object.keys(sentimentLengths).forEach(sentiment => {
      const lengths = sentimentLengths[sentiment];
      avgLengths[sentiment] = lengths.length > 0 
        ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
        : 0;
    });
    
    setSatisfactionAnalysis({
      peakHours,
      peakDays,
      avgLengths,
      totalReviews: reviewsData.length,
      sentimentDistribution: {
        긍정: reviewsData.filter(r => r.sentiment === '긍정').length,
        부정: reviewsData.filter(r => r.sentiment === '부정').length,
        중립: reviewsData.filter(r => r.sentiment === '중립').length
      }
    });
  };

  const currentDate = new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  const currentTime = new Date().toLocaleTimeString('ko-KR');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 상단 헤더 - 흰색 박스 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-3">AI 분석</h1>
            <p className="text-lg text-gray-600">리뷰 데이터를 분석하여 인사이트와 개선점을 발견하세요</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              {currentDate} {currentTime}
            </div>
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 text-gray-600 hover:text-black hover:bg-yellow-50 rounded-xl transition-all duration-200 relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  5
                </span>
              </button>
              <NotificationDropdown 
                isOpen={notificationOpen} 
                onClose={() => setNotificationOpen(false)}
              />
            </div>
            <button className="px-3 py-2 text-gray-600 hover:text-black hover:bg-yellow-50 rounded-xl transition-all duration-200">로그아웃</button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          마지막 업데이트: {currentTime}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'feedback'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            피드백 보고서
          </button>
          <button
            onClick={() => setActiveTab('satisfaction')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'satisfaction'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            만족도 분석
          </button>
        </div>
      </div>

      {/* 피드백 보고서 탭 */}
      {activeTab === 'feedback' && feedbackReport && (
        <div className="space-y-8">
          {/* 요약 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">총 리뷰 수</div>
              <div className="text-3xl font-bold text-black">{feedbackReport.totalReviews}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">긍정 비율</div>
              <div className="text-3xl font-bold text-gray-600">{feedbackReport.positiveRatio}%</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">부정 비율</div>
              <div className="text-3xl font-bold text-gray-600">{feedbackReport.negativeRatio}%</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">분석 완료</div>
              <div className="text-3xl font-bold text-gray-600">{feedbackReport.totalReviews}</div>
            </div>
          </div>

          {/* 강점 분석 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">고객이 인정하는 강점</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackReport.topStrengths.map(([keyword, count], index) => (
                <div key={keyword} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{keyword}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count}회 언급</span>
                </div>
              ))}
            </div>
          </div>

          {/* 개선점 분석 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">개선이 필요한 영역</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackReport.topImprovements.map(([keyword, count], index) => (
                <div key={keyword} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{keyword}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count}회 언급</span>
                </div>
              ))}
            </div>
          </div>

          {/* 핵심 키워드 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">핵심 키워드 TOP 10</h3>
            <div className="flex flex-wrap gap-2">
              {feedbackReport.topKeywords.map(([keyword, count], index) => (
                <div key={keyword} className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                  <span className="font-medium text-gray-800">{keyword}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI 추천 액션 */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">AI 추천 액션</h3>
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-semibold text-gray-800 mb-2">즉시 개선 필요</h4>
                <p className="text-gray-600">부정 리뷰에서 가장 많이 언급된 "{feedbackReport.topImprovements[0]?.[0]}" 항목에 대한 즉시 개선이 필요합니다.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-gray-500">
                <h4 className="font-semibold text-gray-800 mb-2">강점 유지 및 확대</h4>
                <p className="text-gray-600">고객들이 가장 좋아하는 "{feedbackReport.topStrengths[0]?.[0]}" 서비스를 더욱 강화하세요.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-gray-600">
                <h4 className="font-semibold text-gray-800 mb-2">모니터링 강화</h4>
                <p className="text-gray-600">고객 피드백을 지속적으로 모니터링하고 개선사항을 추적하세요.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 만족도 분석 탭 */}
      {activeTab === 'satisfaction' && satisfactionAnalysis && (
        <div className="space-y-8">
          {/* 감정 분포 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">감정 분포 현황</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(satisfactionAnalysis.sentimentDistribution).map(([sentiment, count]) => {
                const percentage = ((count / satisfactionAnalysis.totalReviews) * 100).toFixed(1);
                const color = 'gray';
                return (
                  <div key={sentiment} className="text-center">
                    <div className={`text-4xl font-bold text-${color}-600 mb-2`}>{count}</div>
                    <div className="text-sm text-gray-600 mb-2">{sentiment} 리뷰</div>
                    <div className={`w-full bg-gray-200 rounded-full h-2`}>
                      <div 
                        className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 시간대별 분석 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">리뷰 작성 시간대 분석</h3>
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">가장 활발한 시간대 TOP 3</h4>
              <div className="space-y-2">
                {satisfactionAnalysis.peakHours.map(([hour, count], index) => (
                  <div key={hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{hour}시</span>
                    </div>
                    <span className="text-sm text-gray-600">{count}개 리뷰</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 요일별 분석 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">요일별 리뷰 활동</h3>
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">가장 활발한 요일 TOP 3</h4>
              <div className="space-y-2">
                {satisfactionAnalysis.peakDays.map(([day, count], index) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{day}요일</span>
                    </div>
                    <span className="text-sm text-gray-600">{count}개 리뷰</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 리뷰 길이 분석 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">감정별 리뷰 길이 분석</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(satisfactionAnalysis.avgLengths).map(([sentiment, avgLength]) => {
                const color = 'gray';
                return (
                  <div key={sentiment} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold text-${color}-600 mb-2`}>{avgLength}자</div>
                    <div className="text-sm text-gray-600">{sentiment} 리뷰 평균 길이</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">인사이트</h4>
              <p className="text-gray-600">
                {satisfactionAnalysis.avgLengths.긍정 > satisfactionAnalysis.avgLengths.부정 
                  ? "긍정 리뷰가 부정 리뷰보다 더 길어 고객들이 만족할 때 더 자세히 표현하는 경향이 있습니다."
                  : "부정 리뷰가 긍정 리뷰보다 더 길어 고객들이 불만사항을 더 자세히 설명하는 경향이 있습니다."
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;