import axios from 'axios';
import { isDevelopment, isMockApiEnabled } from './env';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || '/api',
	timeout: 10000,
});

// Мок для режима разработки
const enableMockApi = isMockApiEnabled();

if (isDevelopment() && enableMockApi) {
	// Перехватываем запросы в режиме разработки
	api.interceptors.request.use(async (config) => {
		// Мокаем ответы для тестирования
		if (config.url === '/admin/login' && config.method === 'post') {
			// Симулируем успешный логин
			return Promise.reject({
				response: {
					data: {
						message: 'Telegram аутентификация успешна',
						accessToken: 'mock_access_token',
						refreshToken: 'mock_refresh_token',
						id: 123456789,
						username: 'test_admin',
						role: 'ADMIN',
					},
				},
			});
		}

		if (config.url === '/admin/2fa/verify' && config.method === 'post') {
			// Симулируем успешную 2FA верификацию
			return Promise.reject({
				response: {
					data: {
						message: '2FA verification successful',
						accessToken: 'mock_access_token_2fa',
						refreshToken: 'mock_refresh_token_2fa',
						id: 123456789,
						username: 'test_admin',
						role: 'ADMIN',
					},
				},
			});
		}

		if (config.url === '/admin/settings' && config.method === 'get') {
			// Возвращаем тестовые настройки
			return Promise.reject({
				response: {
					data: {
						DAILY_BONUS_STARDUST: 50,
						DAILY_BONUS_DARK_MATTER: 5,
						GALAXY_BASE_PRICE: 100,
						ARTIFACT_DROP_RATE: 0.1,
						LEADERBOARD_LIMIT: 100,
					},
				},
			});
		}

		if (config.url === '/admin/settings' && config.method === 'put') {
			// Симулируем успешное сохранение настроек
			return Promise.reject({
				response: {
					data: {
						message: 'Settings updated successfully',
						settings: config.data,
					},
				},
			});
		}

		return config;
	});
}

// Request interceptor для добавления токена
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor для обработки ошибок
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// В режиме разработки обрабатываем мок-ответы
		if (isDevelopment() && enableMockApi && error.response?.data) {
			// Если это мок-ответ, обрабатываем его как успешный
			if (error.response.data.message || error.response.data.settings) {
				return Promise.resolve(error.response);
			}
		}

		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const refreshToken = localStorage.getItem('refreshToken');
			if (refreshToken) {
				try {
					const response = await axios.post('/api/auth/refresh', {
						refreshToken,
					});

					const { accessToken } = response.data;
					localStorage.setItem('accessToken', accessToken);

					originalRequest.headers.Authorization = `Bearer ${accessToken}`;
					return api(originalRequest);
				} catch (refreshError) {
					localStorage.removeItem('accessToken');
					localStorage.removeItem('refreshToken');
					window.location.href = '/login';
					return Promise.reject(refreshError);
				}
			}
		}

		return Promise.reject(error);
	}
);

export { api };
