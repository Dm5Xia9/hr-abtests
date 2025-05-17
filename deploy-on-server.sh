#!/bin/bash

# Распаковываем архив с образами
echo "Распаковка архива с образами..."
tar -xzf docker-images.tar.gz

# Загружаем образы в Docker
echo "Загрузка образов в Docker..."
docker load < docker-images/adaptation-admin.tar
docker load < docker-images/adaptation-server.tar

# Запускаем контейнеры
echo "Запуск контейнеров..."
docker-compose up -d

echo "Готово! Сервисы запущены."
echo "Проверьте их работу с помощью: docker-compose ps" 