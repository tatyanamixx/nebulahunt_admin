/**
 * Утилиты для работы с переменными окружения
 */

// Отладочная информация о загрузке переменных окружения
console.log('🔍 Debug: import.meta.env loaded:', {
	VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
	VITE_API_URL: import.meta.env.VITE_API_URL,
	VITE_ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API,
	VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
	VITE_ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA,
	VITE_ENABLE_TELEGRAM_AUTH: import.meta.env.VITE_ENABLE_TELEGRAM_AUTH,
	DEV: import.meta.env.DEV,
	MODE: import.meta.env.MODE,
	BASE_URL: import.meta.env.BASE_URL,
});

// Основные переменные окружения
export const env = {
	// Режим разработки
	DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,

	// API настройки
	API_URL: import.meta.env.VITE_API_URL || '/api',

	// Мок API
	ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === 'true',

	// Email настройки
	SMTP_HOST: import.meta.env.VITE_SMTP_HOST,
	SMTP_PORT: import.meta.env.VITE_SMTP_PORT,
	SMTP_USER: import.meta.env.VITE_SMTP_USER,
	SMTP_PASS: import.meta.env.VITE_SMTP_PASS,

	// App настройки
	APP_NAME: import.meta.env.VITE_APP_NAME || 'Nebulahunt Admin',
	APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',

	// Функциональность
	ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA !== 'false', // по умолчанию включено
	ENABLE_EMAIL_INVITES: import.meta.env.VITE_ENABLE_EMAIL_INVITES !== 'false', // по умолчанию включено
	ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH !== 'false', // по умолчанию включено
};

console.log('🔍 Debug: env object created:', env);

/**
 * Проверяет, находимся ли мы в режиме разработки
 */
export const isDevelopment = () => env.DEV_MODE;
console.log('🔍 Debug: isDevelopment:', isDevelopment());

/**
 * Проверяет, включен ли мок API
 */
export const isMockApiEnabled = () => env.DEV_MODE && env.ENABLE_MOCK_API;

/**
 * Проверяет, доступна ли поддержка email
 */
export const isEmailSupported = () => {
	return env.ENABLE_EMAIL_INVITES && env.SMTP_HOST && env.SMTP_USER;
};

/**
 * Проверяет, можно ли использовать приложение в текущем окружении
 */
export const canUseApp = () => {
	// В режиме разработки всегда можно использовать
	if (isDevelopment()) {
		return true;
	}

	// В продакшене проверяем поддержку email
	return isEmailSupported();
};

/**
 * Получает информацию о текущем окружении для отладки
 */
export const getEnvironmentInfo = () => {
	return {
		devMode: env.DEV_MODE,
		mockApi: env.ENABLE_MOCK_API,
		emailSupported: isEmailSupported(),
		canUseApp: canUseApp(),
		apiUrl: env.API_URL,
		enable2FA: env.ENABLE_2FA,
		enableEmailInvites: env.ENABLE_EMAIL_INVITES,
		enableGoogleAuth: env.ENABLE_GOOGLE_AUTH,
	};
};

/**
 * Выводит информацию об окружении в консоль (только в режиме разработки)
 */
export const logEnvironmentInfo = () => {
	if (isDevelopment()) {
		console.log('🌍 Environment Info:', getEnvironmentInfo());
	}
};
