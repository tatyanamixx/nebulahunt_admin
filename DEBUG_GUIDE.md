# Руководство по Отладке Админки

## Отладочные Инструменты

### 1. Debug Panel (Отладочная Панель)

Отладочная панель автоматически появляется в правом нижнем углу в режиме разработки.

#### Функции:

-   **Environment**: информация о переменных окружения
-   **Authentication**: статус аутентификации и токенов
-   **Google OAuth**: статус загрузки Google OAuth
-   **Network**: статус подключения к API

#### Кнопки:

-   **Clear Storage**: очистить localStorage и перезагрузить страницу
-   **Reload**: перезагрузить страницу
-   **Log to Console**: вывести отладочную информацию в консоль

### 2. Отладочная информация на странице входа

На странице `/admin/login` в режиме разработки отображается:

-   Client ID (первые 20 символов)
-   Статус загрузки Google OAuth скрипта
-   Доступность Google OAuth API

### 3. Консоль браузера

Автоматически выводится информация о переменных окружения при загрузке приложения.

## Диагностика Проблем

### Проблема: "The OAuth client was not found"

#### Проверьте:

1. **Client ID в .env.local**:

    ```env
    VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
    ```

2. **В Debug Panel**:

    - Google Client ID не должен быть "not_set"
    - Script Loaded должен быть "Yes"
    - OAuth Available должен быть "Yes"

3. **В консоли браузера**:
    ```javascript
    console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    ```

### Проблема: "401: invalid_client"

#### Проверьте:

1. **Тип OAuth клиента** в Google Cloud Console:

    - Application type: Web application

2. **Authorized JavaScript origins**:

    ```
    http://localhost:5173
    http://localhost:3000
    ```

3. **Authorized redirect URIs**:
    ```
    http://localhost:5173/
    http://localhost:5173/admin/login
    ```

### Проблема: Google OAuth не загружается

#### Проверьте:

1. **В Debug Panel**:

    - Script Loaded: No → проблема с загрузкой скрипта
    - OAuth Available: No → проблема с инициализацией

2. **В консоли браузера**:

    - Ошибки загрузки скрипта
    - CORS ошибки

3. **В Network tab**:
    - Запросы к `accounts.google.com`
    - Статус ответов

### Проблема: API недоступен

#### Проверьте:

1. **В Debug Panel**:

    - API Status: offline/error

2. **В консоли браузера**:

    - Ошибки сетевых запросов
    - CORS ошибки

3. **Переменные окружения**:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

## Команды для Отладки

### В консоли браузера:

```javascript
// Проверить переменные окружения
console.log('All env:', import.meta.env);

// Проверить токены
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Проверить Google OAuth
console.log('Google OAuth:', window.google?.accounts?.oauth2);

// Проверить пользователя
console.log('User:', window.__DEBUG_ENV__?.user);

// Очистить все данные
localStorage.clear();
sessionStorage.clear();
```

### В терминале:

```bash
# Проверить переменные окружения
cat .env.local

# Перезапустить сервер разработки
npm run dev

# Проверить порты
netstat -an | grep :5173
netstat -an | grep :3000
```

## Частые Проблемы и Решения

### 1. Client ID не загружается

**Симптомы**: В Debug Panel показывается "not_set"

**Решение**:

1. Проверьте файл `.env.local` в корне проекта
2. Убедитесь, что переменная начинается с `VITE_`
3. Перезапустите сервер разработки

### 2. Google OAuth скрипт не загружается

**Симптомы**: Script Loaded: No

**Решение**:

1. Проверьте интернет-соединение
2. Проверьте блокировщики рекламы
3. Проверьте настройки безопасности браузера

### 3. API недоступен

**Симптомы**: API Status: offline/error

**Решение**:

1. Убедитесь, что сервер запущен
2. Проверьте URL в `VITE_API_URL`
3. Проверьте CORS настройки сервера

### 4. Токены не сохраняются

**Симптомы**: Access Token: Missing

**Решение**:

1. Проверьте localStorage в DevTools
2. Проверьте настройки приватности браузера
3. Попробуйте режим инкогнито

## Полезные Ссылки

-   [Google Cloud Console](https://console.cloud.google.com/)
-   [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
-   [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
-   [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

## Контакты для Поддержки

Если проблема не решается с помощью этого руководства:

1. Проверьте логи в консоли браузера
2. Сделайте скриншот Debug Panel
3. Опишите шаги для воспроизведения проблемы
