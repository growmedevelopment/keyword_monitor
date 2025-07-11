FROM composer:latest

WORKDIR /var/www/laravel

# Copy Laravel project (assuming relative path)
COPY ../../backend /var/www/laravel

RUN composer install --no-scripts --prefer-dist --no-interaction --ignore-platform-reqs
