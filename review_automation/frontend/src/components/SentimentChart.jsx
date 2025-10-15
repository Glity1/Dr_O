import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SentimentChart = ({ trendData }) => {
  if (!trendData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">감성 추이</h2>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  // 데이터 변환: { "2024-01-15": { "긍정": 5, "부정": 2 } } 
  // → [{ date: "2024-01-15", 긍정: 5, 부정: 2, 중립: 1 }]
  const chartData = Object.keys(trendData)
    .sort()
    .map(date => ({
      date: formatDate(date),
      긍정: trendData[date]['긍정'] || 0,
      부정: trendData[date]['부정'] || 0,
      중립: trendData[date]['중립'] || 0,
    }));

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}개
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">감성 추이</h2>
        <div className="h-80 flex items-center justify-center text-gray-500">
          아직 데이터가 충분하지 않습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">최근 7일 감성 추이</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="긍정" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="부정" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="중립" 
            stroke="#6b7280" 
            strokeWidth={2}
            dot={{ fill: '#6b7280', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;