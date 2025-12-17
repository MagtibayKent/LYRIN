import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();

  const sections = [
    { id: 'translator', icon: 'mdi:translate', title: 'Language Translator' },
    { id: 'dictionary', icon: 'mdi:book-open-variant', title: 'Dictionary' },
    { id: 'quiz', icon: 'mdi:help-box', title: 'Quiz Me' },
  ];

  const handleLogout = async () => {
    if (isAuthenticated) {
      await logout();
    }
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <aside className="sidebar">
      <div className="top-icons">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`sidebar-icon ${activeSection === section.id ? 'active' : ''}`}
            title={section.title}
            onClick={() => onSectionChange(section.id)}
          >
            <iconify-icon icon={section.icon}></iconify-icon>
          </div>
        ))}
        
        {/* Profile Button - only show when authenticated */}
        {isAuthenticated && (
          <div 
            className="sidebar-icon profile-avatar" 
            title={`Profile (${user?.name || 'User'})`}
            onClick={handleProfileClick}
          >
            <div className="avatar-circle">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
        
        {/* Logout Button */}
        <div 
          className="sidebar-icon logout-icon" 
          title={isAuthenticated ? 'Logout' : 'Go to Login'}
          onClick={handleLogout}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
