@echo off
echo Сборка и сохранение Docker-образов

:: Создаем директорию для сохранения образов, если ее нет
if not exist docker-images mkdir docker-images

:: Собираем образы
echo Сборка docker-образов...
docker-compose build

:: Сохраняем образы в tar-файлы
echo Сохранение образов в файлы...
docker save adaptation-admin > docker-images\adaptation-admin.tar
docker save adaptation-server > docker-images\adaptation-server.tar

:: Создаем конфигурационный файл для переноса
copy docker-compose.yml docker-images\

echo Готово! Директория docker-images содержит все необходимое для переноса на сервер.
echo Перенесите содержимое этой директории на сервер. 