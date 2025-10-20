import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SettingsModal from './SettingsModal';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();

  const handleReplayIntro = () => {
    sessionStorage.removeItem('hasSeenIntro');
    window.location.reload();
  };

  const navigation = [
    { name: '대시보드', href: '/' },
    { name: '고객관리', href: '/customers' },
    { name: 'AI 분석', href: '/ai-analysis' },
    { name: '키워드 분석', href: '/keywords' },
    { name: '고객 스토리', href: '/stories' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
        </div>
      )}

      {/* 사이드바 - 전체 높이 고정 */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-yellow-400 shadow-md border-r border-gray-200 h-screen overflow-y-auto">
        <div className="flex items-center justify-between h-28 px-6 border-b border-gray-200 bg-yellow-400">
          <div className="flex items-center">
            <div className="ml-3">
              <span className="text-4xl font-bold text-black">Dr.O</span>
              <p className="text-lg text-black font-semibold">리뷰 분석 플랫폼</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden px-2 py-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            닫기
          </button>
        </div>

        <nav className="mt-8 px-4 bg-yellow-400 rounded-lg mx-2 py-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-amber-500 hover:text-white hover:shadow-md hover:transform hover:scale-105'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 하단 사용자 메뉴 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-yellow-400">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">관리자</p>
              <p className="text-xs text-gray-600 truncate">admin@example.com</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSettingsOpen(true)}
              className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors font-medium"
            >
              설정
            </button>
            <button className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors font-medium">
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="lg:pl-64">
        {/* 페이지 컨텐츠 - 전체 너비 사용 */}
        <main className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
          {children}
        </main>
      </div>

      {/* 설정 모달 */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        onReplayIntro={handleReplayIntro}
      />
    </div>
  );
};

export default Layout;
