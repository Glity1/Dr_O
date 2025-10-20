import React, { useState } from 'react';

const IntroScreen = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    
    // 로딩 애니메이션을 위한 딜레이
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center relative overflow-hidden">
      {/* 부드럽게 흐르는 유리글로우 레이어 */}
      <div className="absolute inset-0 opacity-30 liquid-gradient"></div>
      {/* 좌↔우로 천천히 흐르는 밝기 레이어 */}
      <div className="absolute -inset-x-1 -inset-y-0 bg-white/10 blur-3xl bg-flow"></div>
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-white rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-60 left-1/2 w-16 h-16 bg-white rounded-full animate-pulse delay-1500"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="text-center z-10 px-6">
        {/* 로고 영역 */}
        <div className="mb-12">
          <h1 className="text-8xl md:text-9xl font-bold text-black mb-4 tracking-tight logo-hover">
            Dr.O
          </h1>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-2xl md:text-3xl text-black font-semibold">
            리뷰 분석 플랫폼
          </p>
          <p className="text-lg md:text-xl text-black/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            AI가 리뷰를 분석하고 자동으로 답변을 생성하여<br />
            고객 만족도를 높이고 비즈니스 인사이트를 제공합니다
          </p>
        </div>

        {/* 시작 버튼 */}
        <div className="space-y-6">
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={`group relative px-12 py-4 bg-black text-white text-xl font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading ? 'animate-pulse' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>시작 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span>시작하기</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-bounce"></div>
              </div>
            )}
          </button>

          {/* 부가 정보 */}
          <div className="text-black/70 text-sm space-y-2">
            <p>✨ AI 기반 리뷰 분석 및 자동 답변 생성</p>
            <p>📊 고객 만족도 분석 및 인사이트 제공</p>
            <p>🎯 키워드 추출 및 감성 분석</p>
          </div>
        </div>
      </div>

      {/* 하단 데코레이션 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent"></div>
      
      {/* 움직이는 요소들 */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute top-1/3 right-16 w-3 h-3 bg-white/40 rounded-full animate-bounce delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-5 h-5 bg-white/20 rounded-full animate-bounce delay-500"></div>
      <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-white/50 rounded-full animate-bounce delay-1500"></div>
    </div>
  );
};

export default IntroScreen;
