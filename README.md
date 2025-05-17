# hr-abtests

# Инструкция по сборке и переносу Docker-образов

## На локальной машине

### Linux/Mac:
1. Сделайте скрипт исполняемым:
   ```
   chmod +x build-and-save.sh
   ```
2. Запустите скрипт:
   ```
   ./build-and-save.sh
   ```
3. После выполнения вы получите файл `docker-images.tar.gz` с образами.
4. Перенесите файлы `docker-images.tar.gz` и `docker-compose.yml` на сервер.

### Windows:
1. Запустите скрипт `build-and-save.bat`.
2. После выполнения в директории `docker-images` будут созданы tar-файлы с образами.
3. Перенесите содержимое директории `docker-images` на сервер.

## На сервере

### Linux/Mac:
1. Поместите файлы `docker-images.tar.gz` и `docker-compose.yml` в одну директорию.
2. Сделайте скрипт исполняемым:
   ```
   chmod +x deploy-on-server.sh
   ```
3. Запустите скрипт:
   ```
   ./deploy-on-server.sh
   ```

### Windows:
1. Поместите tar-файлы с образами и `docker-compose.yml` в одну директорию.
2. Запустите скрипт `deploy-on-server.bat`.

## Доступность сервисов
После запуска сервисы будут доступны по следующим адресам:
- Adaptation Admin: http://localhost:3004
- Adaptation Server: http://localhost:8080

## Управление контейнерами
- Для просмотра запущенных контейнеров: `docker-compose ps`
- Для остановки всех контейнеров: `docker-compose down`
- Для перезапуска: `docker-compose restart`