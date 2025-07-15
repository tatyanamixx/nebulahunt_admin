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

	// Telegram настройки
	BOT_TOKEN: import.meta.env.VITE_BOT_TOKEN,
	APP_NAME: import.meta.env.VITE_APP_NAME || 'Nebulahunt Admin',

	// Функциональность
	ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA !== 'false', // по умолчанию включено
	ENABLE_TELEGRAM_AUTH: import.meta.env.VITE_ENABLE_TELEGRAM_AUTH !== 'false', // по умолчанию включено
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
 * Проверяет, доступен ли Telegram WebApp
 */
export const isTelegramWebApp = () => {
	return typeof window !== 'undefined' && !window.Telegram?.WebApp;
};

/**
 * Проверяет, можно ли использовать приложение в текущем окружении
 */
export const canUseApp = () => {
	// В режиме разработки всегда можно использовать
	if (isDevelopment()) {
		return true;
	}

	// В продакшене только через Telegram WebApp
	return isTelegramWebApp();
};

/**
 * Получает информацию о текущем окружении для отладки
 */
export const getEnvironmentInfo = () => {
	return {
		devMode: env.DEV_MODE,
		mockApi: env.ENABLE_MOCK_API,
		telegramWebApp: isTelegramWebApp(),
		canUseApp: canUseApp(),
		apiUrl: env.API_URL,
		enable2FA: env.ENABLE_2FA,
		enableTelegramAuth: env.ENABLE_TELEGRAM_AUTH,
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
