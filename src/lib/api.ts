import axios from 'axios';
import { isDevelopment, isMockApiEnabled } from './env';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || '/api',
	timeout: 10000,
});

// Мок для режима разработки (отключен для подключения к реальному серверу)
const enableMockApi = false; // isMockApiEnabled();

if (false) {
	// isDevelopment() && enableMockApi) {
	// Перехватываем запросы в режиме разработки
	api.interceptors.request.use(async (config) => {
		// Мокаем ответы для тестирования
		if (config.url === '/admin/login' && config.method === 'post') {
			// Симулируем успешный админ логин
			return Promise.reject({
				response: {
					data: {
						message: 'Admin login successful',
						email: config.data?.email || 'admin@test.com',
						id: 123456789,
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
						email: config.data?.email || 'admin@test.com',
						role: 'ADMIN',
					},
				},
			});
		}

		if (config.url === '/admin/invite' && config.method === 'post') {
			// Симулируем успешную отправку приглашения
			return Promise.reject({
				response: {
					data: {
						message: 'Invitation sent successfully',
						email: config.data?.email || 'admin@test.com',
					},
				},
			});
		}

		if (
			config.url === '/admin/invite/validate' &&
			config.method === 'get'
		) {
			// Симулируем валидацию токена приглашения
			return Promise.reject({
				response: {
					data: {
						email: 'admin@test.com',
						name: 'Test Admin',
						role: 'ADMIN',
					},
				},
			});
		}

		if (config.url === '/admin/register' && config.method === 'post') {
			// Симулируем успешную регистрацию администратора
			return Promise.reject({
				response: {
					data: {
						message: 'Admin registered successfully',
						google2faSecret: 'JBSWY3DPEHPK3PXP',
						otpAuthUrl:
							'otpauth://totp/Nebulahunt%20Admin%20(admin@test.com)?secret=JBSWY3DPEHPK3PXP&issuer=Nebulahunt',
					},
				},
			});
		}

		if (config.url === '/admin/2fa/complete' && config.method === 'post') {
			// Симулируем успешное завершение 2FA
			return Promise.reject({
				response: {
					data: {
						message: '2FA setup completed successfully',
					},
				},
			});
		}

		if (config.url === '/admin/stats' && config.method === 'get') {
			// Симулируем статистику дашборда
			return Promise.reject({
				response: {
					data: {
						totalUsers: 1250,
						activeUsers: 847,
						totalStardust: 15420,
						totalDarkMatter: 1250,
						totalGalaxies: 89,
						totalArtifacts: 234,
					},
				},
			});
		}

		if (config.url === '/admin/users' && config.method === 'get') {
			// Симулируем список пользователей
			return Promise.reject({
				response: {
					data: [
						{
							id: 1,
							username: 'user1',
							role: 'USER',
							blocked: false,
							referral: 'ref123',
							createdAt: new Date(
								Date.now() - 30 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: 2,
							username: 'user2',
							role: 'USER',
							blocked: true,
							referral: 'ref456',
							createdAt: new Date(
								Date.now() - 15 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: 3,
							username: 'admin_user',
							role: 'ADMIN',
							blocked: false,
							createdAt: new Date(
								Date.now() - 60 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: 4,
							username: 'premium_user',
							role: 'PREMIUM',
							blocked: false,
							referral: 'ref789',
							createdAt: new Date(
								Date.now() - 7 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
					],
				},
			});
		}

		if (
			config.url &&
			config.url.includes('/admin/users/') &&
			config.url.includes('/block') &&
			config.method === 'post'
		) {
			// Симулируем блокировку пользователя
			return Promise.reject({
				response: {
					data: {
						message: 'User blocked successfully',
					},
				},
			});
		}

		if (
			config.url &&
			config.url.includes('/admin/users/') &&
			config.url.includes('/unblock') &&
			config.method === 'post'
		) {
			// Симулируем разблокировку пользователя
			return Promise.reject({
				response: {
					data: {
						message: 'User unblocked successfully',
					},
				},
			});
		}

		if (config.url === '/admin/invites' && config.method === 'get') {
			// Симулируем список приглашений
			return Promise.reject({
				response: {
					data: [
						{
							id: '1',
							email: 'admin1@test.com',
							name: 'Иван Иванов',
							role: 'ADMIN',
							status: 'PENDING',
							createdAt: new Date().toISOString(),
							expiresAt: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: '2',
							email: 'supervisor@test.com',
							name: 'Петр Петров',
							role: 'SUPERVISOR',
							status: 'ACCEPTED',
							createdAt: new Date(
								Date.now() - 2 * 24 * 60 * 60 * 1000
							).toISOString(),
							expiresAt: new Date(
								Date.now() + 5 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: '3',
							email: 'admin2@test.com',
							name: 'Анна Сидорова',
							role: 'ADMIN',
							status: 'EXPIRED',
							createdAt: new Date(
								Date.now() - 10 * 24 * 60 * 60 * 1000
							).toISOString(),
							expiresAt: new Date(
								Date.now() - 3 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
					],
				},
			});
		}

		if (config.url === '/admin/init' && config.method === 'post') {
			// Симулируем успешную инициализацию администратора
			return Promise.reject({
				response: {
					data: {
						message: 'Admin initialized',
						email: config.data?.email || 'admin@test.com',
						id: 123456789,
						google2faSecret: 'JBSWY3DPEHPK3PXP',
						otpAuthUrl:
							'otpauth://totp/Nebulahunt%20Admin%20(admin@test.com)?secret=JBSWY3DPEHPK3PXP&issuer=Nebulahunt',
					},
				},
			});
		}

		if (
			config.url === '/admin/supervisor/init' &&
			config.method === 'post'
		) {
			// Симулируем успешную инициализацию супервайзера
			return Promise.reject({
				response: {
					data: {
						message: 'Supervisor initialized',
						email: 'supervisor@test.com',
						id: 999999999,
						google2faSecret: 'JBSWY3DPEHPK3PXP',
						otpAuthUrl:
							'otpauth://totp/Nebulahunt%20Supervisor%20(supervisor@test.com)?secret=JBSWY3DPEHPK3PXP&issuer=Nebulahunt',
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
