import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI, dictionaryAPI } from '../services/api';
import '../styles/profile.css';

/**
 * ProfilePage Component
 * Displays user profile, quiz history, and dictionary search history
 */
const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [dictionaryHistory, setDictionaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dictionaryLoading, setDictionaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dictionaryError, setDictionaryError] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('quiz');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch quiz scores
  useEffect(() => {
    const fetchScores = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await quizAPI.getScores();
        setScores(response.data.scores || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scores:', err);
        setError('Failed to load quiz history');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [isAuthenticated]);

  // Fetch dictionary search history
  useEffect(() => {
    const fetchDictionaryHistory = async () => {
      if (!isAuthenticated) return;
      
      try {
        setDictionaryLoading(true);
        const response = await dictionaryAPI.getHistory();
        setDictionaryHistory(response.data.history || []);
        setDictionaryError(null);
      } catch (err) {
        console.error('Failed to fetch dictionary history:', err);
        setDictionaryError('Failed to load search history');
      } finally {
        setDictionaryLoading(false);
      }
    };

    fetchDictionaryHistory();
  }, [isAuthenticated]);

  // Clear dictionary history
  const handleClearDictionaryHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all dictionary search history?')) {
      return;
    }
    
    try {
      setClearingHistory(true);
      await dictionaryAPI.clearHistory();
      setDictionaryHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      alert('Failed to clear search history');
    } finally {
      setClearingHistory(false);
    }
  };

  // Delete single history item
  const handleDeleteHistoryItem = async (id) => {
    try {
      await dictionaryAPI.deleteHistoryItem(id);
      setDictionaryHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      alert('Failed to delete history item');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Language data mapping
  const languageData = {
    filipino: { flag: '🇵🇭', name: 'Filipino', color: '#0038a8' },
    english: { flag: '🇺🇸', name: 'English', color: '#3c3b6e' },
    japanese: { flag: '🇯🇵', name: 'Japanese', color: '#bc002d' },
    spanish: { flag: '🇪🇸', name: 'Spanish', color: '#c60b1e' },
    french: { flag: '🇫🇷', name: 'French', color: '#0055a4' },
    korean: { flag: '🇰🇷', name: 'Korean', color: '#003478' }
  };

  const getLanguageInfo = (language) => {
    return languageData[language?.toLowerCase()] || { flag: '🌐', name: language || 'Unknown', color: '#666' };
  };

  // Get score color and label based on percentage
  const getScoreInfo = (percentage) => {
    if (percentage >= 90) return { color: '#16a34a', bg: '#dcfce7', label: 'Excellent!' };
    if (percentage >= 80) return { color: '#22c55e', bg: '#dcfce7', label: 'Great!' };
    if (percentage >= 70) return { color: '#84cc16', bg: '#ecfccb', label: 'Good' };
    if (percentage >= 60) return { color: '#eab308', bg: '#fef9c3', label: 'Fair' };
    if (percentage >= 50) return { color: '#f97316', bg: '#ffedd5', label: 'Needs Work' };
    return { color: '#ef4444', bg: '#fee2e2', label: 'Keep Trying' };
  };

  // Calculate stats
  const stats = {
    totalQuizzes: scores.length,
    averageScore: scores.length > 0 
      ? Math.round(scores.reduce((acc, s) => acc + (parseInt(s.percentage) || 0), 0) / scores.length) 
      : 0,
    bestScore: scores.length > 0 
      ? Math.max(...scores.map(s => parseInt(s.percentage) || 0)) 
      : 0,
    perfectScores: scores.filter(s => parseInt(s.percentage) === 100).length,
    languagesAttempted: [...new Set(scores.map(s => s.language))].length
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <Link to="/app" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to App
        </Link>
      </header>

      <div className="profile-content">
        {/* User Card */}
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <h1 className="user-name">{user?.name || 'User'}</h1>
            <p className="user-email">{user?.email || ''}</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        {scores.length > 0 && (
          <div className="stats-container">
            <div className="stat-card primary">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalQuizzes}</span>
                <span className="stat-label">Quizzes Taken</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.46 15.46 8 9.5 1 16"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.averageScore}%</span>
                <span className="stat-label">Average Score</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2"/>
                  <path d="M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2H6V5z"/>
                  <path d="M12 16v-4M8 16v-2M16 16v-2"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.bestScore}%</span>
                <span className="stat-label">Best Score</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 10.26 24 10.27 17.55 16.36 19.64 24.63 12 18.54 4.36 24.63 6.45 16.36 0 10.27 8.91 10.26 12 2"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.perfectScores}</span>
                <span className="stat-label">Perfect Scores</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.languagesAttempted}</span>
                <span className="stat-label">Languages</span>
              </div>
            </div>
          </div>
        )}

        {/* History Section with Tabs */}
        <div className="history-section">
          <div className="history-tabs">
            <button 
              className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Quiz History
            </button>
            <button 
              className={`tab-button ${activeTab === 'dictionary' ? 'active' : ''}`}
              onClick={() => setActiveTab('dictionary')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Dictionary History
              {dictionaryHistory.length > 0 && (
                <span className="tab-badge">{dictionaryHistory.length}</span>
              )}
            </button>
          </div>

          {/* Quiz History Tab */}
          {activeTab === 'quiz' && (
            <div className="tab-content">
              <h2 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Quiz History
              </h2>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your quiz history...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <div className="error-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
              ) : scores.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
                      <path d="M2 7h20"/>
                      <path d="M7 2v18"/>
                      <path d="M12 2v18"/>
                      <path d="M17 2v18"/>
                    </svg>
                  </div>
                  <h3>No quizzes yet!</h3>
                  <p>Take your first quiz to see your progress here.</p>
                  <Link to="/app" className="start-quiz-btn">
                    Start a Quiz →
                  </Link>
                </div>
              ) : (
                <div className="quiz-history-list">
                  {scores.map((score, index) => {
                    const langInfo = getLanguageInfo(score.language);
                    const scoreInfo = getScoreInfo(score.percentage);
                    
                    return (
                      <div key={score.id || index} className="quiz-result-card">
                        <div className="quiz-language">
                          <span className="flag">{langInfo.flag}</span>
                          <span className="name">{langInfo.name}</span>
                        </div>
                        
                        <div className="quiz-score-display">
                          <div className="score-bar-container">
                            <div 
                              className="score-bar" 
                              style={{ 
                                width: `${score.percentage}%`,
                                backgroundColor: scoreInfo.color 
                              }}
                            />
                          </div>
                          <div className="score-details">
                            <span 
                              className="score-percentage"
                              style={{ color: scoreInfo.color }}
                            >
                              {score.percentage}%
                            </span>
                            <span className="score-raw">
                              {score.score}/{score.total}
                            </span>
                          </div>
                        </div>
                        
                        <div className="quiz-meta">
                          <span 
                            className="score-badge"
                            style={{ 
                              backgroundColor: scoreInfo.bg,
                              color: scoreInfo.color 
                            }}
                          >
                            {scoreInfo.label}
                          </span>
                          <span className="quiz-date">{score.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dictionary History Tab */}
          {activeTab === 'dictionary' && (
            <div className="tab-content">
              <div className="section-header">
                <h2 className="section-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  Dictionary Search History
                </h2>
                {dictionaryHistory.length > 0 && (
                  <button 
                    className="clear-history-btn"
                    onClick={handleClearDictionaryHistory}
                    disabled={clearingHistory}
                  >
                    {clearingHistory ? (
                      <>
                        <div className="btn-spinner"></div>
                        Clearing...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Clear History
                      </>
                    )}
                  </button>
                )}
              </div>

              {dictionaryLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your search history...</p>
                </div>
              ) : dictionaryError ? (
                <div className="error-state">
                  <div className="error-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p>{dictionaryError}</p>
                  <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
              ) : dictionaryHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      <circle cx="12" cy="10" r="3"/>
                      <path d="M15 13l2 2"/>
                    </svg>
                  </div>
                  <h3>No searches yet!</h3>
                  <p>Search for words in the dictionary to see your history here.</p>
                  <Link to="/app?section=dictionary" className="start-quiz-btn">
                    Go to Dictionary →
                  </Link>
                </div>
              ) : (
                <div className="dictionary-history-list">
                  {dictionaryHistory.map((item, index) => (
                    <div key={item.id || index} className="dictionary-item">
                      <div className="dictionary-word-info">
                        <span className={`word-status ${item.found ? 'found' : 'not-found'}`}>
                          {item.found ? '✓' : '✗'}
                        </span>
                        <div className="word-details">
                          <span className="word-text">{item.word}</span>
                          {item.phonetic && (
                            <span className="word-phonetic">{item.phonetic}</span>
                          )}
                        </div>
                      </div>
                      <div className="dictionary-meta">
                        <span className={`status-badge ${item.found ? 'success' : 'failed'}`}>
                          {item.found ? 'Found' : 'Not Found'}
                        </span>
                        <span className="search-date">{item.date} at {item.time}</span>
                        <button 
                          className="delete-item-btn"
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          title="Delete this item"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
