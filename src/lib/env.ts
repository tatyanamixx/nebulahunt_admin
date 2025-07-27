/**
 * Utilities for working with environment variables
 */

// Debug information about environment variables loading
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

// Main environment variables
export const env = {
	// Development mode
	DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,

	// API settings
	API_URL: import.meta.env.VITE_API_URL || '/api',

	// Mock API
	ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === 'true',

	// Email settings
	SMTP_HOST: import.meta.env.VITE_SMTP_HOST,
	SMTP_PORT: import.meta.env.VITE_SMTP_PORT,
	SMTP_USER: import.meta.env.VITE_SMTP_USER,
	SMTP_PASS: import.meta.env.VITE_SMTP_PASS,

	// App settings
	APP_NAME: import.meta.env.VITE_APP_NAME || 'Nebulahunt Admin',
	APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',

	// Functionality
	ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA !== 'false', // enabled by default
	ENABLE_EMAIL_INVITES: import.meta.env.VITE_ENABLE_EMAIL_INVITES !== 'false', // enabled by default
	ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH !== 'false', // enabled by default
};

console.log('🔍 Debug: env object created:', env);

/**
 * Checks if we are in development mode
 */
export const isDevelopment = () => env.DEV_MODE;
console.log('🔍 Debug: isDevelopment:', isDevelopment());

/**
 * Checks if mock API is enabled
 */
export const isMockApiEnabled = () => env.DEV_MODE && env.ENABLE_MOCK_API;

/**
 * Checks if email support is available
 */
export const isEmailSupported = () => {
	return env.ENABLE_EMAIL_INVITES && env.SMTP_HOST && env.SMTP_USER;
};

/**
 * Checks if the application can be used in the current environment
 */
export const canUseApp = () => {
	// In development mode, always can use
	if (isDevelopment()) {
		return true;
	}

	// In production, check email support
	return isEmailSupported();
};

/**
 * Gets information about the current environment for debugging
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
 * Outputs environment information to console (development mode only)
 */
export const logEnvironmentInfo = () => {
	if (isDevelopment()) {
		console.log('🌍 Environment Info:', getEnvironmentInfo());
	}
};
