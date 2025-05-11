#!/bin/sh

# Подстановка URL для iframe из переменной окружения
IFRAME_URL=${IFRAME_URL:-"http://localhost"}
sed -i "s|http://localhost/|$IFRAME_URL|g" /usr/share/nginx/html/index.html

# Запуск nginx
exec "$@" 