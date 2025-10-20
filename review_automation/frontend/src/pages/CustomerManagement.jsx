import { useState, useEffect } from 'react';
import { getRecentReviews } from '../services/api';
import { Bell, LogOut, Menu } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import { 
  Users, 
  UserX, 
  Search, 
  Filter, 
  MoreVertical,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const CustomerManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, loyal, blacklist
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getRecentReviews(100, 0);
      setReviews(data);
    } catch (error) {
      console.error('고객 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 고객별 리뷰 그룹화
  const customerGroups = reviews.reduce((acc, review) => {
    const customerName = review.customer_name;
    if (!acc[customerName]) {
      acc[customerName] = {
        name: customerName,
        reviews: [],
        totalReviews: 0,
        positiveReviews: 0,
        negativeReviews: 0,
        lastReviewDate: null,
        avgSentiment: 0
      };
    }
    acc[customerName].reviews.push(review);
    acc[customerName].totalReviews++;
    if (review.sentiment === '긍정') acc[customerName].positiveReviews++;
    if (review.sentiment === '부정') acc[customerName].negativeReviews++;
    if (!acc[customerName].lastReviewDate || new Date(review.review_date) > new Date(acc[customerName].lastReviewDate)) {
      acc[customerName].lastReviewDate = review.review_date;
    }
    return acc;
  }, {});

  // 고객 분류
  const customers = Object.values(customerGroups).map(customer => {
    const positiveRatio = customer.totalReviews > 0 ? customer.positiveReviews / customer.totalReviews : 0;
    const negativeRatio = customer.totalReviews > 0 ? customer.negativeReviews / customer.totalReviews : 0;
    
    let type = 'normal';
    if (customer.totalReviews >= 5 && positiveRatio >= 0.8) type = 'loyal';
    if (negativeRatio >= 0.7) type = 'blacklist';
    
    return { ...customer, type, positiveRatio, negativeRatio };
  });

  // 필터링된 고객 목록
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || customer.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getCustomerTypeInfo = (type) => {
    switch (type) {
      case 'loyal':
        return { 
          label: '충성 고객', 
          color: 'text-green-600 bg-green-100', 
          icon: Star 
        };
      case 'blacklist':
        return { 
          label: '주의 고객', 
          color: 'text-red-600 bg-red-100', 
          icon: AlertTriangle 
        };
      default:
        return { 
          label: '일반 고객', 
          color: 'text-gray-600 bg-gray-100', 
          icon: Users 
        };
    }
  };

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
            <h1 className="text-3xl font-bold text-black mb-3">고객관리</h1>
            <p className="text-lg text-gray-600">전체 고객 리스트와 고객 분류를 관리하세요</p>
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
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">전체 고객</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Star className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">충성 고객</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.type === 'loyal').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <UserX className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">주의 고객</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.type === 'blacklist').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">일반 고객</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.type === 'normal').length}
              </p>
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
                placeholder="고객명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
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
              onClick={() => setFilterType('loyal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'loyal'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              충성 고객
            </button>
            <button
              onClick={() => setFilterType('blacklist')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'blacklist'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              주의 고객
            </button>
          </div>
        </div>
      </div>

      {/* 고객 목록 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">고객 목록</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredCustomers.map((customer) => {
            const typeInfo = getCustomerTypeInfo(customer.type);
            const Icon = typeInfo.icon;
            
            return (
              <div key={customer.name} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {customer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{customer.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>리뷰 {customer.totalReviews}개</span>
                        <span>|</span>
                        <span>마지막 리뷰: {new Date(customer.lastReviewDate).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
                      <Icon className="w-4 h-4" />
                      <span>{typeInfo.label}</span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">긍정 비율</div>
                      <div className="text-lg font-semibold text-green-600">
                        {Math.round(customer.positiveRatio * 100)}%
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 고객 상세 모달 */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCustomer.name} 상세 정보
                </h3>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedCustomer.totalReviews}</div>
                  <div className="text-sm text-gray-600">총 리뷰</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(selectedCustomer.positiveRatio * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">긍정 비율</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">최근 리뷰</h4>
                {selectedCustomer.reviews.slice(0, 3).map((review, index) => (
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
    </div>
  );
};

export default CustomerManagement;
