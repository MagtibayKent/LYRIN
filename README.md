# Lyrin - Laravel + React + Inertia + MySQL

A modern language learning application built with Laravel, React, Inertia.js, and MySQL.

## Prerequisites

- PHP >= 8.1
- Composer
- Node.js >= 18
- MySQL >= 5.7
- Laragon (or any local development environment)

## Installation

1. **Clone the repository and install PHP dependencies:**
   ```bash
   composer install
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

5. **Configure database in `.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=lyrin_app
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. **Create the database:**
   - Create a MySQL database named `lyrin_app`
   - Or run: `CREATE DATABASE lyrin_app;`

7. **Run migrations:**
   ```bash
   php artisan migrate
   ```

8. **Build frontend assets:**
   ```bash
   npm run build
   ```

## Development

1. **Start Laravel development server:**
   ```bash
   php artisan serve
   ```

2. **Start Vite development server (in a separate terminal):**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Visit: `http://localhost:8000`

## Project Structure

```
IT110-FINAL/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Laravel controllers
│   │   └── Middleware/      # Inertia middleware
│   └── Models/              # Eloquent models
├── database/
│   └── migrations/          # Database migrations
├── resources/
│   ├── js/
│   │   ├── Pages/          # Inertia page components
│   │   ├── components/     # React components
│   │   └── Layouts/        # Layout components
│   └── views/
│       └── app.blade.php   # Inertia root template
├── routes/
│   └── web.php             # Web routes
└── public/                 # Public assets
```

## Features

- ✅ User Authentication (Login/Register)
- ✅ Translator Page
- ✅ Dictionary Search
- ✅ Quiz System
- ✅ Profile Page with History
- ✅ Responsive Design

## Technologies Used

- **Backend:** Laravel 10
- **Frontend:** React 18 + TypeScript
- **Integration:** Inertia.js
- **Database:** MySQL
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI

## License

MIT

