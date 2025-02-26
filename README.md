# Laravel Project with React and TypeScript Integration

This project is a Laravel application with React and TypeScript integrated for front-end development. It uses Laravel Mix for asset compilation, including React, TypeScript, and SCSS.

## Features

- **Laravel Framework**: Powerful backend development with Laravel.
- **React Support**: Build dynamic and interactive front-end components.
- **TypeScript Support**: Write strongly-typed JavaScript for your front-end.
- **SCSS Support**: Easily manage and compile styles with SCSS.

---

## Requirements

- PHP >= v8.3
- Composer
- Node >= v23  & NVM
- Docker Desktop

---

## Installation
1. Build the Docker containers:
   ```bash
   cd ./docker/
   ```
    ```bash
    docker-compose build
    ```

2. Create a new Laravel project using Docker Compose:
   ```bash
   cd ..
   ```
   ```bash
   laravel new laravel
   ```
 
3. Install Node.js dependencies:
   
    for iOS  
   ```bash
   cd .\laravel\ 
    ```
   for Windows
   ```bash
   cd ./laravel/ 
    ```

   ```bash
   nvm use 23
   ```
   
    ```bash
   npm install
   ```

4. Update the `.env` file with the following database configuration:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=laravel_db
   DB_USERNAME=laravel
   DB_PASSWORD=password
   ```

5. Start the Docker containers in detached mode:

    ```bash
    docker-compose up -d
    ```
6. Run migrations using Docker Compose:
   ```bash
   cd ../docker/
   ```
   ```bash
   docker-compose exec php php /var/www/laravel/artisan migrate --seed
   ```
---

## React and TypeScript Configuration
### Install TypeScript
- Production build:

```bash
  npm install --save-dev typescript @types/react @types/react-dom @inertiajs/inertia @inertiajs/react
```
  
- Rename Main File:
```bash
   mv resources/js/app.jsx resources/js/app.tsx
```

update vite.config.js
```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
   plugins: [
      laravel({
         input: ['resources/js/app.tsx', 'resources/css/app.scss'],
         refresh: true,
      }),
      react(),
   ],
});
```

Create a tsconfig.json File
```bash
  npx tsc --init
```

Then, open the generated tsconfig.json and modify these settings:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "preserve",
    "strict": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["resources/js/*"]
    },
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

Update resources/js/app.tsx
```tsx
import '../css/app.css';
import '../scss/app.scss';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName: string = import.meta.env.VITE_APP_NAME || 'Laravel';

(async () => {
   await createInertiaApp({
      title: (title: string) => `${title} - ${appName}`,
      resolve: (name) =>
              resolvePageComponent(
                      `./Pages/${name}.tsx`, // Ensure Pages use .tsx
                      import.meta.glob('./Pages/**/*.tsx'),
              ),
      setup({ el, App, props }) {
         const root = createRoot(el);
         root.render(<App {...props} />);
      },
      progress: {
         color: '#4B5563',
      },
   });
})();
```

Rename All .jsx Files to .tsx

```bash
  find resources/js -name "*.jsx" -exec bash -c 'mv "$0" "${0%.jsx}.tsx"' {} \;
```


### Blade Template Update
Ensure your Blade template has a `resources/css/app.scss`  in your main layout or template file:

```html
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1">

   <title inertia>{{ config('app.name', 'Laravel') }}</title>

   <!-- Fonts -->
   <link rel="preconnect" href="https://fonts.bunny.net">
   <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

   <!-- Scripts -->
   @routes
   @viteReactRefresh
   @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx", 'resources/css/app.scss'])
   @inertiaHead
</head>
<body class="font-sans antialiased">
@inertia
</body>
</html>



```

---

## Install Sass and Required Dependencies
```bash 
  npm install --save-dev sass
```

Import SCSS in Your React TypeScript Files
```tsx
import '../scss/app.scss';
```

---

## Usage

Visit your application at `http://localhost:8000`.


---


## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

