import { useState, useEffect } from 'react';
import { getRecentReviews } from '../services/api';
import { Bell } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Tag, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Download
} from 'lucide-react';

const KeywordAnalysis = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keywordStats, setKeywordStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getRecentReviews(100, 0);
      setReviews(data);
      analyzeKeywords(data);
    } catch (error) {
      console.error('리뷰 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeKeywords = (reviewsData) => {
    const keywordCount = {};
    const keywordSentiment = {};

    reviewsData.forEach(review => {
      if (review.keywords && Array.isArray(review.keywords)) {
        review.keywords.forEach(keyword => {
          if (!keywordCount[keyword]) {
            keywordCount[keyword] = 0;
            keywordSentiment[keyword] = { positive: 0, negative: 0, neutral: 0 };
          }
          keywordCount[keyword]++;
          
          if (review.sentiment === '긍정') {
            keywordSentiment[keyword].positive++;
          } else if (review.sentiment === '부정') {
            keywordSentiment[keyword].negative++;
          } else {
            keywordSentiment[keyword].neutral++;
          }
        });
      }
    });

    const keywords = Object.keys(keywordCount).map(keyword => {
      const total = keywordCount[keyword];
      const sentiment = keywordSentiment[keyword];
      return {
        keyword,
        count: total,
        positive: sentiment.positive,
        negative: sentiment.negative,
        neutral: sentiment.neutral,
        positiveRatio: total > 0 ? sentiment.positive / total : 0,
        negativeRatio: total > 0 ? sentiment.negative / total : 0,
        neutralRatio: total > 0 ? sentiment.neutral / total : 0,
        dominantSentiment: 
          sentiment.positive > sentiment.negative && sentiment.positive > sentiment.neutral ? '긍정' :
          sentiment.negative > sentiment.positive && sentiment.negative > sentiment.neutral ? '부정' : '중립'
      };
    }).sort((a, b) => b.count - a.count);

    const totalKeywords = Object.keys(keywordCount).length;
    const totalCount = Object.values(keywordCount).reduce((sum, count) => sum + count, 0);
    
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    keywords.forEach(kw => {
      if (kw.dominantSentiment === '긍정') positiveCount++;
      else if (kw.dominantSentiment === '부정') negativeCount++;
      else neutralCount++;
    });

    setKeywordStats({
      totalKeywords,
      totalCount,
      keywords,
      sentimentDistribution: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      }
    });
  };

  const filteredKeywords = keywordStats?.keywords.filter(keyword => {
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || keyword.dominantSentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  }) || [];

  const chartData = filteredKeywords.slice(0, 10).map(kw => ({
    keyword: kw.keyword,
    긍정: kw.positive,
    부정: kw.negative,
    중립: kw.neutral
  }));

  const pieData = [
    { name: '긍정', value: keywordStats?.sentimentDistribution.positive || 0, color: '#10B981' },
    { name: '부정', value: keywordStats?.sentimentDistribution.negative || 0, color: '#EF4444' },
    { name: '중립', value: keywordStats?.sentimentDistribution.neutral || 0, color: '#6B7280' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-black mb-3">키워드 분석</h1>
            <p className="text-lg text-gray-600">리뷰에서 추출된 키워드의 통계와 감성 분석을 확인하세요</p>
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
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Tag className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">총 키워드</p>
              <p className="text-2xl font-bold text-gray-900">{keywordStats?.totalKeywords || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">긍정 키워드</p>
              <p className="text-2xl font-bold text-gray-900">{keywordStats?.sentimentDistribution.positive || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">부정 키워드</p>
              <p className="text-2xl font-bold text-gray-900">{keywordStats?.sentimentDistribution.negative || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Tag className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">중립 키워드</p>
              <p className="text-2xl font-bold text-gray-900">{keywordStats?.sentimentDistribution.neutral || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="키워드 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSentimentFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sentimentFilter === 'all'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSentimentFilter('긍정')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sentimentFilter === '긍정'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              긍정
            </button>
            <button
              onClick={() => setSentimentFilter('부정')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sentimentFilter === '부정'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              부정
            </button>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 키워드 빈도</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="keyword" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="긍정" stackId="a" fill="#10B981" />
              <Bar dataKey="부정" stackId="a" fill="#EF4444" />
              <Bar dataKey="중립" stackId="a" fill="#6B7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">키워드 감성 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 키워드 목록 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">키워드 상세 목록</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
            <Download className="w-4 h-4" />
            내보내기
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  키워드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 빈도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  긍정 비율
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  부정 비율
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주요 감성
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKeywords.map((keyword, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{keyword.count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${keyword.positiveRatio * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{Math.round(keyword.positiveRatio * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${keyword.negativeRatio * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{Math.round(keyword.negativeRatio * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      keyword.dominantSentiment === '긍정' ? 'bg-green-100 text-green-800' :
                      keyword.dominantSentiment === '부정' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {keyword.dominantSentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysis;