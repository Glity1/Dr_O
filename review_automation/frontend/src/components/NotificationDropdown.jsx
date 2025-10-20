import { useState, useEffect, useRef } from 'react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 샘플 알림 데이터
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: '긴급: 부정적 리뷰',
      message: '2개의 부정적 리뷰가 답변을 기다리고 있습니다.',
      time: '5분 전',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 2,
      type: 'success',
      title: 'AI 답변 생성 완료',
      message: '10개의 리뷰에 대한 답변이 생성되었습니다.',
      time: '15분 전',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      type: 'info',
      title: '새로운 리뷰 등록',
      message: 'VIP 고객 김민수님이 새 리뷰를 남겼습니다.',
      time: '1시간 전',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 4,
      type: 'info',
      title: '답변 대기 중',
      message: '5개의 리뷰가 답변을 기다리고 있습니다.',
      time: '2시간 전',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 5,
      type: 'success',
      title: '스크래핑 완료',
      message: '35개의 새로운 리뷰가 수집되었습니다.',
      time: '3시간 전',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-200">
        <div className="flex items-center">
          <h3 className="text-sm font-bold text-black">알림</h3>
          <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
            {notifications.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-2 py-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
        >
          닫기
        </button>
      </div>

      {/* 알림 목록 */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => {
          return (
            <div
              key={notification.id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className={`px-2 py-1 ${notification.bgColor} rounded text-xs ${notification.color}`}>{notification.type.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 푸터 */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button className="w-full text-center text-sm text-gray-600 hover:text-black font-medium transition-colors">
          모든 알림 보기
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;

