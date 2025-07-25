import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

// Типы для Google OAuth
declare global {
	interface Window {
		google: {
			accounts: {
				oauth2: {
					initTokenClient: (config: any) => any;
				};
			};
		};
	}
}

interface User {
	id: number;
	email?: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	role: string;
	provider: 'google';
	providerId: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	// OAuth методы
	loginWithGoogle: () => Promise<void>;
	// 2FA методы
	verify2FA: (otp: string) => Promise<void>;
	// Общие методы
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Проверяем существующую сессию при загрузке
	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				console.log('Token payload:', payload);
				setUser({
					id: payload.id,
					email: payload.email,
					username: payload.username,
					firstName: payload.firstName,
					lastName: payload.lastName,
					role: payload.role,
					provider: payload.provider,
					providerId: payload.providerId,
				});
			} catch (error) {
				console.error('Token parsing error:', error);
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
			}
		}
		setLoading(false);
	}, []);

	// Google OAuth логин
	const loginWithGoogle = async () => {
		try {
			if (!window.google?.accounts?.oauth2) {
				throw new Error('Google OAuth not available');
			}

			const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
			if (!clientId || clientId === 'your_google_client_id_here') {
				throw new Error(
					'Google OAuth Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env.local file'
				);
			}

			const client = window.google.accounts.oauth2.initTokenClient({
				client_id: clientId,
				scope: 'email profile',
				callback: async (response: any) => {
					if (response.error) {
						throw new Error(
							`Google OAuth error: ${response.error}`
						);
					}

					// Отправляем токен на сервер для верификации
					const serverResponse = await api.post(
						'/admin/oauth/google',
						{
							accessToken: response.access_token,
						}
					);

					console.log(
						'Google OAuth server response:',
						serverResponse.data
					);

					// Если требуется 2FA, сохраняем временные данные
					if (serverResponse.data.requires2FA) {
						localStorage.setItem(
							'tempOAuthData',
							JSON.stringify({
								provider: 'google',
								accessToken: response.access_token,
								userData: serverResponse.data.userData,
							})
						);
						// Здесь можно показать 2FA форму
						return;
					}

					// Если 2FA не требуется, сразу авторизуем
					const { accessToken, refreshToken, ...userData } =
						serverResponse.data;
					localStorage.setItem('accessToken', accessToken);
					localStorage.setItem('refreshToken', refreshToken);
					setUser(userData);
				},
			});

			client.requestAccessToken();
		} catch (error) {
			console.error('Google OAuth error:', error);
			throw error;
		}
	};

	// 2FA верификация
	const verify2FA = async (otp: string) => {
		try {
			const tempData = localStorage.getItem('tempOAuthData');
			if (!tempData) {
				throw new Error('No temporary OAuth data found');
			}

			const { provider, ...oauthData } = JSON.parse(tempData);

			const response = await api.post('/admin/oauth/2fa/verify', {
				provider,
				otp,
				...oauthData,
			});

			console.log('2FA verification response:', response.data);

			// Очищаем временные данные
			localStorage.removeItem('tempOAuthData');

			// Сохраняем токены и устанавливаем пользователя
			const { accessToken, refreshToken, ...userData } = response.data;
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			setUser(userData);
		} catch (error) {
			console.error('2FA verification error:', error);
			throw error;
		}
	};

	const logout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('tempOAuthData');
		setUser(null);
	};

	const value = {
		user,
		isAuthenticated: !!user,
		loginWithGoogle,
		verify2FA,
		logout,
		loading,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
