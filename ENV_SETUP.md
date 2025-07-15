# Настройка переменных окружения

## Создание файла .env.local

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Development Settings
VITE_DEV_MODE=true
VITE_ENABLE_MOCK_API=true

# App Configuration
VITE_APP_NAME=Nebulahunt Admin Panel
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_TELEGRAM_AUTH=true
```

## Переменные окружения

### Обязательные переменные:

-   `VITE_API_URL` - URL вашего API сервера
-   `VITE_DEV_MODE` - режим разработки (true/false)
-   `VITE_ENABLE_MOCK_API` - включить мок API для тестирования

### Опциональные переменные:

-   `VITE_APP_NAME` - название приложения
-   `VITE_APP_VERSION` - версия приложения
-   `VITE_ENABLE_2FA` - включить двухфакторную аутентификацию
-   `VITE_ENABLE_TELEGRAM_AUTH` - включить аутентификацию через Telegram

## Для продакшена

Создайте файл `.env.production`:

```env
# API Configuration
VITE_API_URL=https://your-api-domain.com/api

# Production Settings
VITE_DEV_MODE=false
VITE_ENABLE_MOCK_API=false

# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN=your_actual_bot_token
VITE_TELEGRAM_BOT_USERNAME=your_bot_username

# App Configuration
VITE_APP_NAME=Nebulahunt Admin Panel
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_TELEGRAM_AUTH=true
```

## Использование в коде

```typescript
// Получение переменной окружения
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.VITE_DEV_MODE === 'true';
const enableMock = import.meta.env.VITE_ENABLE_MOCK_API === 'true';
```

## Безопасность

⚠️ **Важно**:

-   Никогда не коммитьте `.env.local` в git
-   Добавьте `.env.local` в `.gitignore`
-   Используйте разные переменные для разработки и продакшена
