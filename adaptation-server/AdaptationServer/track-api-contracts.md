# Треки API Контракты

## GET: api/Tracks/available

Получение списка доступных треков, назначенных текущему пользователю.

### Авторизация
- Требуется авторизация пользователя

### Ответ (200 OK)
```json
[
  {
    "id": "guid",
    "title": "string",
    "description": "string",
    "status": "string",
    "assignedDate": "date-time",
    "startDate": "date-time",
    "completedDate": "date-time",
    "mentorId": "guid",
    "mentorName": "string"
  }
]
```

### Ошибки
- 400 Bad Request: Пользователь не имеет текущей компании

## GET: api/Tracks/current

Получение детальной информации о текущем треке пользователя.

### Авторизация
- Требуется авторизация пользователя

### Ответ (200 OK)
```json
{
  "id": "guid",
  "title": "string",
  "description": "string",
  "status": "string",
  "assignedDate": "date-time",
  "startDate": "date-time",
  "completedDate": "date-time",
  "mentorId": "guid",
  "mentorName": "string",
  "steps": {
    "key1": "json-string",
    "key2": "json-string"
  }
}
```

### Ошибки
- 400 Bad Request: Пользователь не имеет текущей компании
- 404 Not Found: Пользователь не найден
- 404 Not Found: Текущий трек не выбран
- 404 Not Found: Трек не найден или не назначен пользователю

## POST: api/Tracks/current

Изменение текущего трека пользователя. Если трек ещё не был начат, устанавливает дату начала и статус "in_progress".

### Авторизация
- Требуется авторизация пользователя

### Запрос
```json
{
  "trackId": "guid"
}
```

### Ответ (200 OK)
Возвращает детальную информацию о выбранном треке (такую же, как GET: api/Tracks/current)

### Ошибки
- 400 Bad Request: Пользователь не имеет текущей компании
- 404 Not Found: Пользователь не найден
- 404 Not Found: Трек не найден или не назначен пользователю

## POST: api/Tracks/progress/{stageId}

Обновление прогресса по определенному этапу текущего трека.

### Авторизация
- Требуется авторизация пользователя

### Параметры пути
- stageId: Идентификатор этапа

### Запрос
```json
{
  "content": {}  // JsonDocument с данными о прогрессе
}
```

### Ответ (200 OK)
Пустой ответ с кодом 200

### Ошибки
- 400 Bad Request: Пользователь не имеет текущей компании
- 404 Not Found: Пользователь не найден
- 404 Not Found: Трек не найден или не назначен пользователю
- 404 Not Found: Этап не найден в текущем треке 