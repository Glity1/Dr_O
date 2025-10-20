const StatsCards = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse border-2 border-yellow-400">
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
      value: stats.total_reviews
    },
    {
      title: '답변 완료',
      value: stats.replied_reviews
    },
    {
      title: '답변 대기',
      value: stats.pending_reviews
    },
    {
      title: '긍정 리뷰',
      value: stats.positive_reviews
    },
    {
      title: '부정 리뷰',
      value: stats.negative_reviews
    },
    {
      title: '중립 리뷰',
      value: stats.neutral_reviews
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        return (
          <div 
            key={index}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-yellow-400"
          >
            <div className="flex items-center justify-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-black">{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;