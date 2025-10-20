import React, { useState, useEffect } from 'react';
import { getRecentReviews, generateCustomerStory } from '../services/api';
import { Bell } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';

const CustomerStory = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [customerStories, setCustomerStories] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getRecentReviews(200, 0);
      setReviews(data);
      generateCustomerStories(data);
    } catch (error) {
      console.error('리뷰 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCustomerStories = async (reviewsData) => {
    const customerGroups = reviewsData.reduce((acc, review) => {
      const customerName = review.customer_name;
      if (!acc[customerName]) {
        acc[customerName] = {
          name: customerName,
          reviews: [],
          totalReviews: 0,
          positiveReviews: 0,
          negativeReviews: 0,
          firstReviewDate: null,
          lastReviewDate: null,
          avgSentiment: 0,
          loyaltyScore: 0,
          keywords: [],
          story: ''
        };
      }
      
      const reviewDate = new Date(review.review_date);
      acc[customerName].reviews.push(review);
      acc[customerName].totalReviews++;
      
      if (review.sentiment === '긍정') acc[customerName].positiveReviews++;
      if (review.sentiment === '부정') acc[customerName].negativeReviews++;
      
      if (!acc[customerName].firstReviewDate || reviewDate < new Date(acc[customerName].firstReviewDate)) {
        acc[customerName].firstReviewDate = review.review_date;
      }
      if (!acc[customerName].lastReviewDate || reviewDate > new Date(acc[customerName].lastReviewDate)) {
        acc[customerName].lastReviewDate = review.review_date;
      }
      
      if (review.keywords) {
        acc[customerName].keywords.push(...review.keywords);
      }
      
      return acc;
    }, {});

    const customerList = Object.values(customerGroups)
      .filter(customer => customer.totalReviews >= 3)
      .map(customer => {
        const positiveRatio = customer.totalReviews > 0 ? (customer.positiveReviews / customer.totalReviews) : 0;
        const reviewSpan = new Date(customer.lastReviewDate) - new Date(customer.firstReviewDate);
        const monthsSpan = reviewSpan / (1000 * 60 * 60 * 24 * 30);
        
        let loyaltyScore = 0;
        if (customer.totalReviews >= 10) loyaltyScore += 30;
        if (customer.totalReviews >= 5) loyaltyScore += 20;
        if (positiveRatio >= 0.8) loyaltyScore += 25;
        if (positiveRatio >= 0.9) loyaltyScore += 15;
        if (monthsSpan >= 6) loyaltyScore += 10;
        
        // 블랙리스트 판단 로직 (sentiment 기반)
        const negativeRatio = customer.totalReviews > 0 ? (customer.negativeReviews / customer.totalReviews) : 0;
        const isBlacklist = negativeRatio >= 0.7 || (customer.totalReviews >= 5 && negativeRatio >= 0.5);
        
        let customerType = 'normal';
        if (isBlacklist) customerType = 'blacklist';
        else if (loyaltyScore >= 70) customerType = 'vip';
        else if (loyaltyScore >= 40) customerType = 'loyal';
        
        const keywordCount = {};
        customer.keywords.forEach(keyword => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
        const topKeywords = Object.entries(keywordCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(item => ({ keyword: item[0], count: item[1] }));
        
        return {
          ...customer,
          positiveRatio,
          monthsSpan,
          loyaltyScore,
          customerType,
          topKeywords
        };
      })
      .sort((a, b) => b.loyaltyScore - a.loyaltyScore);

    // 각 고객에 대해 AI 스토리 생성 (병렬 처리)
    const storiesPromises = customerList.map(async (customer) => {
      const story = await generateStory(customer, customer.loyaltyScore, customer.topKeywords);
      return {
        ...customer,
        story
      };
    });
    
    const stories = await Promise.all(storiesPromises);
    setCustomerStories(stories);
  };

  const generateStory = async (customer, loyaltyScore, topKeywords) => {
    try {
      // 리뷰 샘플 추출 (최대 3개)
      const reviewSamples = customer.reviews
        .slice(0, 3)
        .map(r => r.review_text.substring(0, 100));
      
      // Gemini AI에 전달할 고객 데이터 구성
      const customerData = {
        name: customer.name,
        totalReviews: customer.totalReviews,
        positiveReviews: customer.positiveReviews,
        loyaltyScore: loyaltyScore,
        topKeywords: topKeywords,
        firstReviewDate: customer.firstReviewDate,
        lastReviewDate: customer.lastReviewDate,
        reviewSamples: reviewSamples
      };
      
      // Gemini AI로 스토리 생성
      const response = await generateCustomerStory(customerData);
      return response.story;
      
    } catch (error) {
      console.error('스토리 생성 실패:', error);
      // 실패 시 기본 스토리 반환
      return `${customer.name}님은 총 ${customer.totalReviews}번의 리뷰를 남겨주신 소중한 고객입니다.`;
    }
  };

  const getCustomerTypeInfo = (type) => {
    switch (type) {
      case 'vip':
        return { 
          label: 'VIP 고객', 
          color: 'text-gray-600 bg-gray-100', 
          gradient: 'from-yellow-500 to-amber-500'
        };
      case 'loyal':
        return { 
          label: '충성 고객', 
          color: 'text-gray-600 bg-gray-100', 
          gradient: 'from-gray-500 to-gray-600'
        };
      default:
        return { 
          label: '일반 고객', 
          color: 'text-gray-600 bg-gray-100', 
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const filteredStories = customerStories.filter(story => {
    if (filterType === 'all') return true;
    return story.customerType === filterType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  const currentTime = new Date().toLocaleTimeString('ko-KR');

  return (
    <div className="p-6">
      {/* 상단 헤더 - 흰색 박스 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-3">고객 스토리</h1>
            <p className="text-lg text-gray-600">충성 고객과 우수 고객의 스토리를 확인하고 관계를 관리하세요</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-semibold">VIP</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">VIP 고객</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerStories.filter(s => s.customerType === 'vip').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-semibold">LOYAL</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">충성 고객</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerStories.filter(s => s.customerType === 'loyal').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-semibold">BLACK</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">블랙리스트</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerStories.filter(s => s.customerType === 'blacklist').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-blue-100 rounded-lg text-xs text-blue-600 font-semibold">TOTAL</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">총 고객</p>
                <p className="text-2xl font-bold text-gray-900">{customerStories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-semibold">SCORE</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">평균 충성도</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerStories.length > 0 
                    ? Math.round(customerStories.reduce((sum, s) => sum + s.loyaltyScore, 0) / customerStories.length)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('vip')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'vip'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              VIP 고객
            </button>
            <button
              onClick={() => setFilterType('loyal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'loyal'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              충성 고객
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const typeInfo = getCustomerTypeInfo(story.customerType);
            
            return (
              <div 
                key={story.name}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCustomer(story)}
              >
                <div className={`h-2 bg-gradient-to-r ${typeInfo.gradient} rounded-t-lg`}></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-700">
                          {story.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{story.name}</h3>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</div>
                      </div>
                    </div>
                    <span className="text-gray-400">〉</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">리뷰 수</span>
                      <span className="font-semibold">{story.totalReviews}개</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">긍정 비율</span>
                      <span className="font-semibold text-green-600">{Math.round(story.positiveRatio * 100)}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">충성도 점수</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${typeInfo.gradient}`}
                            style={{ width: `${story.loyaltyScore}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{story.loyaltyScore}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">방문 기간</span>
                      <span className="font-semibold">{Math.round(story.monthsSpan)}개월</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-3">{story.story}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className={`h-2 bg-gradient-to-r ${getCustomerTypeInfo(selectedCustomer.customerType).gradient} rounded-t-lg`}></div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-gray-700">
                        {selectedCustomer.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCustomerTypeInfo(selectedCustomer.customerType).color}`}>
                        {getCustomerTypeInfo(selectedCustomer.customerType).label}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">고객 스토리</h4>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{selectedCustomer.story}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalReviews}</div>
                    <div className="text-sm text-gray-600">총 리뷰</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{Math.round(selectedCustomer.positiveRatio * 100)}%</div>
                    <div className="text-sm text-gray-600">긍정 비율</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedCustomer.loyaltyScore}</div>
                    <div className="text-sm text-gray-600">충성도 점수</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(selectedCustomer.monthsSpan)}</div>
                    <div className="text-sm text-gray-600">방문 기간(월)</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">최근 리뷰</h4>
                  <div className="space-y-4">
                    {selectedCustomer.reviews.slice(0, 5).map((review, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(review.review_date).toLocaleDateString('ko-KR')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            review.sentiment === '긍정' ? 'bg-green-100 text-green-800' :
                            review.sentiment === '부정' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {review.sentiment}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.review_text}</p>
                        {review.keywords && review.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {review.keywords.map((keyword, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CustomerStory;
