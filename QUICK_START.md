# Быстрый старт: Google OAuth для админ-панели

## Проблема

Ошибка: `Missing required parameter client_id`

## Решение

### 1. Создайте Google OAuth Client ID

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект
3. Включите Google+ API
4. Перейдите в "APIs & Services" > "Credentials"
5. Создайте "OAuth 2.0 Client IDs" типа "Web application"

### 2. Настройте OAuth Client

**Authorized JavaScript origins**:

```
http://localhost:3000
http://localhost:5173
```

**Authorized redirect URIs**:

```
http://localhost:3000/auth/google/callback
http://localhost:5173/auth/google/callback
```

### 3. Скопируйте Client ID

После создания скопируйте Client ID (выглядит как `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### 4. Обновите env.local

Откройте `env.local` и замените:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

На:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 5. Перезапустите клиент

```bash
npm run dev
```

## Проверка

1. Откройте админ-панель
2. Нажмите "Войти через Google"
3. Должно открыться окно авторизации Google

## Подробная инструкция

См. `GOOGLE_OAUTH_SETUP_CLIENT.md` для подробной настройки.
