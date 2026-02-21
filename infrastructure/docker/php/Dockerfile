FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    redis \
    git \
    curl \
    zip \
    unzip \
    libzip-dev \
    oniguruma-dev

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    redis \
    zip \
    mbstring \
    opcache

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY php.ini /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/api

EXPOSE 9000

CMD ["php-fpm"]
