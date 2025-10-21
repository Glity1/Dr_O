import React from 'react';

const ErrorBoundary = ({ 
  error, 
  onRetry, 
  title = '연결 오류',
  className = 'min-h-screen bg-gray-50 flex items-center justify-center p-4'
}) => {
  if (!error) return null;

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">{title}</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;









