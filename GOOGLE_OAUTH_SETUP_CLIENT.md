# Настройка Google OAuth для клиента (Frontend)

## Быстрая настройка для разработки

### 1. Создание Google OAuth Client ID

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API и Google OAuth2 API
4. Перейдите в "APIs & Services" > "Credentials"
5. Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
6. Выберите тип "Web application"

### 2. Настройка OAuth Client

Заполните форму:

**Name**: `Nebulahunt Admin Panel Dev`

**Authorized JavaScript origins**:

```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

**Authorized redirect URIs**:

```
http://localhost:3000/auth/google/callback
http://localhost:5173/auth/google/callback
http://127.0.0.1:3000/auth/google/callback
http://127.0.0.1:5173/auth/google/callback
```

### 3. Получение Client ID

После создания вы получите:

-   **Client ID** (например: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
-   **Client Secret** (не нужен для frontend)

### 4. Настройка переменных окружения

Откройте файл `env.local` и замените placeholder:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 5. Перезапуск клиента

```bash
npm run dev
```

## Проверка настройки

1. Откройте админ-панель
2. Нажмите "Войти через Google"
3. Должно открыться окно авторизации Google
4. После авторизации появится форма для ввода 2FA кода

## Устранение неполадок

### Ошибка "Google OAuth Client ID not configured"

-   Проверьте, что `VITE_GOOGLE_CLIENT_ID` установлен в `env.local`
-   Убедитесь, что значение не равно `your_google_client_id_here`

### Ошибка "Google OAuth not available"

-   Проверьте, что Google OAuth скрипт загружен в `index.html`
-   Убедитесь, что интернет-соединение работает

### Ошибка "redirect_uri_mismatch"

-   Проверьте, что `http://localhost:3000` добавлен в "Authorized JavaScript origins"
-   Убедитесь, что порт совпадает с вашим dev сервером

## Для продакшена

В продакшене замените `localhost` на ваш домен:

**Authorized JavaScript origins**:

```
https://your-domain.com
```

**Authorized redirect URIs**:

```
https://your-domain.com/auth/google/callback
```

## Безопасность

-   Никогда не коммитьте реальный Client ID в репозиторий
-   Используйте разные Client ID для разработки и продакшена
-   Client Secret не нужен для frontend (используется только на backend)
