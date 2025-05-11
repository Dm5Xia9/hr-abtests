FROM nginx:alpine

# Установка необходимых инструментов
RUN apk add --no-cache nodejs npm

# Копирование файлов проекта
COPY . /usr/share/nginx/html/

# Копирование скрипта для подстановки переменных окружения
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Удаление дефолтной конфигурации nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копирование нашей конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 