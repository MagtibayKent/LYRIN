import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TranslatorSection from '../components/TranslatorSection';
import DictionarySection from '../components/DictionarySection';
import QuizSection from '../components/QuizSection';
import lyrinLogo from '../assets/images/Heading1.png';
import '../styles/app.css';

const AppPage = () => {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('translator');

  // Handle URL parameter for section
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['translator', 'dictionary', 'quiz'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const renderSection = () => {
    switch (activeSection) {
      case 'translator':
        return <TranslatorSection />;
      case 'dictionary':
        return <DictionarySection />;
      case 'quiz':
        return <QuizSection />;
      default:
        return <TranslatorSection />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Main Content */}
      <main className="main-content">
        <Link to="/" className="logo-link">
          <img className="logo" src={lyrinLogo} alt="Lyrin Logo" />
        </Link>

        {renderSection()}
      </main>

      {/* Loading and Error Messages */}
      <div id="loadingMessage" className="message loading-message" style={{ display: 'none' }}>
        <iconify-icon icon="mdi:loading" className="spinning"></iconify-icon>
        <span>Translating...</span>
      </div>

      <div id="errorMessage" className="message error-message" style={{ display: 'none' }}>
        <iconify-icon icon="mdi:alert-circle"></iconify-icon>
        <span id="errorText">Could not fetch data. Please try again.</span>
      </div>
    </div>
  );
};

export default AppPage;
