#!/bin/bash

# Создаем директорию для сохранения образов, если ее нет
mkdir -p docker-images

# Собираем образы
echo "Сборка docker-образов..."
docker-compose build

# Сохраняем образы в tar-файлы
echo "Сохранение образов в файлы..."
docker save adaptation-admin > docker-images/adaptation-admin.tar
docker save adaptation-server > docker-images/adaptation-server.tar

# Создаем архив со всеми образами
echo "Создание общего архива..."
tar -czf docker-images.tar.gz docker-images

echo "Готово! Файл docker-images.tar.gz содержит все образы."
echo "Перенесите этот файл и docker-compose.yml на сервер." 