@echo off
echo Развертывание Docker-сервисов

:: Загружаем образы в Docker
echo Загрузка образов в Docker...
docker load < adaptation-admin.tar
docker load < adaptation-server.tar

:: Запускаем контейнеры
echo Запуск контейнеров...
docker-compose up -d

echo Готово! Сервисы запущены.
echo Проверьте их работу с помощью: docker-compose ps 