# Pixel Retro Store
Monorepo del sistema de gestión y tienda online de videojuegos y cultura retro.

## Setup local (desarrolladores)

### Backend (Laravel 12)
cd backend
cp .env.example .env
php artisan key:generate
composer install
php artisan migrate --force
php artisan db:seed
php artisan serve  # http://localhost:8000

### Frontend Web (React + Vite + Tailwind v4)
cd ../web
cp .env.example .env
npm install
npm run dev  # http://localhost:5173

