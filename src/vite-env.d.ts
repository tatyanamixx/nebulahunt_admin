/// <reference types="vite/client" />

interface ImportMetaEnv {
	// API Configuration
	readonly VITE_API_URL: string;

	// Development Settings
	readonly VITE_DEV_MODE: string;
	readonly VITE_ENABLE_MOCK_API: string;

	// Telegram Bot Configuration
	readonly VITE_TELEGRAM_BOT_TOKEN?: string;
	readonly VITE_TELEGRAM_BOT_USERNAME?: string;

	// App Configuration
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_VERSION: string;

	// Feature Flags
	readonly VITE_ENABLE_2FA: string;
	readonly VITE_ENABLE_TELEGRAM_AUTH: string;

	// Vite built-in
	readonly DEV: boolean;
	readonly PROD: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
