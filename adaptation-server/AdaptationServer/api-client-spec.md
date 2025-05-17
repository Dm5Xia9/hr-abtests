# API-клиент для UsersController

## Базовые сведения
- **Базовый URL**: `/api/users`
- **Требуемая авторизация**: Все запросы требуют токен аутентификации
- **Формат данных**: JSON

## Модели данных

### EmployeeDTO
```typescript
interface EmployeeDTO {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  positionId?: string;
  hireDate?: string;
  lastLogin?: string;
  role: string;
  currentCompanyId: string;
  createAt: string;
  assignedTracks: EmployeeTrackDTO[];
}
```

### EmployeeTrackDTO
```typescript
interface EmployeeTrackDTO {
  trackId: string;
  mentorId?: string;
  assignedDate: string;
  startDate?: string;
  completedDate?: string;
  status: string;
}
```

## Методы API

### Управление пользователями

#### Получение текущего пользователя
```typescript
getCurrentUser(): Promise<EmployeeDTO>
```
- **Метод**: GET
- **Endpoint**: `/current`
- **Ответ**: Информация о текущем пользователе

#### Получение списка пользователей
```typescript
getUsers(): Promise<EmployeeDTO[]>
```
- **Метод**: GET
- **Endpoint**: `/`
- **Ответ**: Список пользователей в текущей компании

#### Создание пользователя
```typescript
createUser(data: {
  email: string;
  name: string;
  role?: string;
  companyProfileId?: string;
}): Promise<EmployeeDTO>
```
- **Метод**: POST
- **Endpoint**: `/`
- **Тело запроса**: Данные для создания пользователя
- **Ответ**: Созданный пользователь

#### Обновление пользователя
```typescript
updateUser(id: string, data: {
  fullName?: string;
  positionId?: string;
  departmentId?: string;
  phone?: string;
  hireDate?: string;
}): Promise<EmployeeDTO>
```
- **Метод**: PUT
- **Endpoint**: `/{id}`
- **Тело запроса**: Данные для обновления пользователя
- **Ответ**: Обновленный пользователь

#### Удаление пользователя
```typescript
deleteUser(id: string): Promise<void>
```
- **Метод**: DELETE
- **Endpoint**: `/{id}`
- **Ответ**: Статус 204 (No Content)

#### Сброс пароля пользователя
```typescript
resetPassword(id: string): Promise<{message: string, newPassword: string}>
```
- **Метод**: POST
- **Endpoint**: `/{id}/reset-password`
- **Ответ**: Информация о новом пароле

#### Изменение роли пользователя
```typescript
changeRole(id: string, role: string): Promise<void>
```
- **Метод**: PUT
- **Endpoint**: `/{id}/role`
- **Тело запроса**: `{ role: string }`
- **Ответ**: Статус 200 (OK)

### Управление треками сотрудников

#### Назначение трека сотруднику
```typescript
assignTrack(userId: string, data: {
  trackId: string;
  startDate?: string;
  mentorId?: string;
}): Promise<EmployeeDTO>
```
- **Метод**: POST
- **Endpoint**: `/{id}/track`
- **Тело запроса**: Данные о назначаемом треке
- **Ответ**: Обновленная информация о сотруднике

#### Удаление трека у сотрудника
```typescript
removeTrack(userId: string, trackId: string): Promise<EmployeeDTO>
```
- **Метод**: DELETE
- **Endpoint**: `/{id}/track/{trackId}`
- **Ответ**: Обновленная информация о сотруднике

#### Получение треков сотрудника
```typescript
getEmployeeTracks(userId: string): Promise<EmployeeTrackDTO[]>
```
- **Метод**: GET
- **Endpoint**: `/{id}/tracks`
- **Ответ**: Список треков сотрудника

#### Назначение ментора для трека
```typescript
assignMentorToTrack(userId: string, trackId: string, mentorId: string): Promise<EmployeeTrackDTO>
```
- **Метод**: POST
- **Endpoint**: `/{id}/track/{trackId}/mentor`
- **Тело запроса**: `{ mentorId: string }`
- **Ответ**: Обновленная информация о треке

#### Удаление ментора у трека
```typescript
removeMentorFromTrack(userId: string, trackId: string): Promise<EmployeeTrackDTO>
```
- **Метод**: DELETE
- **Endpoint**: `/{id}/track/{trackId}/mentor`
- **Ответ**: Обновленная информация о треке

## Обработка ошибок

Клиент должен обрабатывать следующие коды ошибок:
- `400 Bad Request` - некорректные параметры запроса
- `401 Unauthorized` - ошибка авторизации
- `404 Not Found` - ресурс не найден
- `500 Internal Server Error` - ошибка сервера

## Примеры использования

```typescript
// Пример инициализации клиента
const apiClient = new ApiClient('https://api.example.com', authToken);

// Получение текущего пользователя
const currentUser = await apiClient.users.getCurrentUser();

// Создание нового сотрудника
const newEmployee = await apiClient.users.createUser({
  email: 'employee@example.com',
  fullName: 'John Doe',
  phone: '+1234567890',
  departmentId: 'dept-123',
  positionId: 'pos-456',
  hireDate: '2023-01-01'
});

// Назначение трека сотруднику
const updatedEmployee = await apiClient.users.assignTrack(
  'user-123',
  {
    trackId: 'track-456',
    startDate: '2023-05-01',
    mentorId: 'mentor-789'
  }
);
``` 

# API-клиент для TrackProgressesController

## Базовые сведения
- **Базовый URL**: `/api/trackprogresses`
- **Требуемая авторизация**: Все запросы требуют токен аутентификации
- **Формат данных**: JSON

## Модели данных

### TrackBasicDTO
```typescript
interface TrackBasicDTO {
  id: string;
  title: string;
  description?: string;
  status: string;
  assignedDate?: string;
  startDate?: string;
  completedDate?: string;
  mentorId?: string;
  mentorName?: string;
}
```

### TrackStepDTO
```typescript
interface TrackStepDTO {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: string; // "not_started", "in_progress", "completed"
  completedDate?: string;
  comment?: string;
  checklist?: Record<string, boolean>;
}
```

### TrackDetailedDTO
```typescript
interface TrackDetailedDTO {
  id: string;
  title: string;
  description?: string;
  status: string;
  assignedDate?: string;
  startDate?: string;
  completedDate?: string;
  mentorId?: string;
  mentorName?: string;
  steps: TrackStepDTO[];
}
```

## Методы API

### Получение доступных треков

```typescript
getAvailableTracks(): Promise<TrackBasicDTO[]>
```
- **Метод**: GET
- **Endpoint**: `/available`
- **Ответ**: Список треков адаптации, доступных текущему пользователю

### Получение текущего трека

```typescript
getCurrentTrack(): Promise<TrackDetailedDTO>
```
- **Метод**: GET
- **Endpoint**: `/current`
- **Ответ**: Подробная информация о текущем треке с прогрессом по шагам

### Изменение текущего трека

```typescript
changeCurrentTrack(trackId: string): Promise<TrackDetailedDTO>
```
- **Метод**: POST
- **Endpoint**: `/current`
- **Тело запроса**: `{ trackId: string }`
- **Ответ**: Подробная информация о новом выбранном треке с прогрессом по шагам

### Обновление прогресса по шагу

```typescript
updateStepProgress(data: {
  stepId: string;
  comment?: string;
  status: string;
  checklist?: Record<string, boolean>;
}): Promise<TrackStepDTO>
```
- **Метод**: POST
- **Endpoint**: `/progress`
- **Тело запроса**: Данные о прогрессе по шагу
- **Ответ**: Обновленная информация о шаге

## Обработка ошибок

Клиент должен обрабатывать следующие коды ошибок:
- `400 Bad Request` - некорректные параметры запроса
- `401 Unauthorized` - ошибка авторизации
- `404 Not Found` - ресурс не найден (например, не выбран текущий трек)
- `500 Internal Server Error` - ошибка сервера

## Примеры использования

```typescript
// Получение всех доступных треков
const availableTracks = await apiClient.trackProgresses.getAvailableTracks();

// Выбор текущего трека
const currentTrack = await apiClient.trackProgresses.changeCurrentTrack('track-123');

// Получение информации о текущем треке
const trackDetails = await apiClient.trackProgresses.getCurrentTrack();

// Обновление прогресса по шагу
const updatedStep = await apiClient.trackProgresses.updateStepProgress({
  stepId: 'step-456',
  status: 'completed',
  comment: 'Завершил изучение материалов',
  checklist: {
    'item1': true,
    'item2': true,
    'item3': false
  }
});
``` 