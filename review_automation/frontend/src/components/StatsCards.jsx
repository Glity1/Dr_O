import { MessageSquare, CheckCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCards = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: '전체 리뷰',
      value: stats.total_reviews,
      icon: MessageSquare,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: '답변 완료',
      value: stats.replied_reviews,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: '답변 대기',
      value: stats.pending_reviews,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: '긍정 리뷰',
      value: stats.positive_reviews,
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: '부정 리뷰',
      value: stats.negative_reviews,
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: '중립 리뷰',
      value: stats.neutral_reviews,
      icon: Minus,
      color: 'gray',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-full`}>
                <Icon className={`${card.iconColor} w-6 h-6`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;