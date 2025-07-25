# 🔗 Настройка для работы с сервером

## 📋 Текущая конфигурация

Ваш сервер запущен на порту **5000**, клиент настроен для подключения к нему.

### API Endpoints

-   **Базовый URL:** `http://localhost:5000/api`
-   **Прокси:** Настроен в `vite.config.ts` для `/api` → `http://localhost:5000`

## 🔧 Настройки

### 1. Переменные окружения

Создайте файл `.env` на основе `env.example`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Development Settings
VITE_DEV_MODE=false
VITE_ENABLE_MOCK_API=false

# Email Configuration
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password

# App Configuration
VITE_APP_NAME=Nebulahunt Admin Panel
VITE_APP_VERSION=1.0.0
VITE_APP_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_EMAIL_INVITES=true
VITE_ENABLE_GOOGLE_AUTH=true
```

### 2. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## 🔐 Требуемые API эндпоинты

### Аутентификация

```
POST /api/admin/login
POST /api/admin/2fa/verify
POST /api/admin/register
POST /api/admin/2fa/complete
```

### Приглашения

```
POST /api/admin/invite
GET /api/admin/invite/validate?token=string
GET /api/admin/invites
```

### Управление пользователями

```
GET /api/admin/users
POST /api/admin/users/{id}/block
POST /api/admin/users/{id}/unblock
```

### Статистика

```
GET /api/admin/stats
```

## 🧪 Тестирование подключения

### 1. Проверка сервера

```bash
curl http://localhost:5000/api/health
```

### 2. Проверка API

Откройте DevTools → Network tab и проверьте:

-   Запросы к `/api/*` эндпоинтам
-   Статус ответов (200, 401, 500, etc.)
-   Данные в ответах

### 3. Логи в консоли

В браузере проверьте консоль на наличие:

-   Ошибок сети
-   Ошибок API
-   Успешных запросов

## ⚠️ Возможные проблемы

### 1. CORS ошибки

Если сервер не настроен для CORS, добавьте в сервер:

```javascript
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);
```

### 2. Ошибки сети

-   Проверьте, что сервер запущен на порту 5000
-   Проверьте, что API эндпоинты доступны
-   Проверьте логи сервера

### 3. Ошибки аутентификации

-   Проверьте формат JWT токенов
-   Проверьте middleware аутентификации
-   Проверьте refresh token логику

## 🔄 Переключение между режимами

### Для разработки без сервера:

```env
VITE_DEV_MODE=true
VITE_ENABLE_MOCK_API=true
```

### Для работы с сервером:

```env
VITE_DEV_MODE=false
VITE_ENABLE_MOCK_API=false
```

## 📞 Отладка

### Логи сервера

Проверьте логи вашего сервера на порту 5000

### Логи клиента

-   **Console:** JavaScript ошибки
-   **Network:** API запросы и ответы
-   **Application:** Токены в localStorage

### Тестовые запросы

```bash
# Проверка статистики
curl http://localhost:5000/api/admin/stats

# Проверка пользователей
curl http://localhost:5000/api/admin/users

# Проверка приглашений
curl http://localhost:5000/api/admin/invites
```
