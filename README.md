# Laravel + React + TypeScript Docker Starter

This project is a modern development starter combining **Laravel** (PHP backend) and **React + TypeScript** (frontend SPA) using **Vite**. It is containerized with **Docker** for a seamless and scalable full-stack workflow.

---

## 🚀 Features

- **Laravel 10+** backend (API-first)
- **React + TypeScript + Vite** SPA frontend
- **MySQL 8** database
- **Dockerized** services for PHP, MySQL, Nginx, Node
- **Live reload** for frontend via Vite dev server
- **Hot-reload friendly** for Laravel and React during development

---

## 🧰 Requirements

- Docker & Docker Compose
- Node.js (v23+) if running frontend outside Docker

---

## 📦 Project Structure

```
LaravelReactDockerStarter/
├── backend/         # Laravel app
├── frontend/        # React + TypeScript app (Vite)
├── docker/
│   ├── php/
│   ├── composer/
│   ├── frontend/
│   └── nginx/
├── docker-compose.yaml
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourname/yourproject.git
cd yourproject
```

### 2. Initialize the Frontend

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
```

Optional (for SCSS):

```bash
npm install --save-dev sass
```

Add to `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://nginx',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

---

### 3. Set Laravel `.env`

Update `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel
DB_PASSWORD=laravel_password
```

---

### 4. Start the Application

From the root directory:

```bash
docker-compose up --build
```

---

### 5. Migrate the Database

```bash
docker-compose exec php php artisan migrate --seed
```

---

## 🧪 Development Access

- **Frontend (Vite)**: [http://localhost:5173](http://localhost:5173)
- **Backend (Laravel)**: [http://localhost:8000](http://localhost:8000)
- **API Proxy**: Frontend calls to `/api/*` will be proxied to Laravel

---

## 🏗 Production Mode (Optional)

In production, you can build the frontend with:

```bash
docker-compose run --rm frontend npm run build
```

Then serve it via Nginx from the `/frontend/dist` folder.

---

## 📝 License

This project is open-source and available under the [MIT license](https://opensource.org/licenses/MIT).
