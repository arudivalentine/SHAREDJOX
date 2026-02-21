FROM php:8.3-fpm-alpine

WORKDIR /var/www/api

RUN apk add --no-cache \
    postgresql-dev \
    redis \
    pcntl \
    libpng-dev \
    libjpeg-turbo-dev \
    libzip-dev \
    icu-dev \
    git \
    curl \
    unzip \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_pgsql \
    gd \
    zip \
    intl \
    pcntl

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN apk add --no-cache nodejs npm

RUN mkdir -p /var/www/api && chown -R www-data:www-data /var/www/api

EXPOSE 9000

CMD ["php-fpm"]
