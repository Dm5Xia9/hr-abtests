# TrackOn Landing Page

React-based landing page for TrackOn - a system for employee adaptation and onboarding.

## Особенности

- Современный React-интерфейс
- Адаптивный дизайн для всех устройств
- Модальные окна для авторизации и запроса демо
- Возможность выбора между Cloud и Self-Hosted решениями

## Структура проекта

Проект организован в следующую структуру:

```
src/
  ├── components/       # React компоненты
  │   ├── Auth/         # Компоненты авторизации и форм
  │   ├── Header.js     # Шапка сайта
  │   ├── Hero.js       # Главный блок
  │   ├── Features.js   # Блок с функциями
  │   ├── DeploymentOptions.js # Варианты развертывания
  │   └── ...
  ├── utils/            # Утилиты
  │   └── scrollUtils.js # Утилита для плавной прокрутки
  ├── App.js            # Главный компонент приложения
  ├── index.js          # Точка входа приложения
  └── index.css         # Глобальные стили
```

## Запуск в режиме разработки

### Через npm

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

### Через Docker Compose

```bash
# Сборка и запуск контейнера
docker-compose up --build
```

## Сборка для продакшн

### Через npm

```bash
# Сборка проекта
npm run build

# Содержимое папки build можно разместить на любом статическом хостинге
```

### Через Docker

```bash
# Сборка Docker образа
docker build -t trackon-landing .

# Запуск контейнера
docker run -p 80:80 trackon-landing
```

## Развертывание

Проект может быть развернут на любом статическом хостинге или через Docker на сервере.

Для развертывания через Docker:

1. Соберите образ: `docker build -t trackon-landing .`
2. Запустите контейнер: `docker run -d -p 80:80 --name trackon-landing trackon-landing`

## Примечания по разработке

Проект был конвертирован из статического HTML-сайта в React-приложение. 
URL демо-iframe установлен на "http://127.0.0.1:5173/" и должен быть обновлен на реальный URL в продакшн. 