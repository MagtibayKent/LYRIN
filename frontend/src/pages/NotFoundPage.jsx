import { Link } from 'react-router-dom';
import '../styles/auth.css';

const NotFoundPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>404</h1>
        <p className="auth-subtitle">Page not found</p>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <br />
        <Link to="/" className="auth-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Go Home
        </Link>
        <br /><br />
        <Link to="/app" className="skip-link">
          Go to Translator →
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
