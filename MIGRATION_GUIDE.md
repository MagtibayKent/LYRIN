# Lyrin Translator - Laravel + React Migration Guide

## 📁 Project Structure Overview

```
IT-110-main - final/
├── backend/                    # Laravel API Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── TranslationController.php
│   │   │   │   ├── DictionaryController.php
│   │   │   │   ├── QuizController.php
│   │   │   │   └── LearningController.php
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Translation.php
│   │   │   ├── QuizScore.php
│   │   │   └── LearningProgress.php
│   │   └── Providers/
│   ├── config/
│   │   ├── cors.php           # CORS configuration
│   │   └── sanctum.php        # Sanctum auth config
│   ├── database/migrations/
│   ├── routes/
│   │   └── api.php            # API routes
│   ├── .env.example
│   └── composer.json
│
├── frontend/                   # React Frontend
│   ├── public/
│   │   └── images/            # Copy assets here
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TranslatorSection.jsx
│   │   │   ├── LearningSection.jsx
│   │   │   ├── DictionarySection.jsx
│   │   │   └── QuizSection.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AppPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useTranslation.js
│   │   │   └── useSpeech.js
│   │   ├── services/
│   │   │   └── api.js         # API integration
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── portfolio.css
│   │   │   ├── app.css
│   │   │   └── auth.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── assets/                     # Original assets (copy to frontend/public)
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Set Up Laravel Backend

#### 1.1 Navigate to Backend Directory
```powershell
cd "c:\Users\Edward\Documents\IT-110-main - final\backend"
```

#### 1.2 Install Dependencies
```powershell
composer install
```

#### 1.3 Configure Environment
```powershell
# Copy environment file
Copy-Item .env.example .env

# Generate application key
php artisan key:generate
```

#### 1.4 Configure Database (Laragon)
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lyrin
DB_USERNAME=root
DB_PASSWORD=
```

#### 1.5 Create Database in Laragon
1. Open Laragon
2. Start MySQL
3. Click "Database" button
4. Create new database named `lyrin`

#### 1.6 Run Migrations
```powershell
php artisan migrate
```

#### 1.7 Create Storage Link (for file uploads)
```powershell
php artisan storage:link
```

#### 1.8 Start Laravel Server
```powershell
php artisan serve --port=8000
```

The API is now available at: `http://localhost:8000`

---

### Step 2: Set Up React Frontend

#### 2.1 Navigate to Frontend Directory
```powershell
cd "c:\Users\Edward\Documents\IT-110-main - final\frontend"
```

#### 2.2 Install Dependencies
```powershell
npm install
```

#### 2.3 Copy Assets
```powershell
# Create public/images directory
mkdir public\images

# Copy images from original assets
Copy-Item "..\assets\images\*" "public\images\" -Recurse
```

#### 2.4 Configure Environment
```powershell
Copy-Item .env.example .env
```

Edit `.env` if needed:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Lyrin Translator
```

#### 2.5 Start Development Server
```powershell
npm run dev
```

The React app is now available at: `http://localhost:5173`

---

## 🔌 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/register` | Register new user | No |
| POST | `/api/v1/login` | Login user | No |
| POST | `/api/v1/logout` | Logout user | Yes |
| GET | `/api/v1/user` | Get current user | Yes |
| PUT | `/api/v1/user/profile` | Update profile | Yes |

### Translation
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/translate` | Translate text | No |
| GET | `/api/v1/languages` | Get supported languages | No |
| GET | `/api/v1/translations/history` | Get translation history | Yes |
| POST | `/api/v1/translations/save` | Save translation | Yes |
| DELETE | `/api/v1/translations/{id}` | Delete translation | Yes |

### Dictionary
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/dictionary/search?q=word` | Search dictionary | No |
| GET | `/api/v1/dictionary/word/{word}` | Get word details | No |

### Learning
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/learning/phrases` | Get phrases | No |
| GET | `/api/v1/learning/categories` | Get categories | No |
| GET | `/api/v1/learning/progress` | Get progress | Yes |
| POST | `/api/v1/learning/progress` | Update progress | Yes |

### Quiz
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/quiz/questions` | Get questions | No |
| POST | `/api/v1/quiz/submit` | Submit quiz | No* |
| GET | `/api/v1/quiz/scores` | Get scores | Yes |

---

## 🔄 Blade to React Conversion Reference

### Replacing Blade Directives with React Logic

#### @auth / @guest → useAuth Hook
```blade
{{-- Blade --}}
@auth
    <p>Welcome, {{ Auth::user()->name }}</p>
@endauth
@guest
    <a href="/login">Login</a>
@endguest
```

```jsx
// React
import { useAuth } from './context/AuthContext';

function Component() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <>
      {isAuthenticated ? (
        <p>Welcome, {user.name}</p>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </>
  );
}
```

#### @if / @else → Conditional Rendering
```blade
{{-- Blade --}}
@if($items->count() > 0)
    @foreach($items as $item)
        <li>{{ $item->name }}</li>
    @endforeach
@else
    <p>No items found</p>
@endif
```

```jsx
// React
function ItemList({ items }) {
  return (
    <>
      {items.length > 0 ? (
        items.map(item => <li key={item.id}>{item.name}</li>)
      ) : (
        <p>No items found</p>
      )}
    </>
  );
}
```

#### @csrf → Handled by API/Sanctum
```blade
{{-- Blade --}}
<form method="POST" action="/translate">
    @csrf
    <input name="text" />
</form>
```

```jsx
// React - CSRF is handled by Sanctum/API tokens
import { translationAPI } from './services/api';

function TranslateForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await translationAPI.translate(text, source, target);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={e => setText(e.target.value)} />
    </form>
  );
}
```

---

## 🌐 Sample API Calls from React

### Translation Request
```javascript
import { translationAPI } from './services/api';

// Translate text
const translateText = async () => {
  try {
    const response = await translationAPI.translate(
      'Hello world',  // text
      'en',           // source language
      'fil'           // target language
    );
    console.log(response.data.data.translated);
  } catch (error) {
    console.error('Translation failed:', error);
  }
};
```

### Authentication
```javascript
import { authAPI } from './services/api';

// Login
const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('auth_token', token);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register
const register = async (name, email, password) => {
  try {
    const response = await authAPI.register({
      name,
      email,
      password,
      password_confirmation: password
    });
    return response.data.data;
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

---

## ⚠️ Common Issues & Solutions

### 1. CORS Errors
**Problem:** `Access-Control-Allow-Origin` errors

**Solution:** 
- Check `backend/config/cors.php` has correct origins
- Ensure `supports_credentials` is `true`
- Add your frontend URL to `allowed_origins`

```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
],
'supports_credentials' => true,
```

### 2. 404 API Errors
**Problem:** API routes return 404

**Solution:**
- Ensure Laravel is running: `php artisan serve --port=8000`
- Check route prefix: API routes are under `/api/v1/`
- Verify route exists: `php artisan route:list`

### 3. "Cannot Connect to Server"
**Problem:** Frontend can't reach backend

**Solution:**
- Check both servers are running
- Verify URLs in frontend `.env`:
  ```env
  VITE_API_URL=http://localhost:8000/api/v1
  ```
- Check Laragon services are started

### 4. Authentication Errors
**Problem:** Sanctum authentication not working

**Solution:**
- Ensure `SANCTUM_STATEFUL_DOMAINS` includes frontend URL
- Check `withCredentials: true` in axios config
- Verify token is being sent in Authorization header

### 5. Database Connection Issues
**Problem:** Can't connect to MySQL

**Solution:**
- Start MySQL in Laragon
- Check `.env` database credentials
- Create the database if it doesn't exist

---

## 🏭 Production Setup Best Practices

### Backend (Laravel)
1. **Environment:**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Optimize:**
   ```powershell
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   composer install --optimize-autoloader --no-dev
   ```

3. **HTTPS:** Configure SSL certificate

### Frontend (React)
1. **Build:**
   ```powershell
   npm run build
   ```

2. **Environment:**
   ```env
   VITE_API_URL=https://your-api-domain.com/api/v1
   ```

3. **Deploy:** Serve `dist/` folder via Nginx/Apache

### Deployment Checklist
- [ ] Update CORS origins for production domain
- [ ] Set `APP_DEBUG=false`
- [ ] Use HTTPS for both frontend and backend
- [ ] Configure proper database credentials
- [ ] Set up proper file permissions
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
APP_NAME=Lyrin
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lyrin
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Lyrin Translator
```

---

## 🎯 Quick Start Commands

### Start Everything (in separate terminals)

**Terminal 1 - Backend:**
```powershell
cd backend
php artisan serve --port=8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/v1
- **API Health Check:** http://localhost:8000/api/health

---

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite](https://vitejs.dev)
- [Axios](https://axios-http.com)
