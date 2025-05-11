#!/bin/sh

# Подстановка URL для iframe из переменной окружения
IFRAME_URL=${IFRAME_URL:-"http://127.0.0.1:5173/"}
sed -i "s|http://127.0.0.1:5173/|$IFRAME_URL|g" /usr/share/nginx/html/index.html

# Запуск nginx
exec "$@" 