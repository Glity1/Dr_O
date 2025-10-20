import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import IntroScreen from './components/IntroScreen';
import Dashboard from './pages/Dashboard';
import CustomerManagement from './pages/CustomerManagement';
import AIAnalysis from './pages/AIAnalysis';
import KeywordAnalysis from './pages/KeywordAnalysis';
import CustomerStory from './pages/CustomerStory';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // 세션 스토리지에서 인트로 화면 표시 여부 확인
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/keywords" element={<KeywordAnalysis />} />
          <Route path="/stories" element={<CustomerStory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;