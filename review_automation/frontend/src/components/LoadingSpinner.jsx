import React from 'react';

const LoadingSpinner = ({ 
  size = 'h-12 w-12', 
  color = 'border-yellow-600',
  text = '데이터 로딩 중...',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${size} border-b-2 ${color} mb-4`}></div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
};

export default LoadingSpinner;




