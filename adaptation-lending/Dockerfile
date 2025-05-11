# Используем легкий nginx образ
FROM nginx:alpine

# Устанавливаем необходимые инструменты
RUN apk add --no-cache nodejs npm

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY index.html .
COPY styles.css .
COPY scripts.js .

# Создаем скрипт для подстановки переменных окружения
RUN echo '#!/bin/sh\n\
sed -i "s|http://127.0.0.1:5173/|$IFRAME_URL|g" /usr/share/nginx/html/index.html\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Копируем файлы в nginx
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY scripts.js /usr/share/nginx/html/

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["/docker-entrypoint.sh"] 