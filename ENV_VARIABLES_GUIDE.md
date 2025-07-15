# Руководство по переменным окружения - Frontend

## 🎯 Переменные окружения во фронтенде

Фронтенд использует переменные окружения с префиксом `VITE_` для настройки различных аспектов приложения.

## 📋 Доступные переменные

### Основные настройки

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Development Settings
VITE_DEV_MODE=true
VITE_ENABLE_MOCK_API=true

# Telegram Bot Configuration
VITE_BOT_TOKEN=your_bot_token_here
VITE_APP_NAME=Nebulahunt Admin Panel

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_TELEGRAM_AUTH=true
```

## 🔧 Как использовать переменные

### 1. В коде TypeScript/JavaScript

```typescript
// Прямое использование
const apiUrl = import.meta.env.VITE_API_URL;
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

// Через утилиту env.ts (рекомендуется)
import { env, isDevelopment, isMockApiEnabled } from '../lib/env';

const apiUrl = env.API_URL;
const isDev = isDevelopment();
const mockEnabled = isMockApiEnabled();
```

### 2. Утилита env.ts

Создана утилита `src/lib/env.ts` для удобной работы с переменными:

```typescript
import {
	env,
	isDevelopment,
	isMockApiEnabled,
	isTelegramWebApp,
	canUseApp,
	getEnvironmentInfo,
	logEnvironmentInfo,
} from '../lib/env';

// Основные переменные
console.log(env.API_URL);
console.log(env.DEV_MODE);

// Функции проверки
if (isDevelopment()) {
	console.log('Режим разработки');
}

if (isMockApiEnabled()) {
	console.log('Мок API включен');
}

if (isTelegramWebApp()) {
	console.log('Telegram WebApp доступен');
}

// Проверка возможности использования приложения
if (canUseApp()) {
	console.log('Приложение можно использовать');
}

// Информация об окружении
console.log(getEnvironmentInfo());

// Логирование в консоль (только в dev режиме)
logEnvironmentInfo();
```

## 🚀 VITE_DEV_MODE - Как это работает

### Что делает VITE_DEV_MODE

Переменная `VITE_DEV_MODE` контролирует режим разработки и включает:

1. **Тестовый вход** - возможность входа без Telegram WebApp
2. **Мок API** - использование тестовых данных вместо реального API
3. **Отладочную информацию** - дополнительное логирование
4. **Упрощенную аутентификацию** - пропуск некоторых проверок

### Логика работы

```typescript
// В src/lib/env.ts
export const env = {
	DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
	// ...
};

// В src/pages/Login.tsx
if (isDevelopment()) {
	// Показываем тестового пользователя
	setUser({
		id: 123456789,
		username: 'test_admin',
		first_name: 'Test',
	});
}

// В src/lib/api.ts
if (isDevelopment() && enableMockApi) {
	// Используем мок API
}
```

### Примеры использования

#### Включение режима разработки

```env
# .env
VITE_DEV_MODE=true
VITE_ENABLE_MOCK_API=true
```

#### Отключение режима разработки

```env
# .env
VITE_DEV_MODE=false
VITE_ENABLE_MOCK_API=false
```

## 🔍 Отладка переменных окружения

### 1. Проверка загруженных переменных

```typescript
// В консоли браузера
console.log('Environment Info:', {
	VITE_API_URL: import.meta.env.VITE_API_URL,
	VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
	VITE_ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API,
	DEV: import.meta.env.DEV,
	MODE: import.meta.env.MODE,
});
```

### 2. Использование утилиты

```typescript
import { getEnvironmentInfo, logEnvironmentInfo } from '../lib/env';

// Получить полную информацию
const envInfo = getEnvironmentInfo();
console.log(envInfo);

// Автоматическое логирование в dev режиме
logEnvironmentInfo();
```

### 3. Проверка в компонентах

```typescript
import { isDevelopment, isTelegramWebApp } from '../lib/env';

function MyComponent() {
	useEffect(() => {
		if (isDevelopment()) {
			console.log('Компонент загружен в режиме разработки');
		}

		if (isTelegramWebApp()) {
			console.log('Telegram WebApp доступен');
		}
	}, []);

	return <div>...</div>;
}
```

## ⚠️ Важные моменты

### 1. Префикс VITE\_

-   Все переменные окружения должны начинаться с `VITE_`
-   Без этого префикса переменные не будут доступны в браузере

### 2. Типизация

-   Переменные типизированы в `src/vite-env.d.ts`
-   Добавляйте новые переменные в этот файл

### 3. Безопасность

-   Переменные окружения видны в браузере
-   Не храните секреты в переменных с префиксом `VITE_`
-   Используйте серверные переменные для секретов

### 4. Перезагрузка

-   Изменения в .env файлах требуют перезапуска dev сервера
-   Используйте `npm run dev` для применения изменений

## 📚 Примеры конфигураций

### Разработка

```env
VITE_API_URL=http://localhost:3001/api
VITE_DEV_MODE=true
VITE_ENABLE_MOCK_API=true
VITE_ENABLE_2FA=true
VITE_ENABLE_TELEGRAM_AUTH=true
```

### Продакшен

```env
VITE_API_URL=https://api.nebulahunt.com/api
VITE_DEV_MODE=false
VITE_ENABLE_MOCK_API=false
VITE_ENABLE_2FA=true
VITE_ENABLE_TELEGRAM_AUTH=true
```

### Тестирование

```env
VITE_API_URL=http://localhost:3001/api
VITE_DEV_MODE=true
VITE_ENABLE_MOCK_API=true
VITE_ENABLE_2FA=false
VITE_ENABLE_TELEGRAM_AUTH=false
```

## 🔧 Команды для работы

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предварительный просмотр сборки
npm run preview
```
