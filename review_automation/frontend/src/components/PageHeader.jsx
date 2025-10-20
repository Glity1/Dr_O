import React, { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { Bell } from 'lucide-react';

const PageHeader = ({ 
  title, 
  subtitle, 
  showNotification = true, 
  showLogout = true,
  children 
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  const currentTime = new Date().toLocaleTimeString('ko-KR');

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border-2 border-yellow-400">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-black mb-3">{title}</h1>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 hidden sm:block">
            {currentDate} {currentTime}
          </div>
          {showNotification && (
            <>
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
            </>
          )}
          {showLogout && (
            <button className="px-3 py-2 text-gray-600 hover:text-black hover:bg-yellow-50 rounded-xl transition-all duration-200">
              로그아웃
            </button>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        마지막 업데이트: {currentTime}
      </div>
      
      {children}
    </div>
  );
};

export default PageHeader;




