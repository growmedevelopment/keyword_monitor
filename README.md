# Laravel + React + TypeScript Docker Starter

This project is a modern development starter combining **Laravel** (PHP backend) and **React + TypeScript** (frontend SPA) using **Vite**. It is containerized with **Docker** for a seamless and scalable full-stack workflow.

---

## 🚀 Features

- **Laravel 12+** backend (API-first)
- **React + TypeScript + Vite** SPA frontend
- **MySQL 8** database
- **Dockerized** services for PHP, MySQL, Nginx
- **Live reload** for frontend via Vite dev server
- **Hot-reload friendly** for Laravel and React during development

---

## 🧰 Requirements

- Docker & Docker Compose
- Node.js (v24+ optional) — only needed if you run Vite outside Docker

---

## 📦 Project Structure

```
KeywordMonitor/
├── backend/         # Laravel app
├── frontend/        # React + TypeScript app (Vite)
├── docker/
│   ├── php/
│   ├── composer/
│   └── nginx/
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
    git clone https://github.com/yourname/yourproject.git
    cd yourproject
```

---

### 2. Initialize the Frontend (One-Time Setup)

If the `frontend/` folder is empty, create the app manually:

```bash
    npm create vite@latest frontend -- --template react-ts
    cd frontend
    npm install
```

Or using `yarn`:

```bash
    yarn create vite frontend --template react-ts
    cd frontend
    yarn
```

---

### 3. Configure Vite Proxy for Laravel API

Edit `frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
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

You can also install SCSS:

```bash
    npm install --save-dev sass
```

---

### 4. Set Laravel `.env`

Update `backend/.env` with Docker DB credentials:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel
DB_PASSWORD=laravel_password
```

---

### 5. Start the App

From the root directory:

```bash
    docker-compose up --build
```

> This will start:
> - Laravel at [http://localhost:8000](http://localhost:8000)
> - React at [http://localhost:5173](http://localhost:5173)

---

### 6. Run Laravel Commands

```bash
    docker-compose run --rm artisan migrate
    docker-compose run --rm artisan key:generate
```

---

## 🧪 Development Access

- **Frontend (React + Vite)**: [http://localhost:5173](http://localhost:5173)
- **Backend (Laravel)**: [http://localhost:8000](http://localhost:8000)
- **API Calls**: Frontend can call `/api/*` and it will proxy to Laravel automatically

---

## 🏗 Production Mode (Optional)

To build frontend for production:

```bash
    cd frontend
    npm run build
```

Then update your Nginx config to serve `/frontend/dist` as a static site.

---
