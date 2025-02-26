# Laravel Project with React and TypeScript Integration

This project is a Laravel application with React and TypeScript integrated for front-end development. It uses Laravel Mix for asset compilation, including React, TypeScript, and SCSS.

## Features

- **Laravel Framework**: Powerful backend development with Laravel.
- **React Support**: Build dynamic and interactive front-end components.
- **TypeScript Support**: Write strongly-typed JavaScript for your front-end.
- **SCSS Support**: Easily manage and compile styles with SCSS.
- **Laravel Mix**: Simplified Webpack configuration for asset management.

---

## Requirements

- PHP >= 8.3
- Composer
- Node.js & npm
- Docker & Docker Compose

---

## Installation

1. Start the Docker containers in detached mode:

   ```bash
   docker-compose up -d
   ```

2. Create a new Laravel project using Docker Compose:

   ```bash
   docker-compose run composer create-project laravel/laravel .
   ```

3. Install Node.js dependencies:
    
   ```bash
   cd .\src\
   npm install
   ```

4. Generate the application key:

   ```bash
   php artisan key:generate
   ```

5. Update the `.env` file with the following database configuration:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=laravel_db
   DB_USERNAME=laravel
   DB_PASSWORD=password
   ```

6. Run migrations using Docker Compose:

   ```bash
   docker-compose run artisan migrate
   ```

---

## React and TypeScript Configuration

### Files and Directories
- **Source Directory**: `resources/ts/`
- **Compiled Output**: `public/js/`

### Compile Assets

- Development build:

  ```bash
  npm run dev
  ```

- Production build:

  ```bash
  npm run prod
  ```

### Example React and TypeScript File

Create your TypeScript files in `resources/ts/`. Example:

`resources/ts/app.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom';

const App: React.FC = () => {
    return (
        <div>
            <h1>Hello, React with TypeScript in Laravel!</h1>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('app'));
```

### Blade Template Update
Ensure your Blade template has a `<div>` element with the `id="app"` in your main layout or template file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel with React and TypeScript</title>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
</head>
<body>
    <div id="app"></div>
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>
```

---

## Usage

### Run Laravel Server
Use Artisan to serve your application:

```bash
php artisan serve
```

Visit your application at `http://localhost:8000`.

---

## Development with Docker (Optional)

1. Build and start the Docker containers:

   ```bash
   docker-compose up --build
   ```

2. Access the application at `http://localhost:8000`.

---

## Laravel Mix Configuration

The `webpack.mix.js` file includes configurations for React, TypeScript, and SCSS:

```javascript
const mix = require('laravel-mix');

mix.ts('resources/ts/app.tsx', 'public/js')
   .react() // Enable React support
   .sass('resources/sass/app.scss', 'public/css')
   .sourceMaps();
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

