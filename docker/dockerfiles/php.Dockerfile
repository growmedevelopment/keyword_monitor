FROM php:8.3-fpm-alpine

WORKDIR /var/www/laravel

# Install necessary dependencies
RUN apk add --no-cache \
    bash \
    autoconf \
    gcc \
    g++ \
    make \
    linux-headers \
    mysql-client \
    libpq \
    mysql-dev


# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Install Xdebug via PECL
RUN pecl install xdebug && docker-php-ext-enable xdebug || true

# Configure Xdebug
RUN echo "zend_extension=$(find /usr/local/lib/php/extensions/ -name xdebug.so)" > /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set correct permissions
# Ensure Laravel storage and cache directories exist and set correct permissions
RUN mkdir -p /var/www/laravel/storage /var/www/laravel/bootstrap/cache \
    && chown -R www-data:www-data /var/www/laravel/storage /var/www/laravel/bootstrap/cache

CMD ["php-fpm", "-y", "/usr/local/etc/php-fpm.conf", "-R"]


