import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

// Типы для Telegram WebApp
declare global {
	interface Window {
		Telegram: {
			WebApp: {
				initData: string;
				initDataUnsafe: {
					user?: {
						id: number;
						username: string;
						first_name: string;
						last_name?: string;
					};
				};
				ready: () => void;
				expand: () => void;
				close: () => void;
			};
		};
	}
}

interface User {
	id: number;
	username: string;
	role: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	login: (initData: string) => Promise<void>;
	verify2FA: (otp: string) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			// Простая проверка токена (в реальном приложении лучше использовать jwt-decode)
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				setUser({
					id: payload.id,
					username: payload.username,
					role: payload.role,
				});
			} catch (error) {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
			}
		}
		setLoading(false);
	}, []);

	const login = async (initData: string) => {
		try {
			const response = await api.post(
				'/admin/login',
				{},
				{
					headers: {
						'x-telegram-init-data': initData,
					},
				}
			);

			const { accessToken, refreshToken, ...userData } = response.data;
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			setUser(userData);
		} catch (error) {
			throw error;
		}
	};

	const verify2FA = async (otp: string) => {
		try {
			const response = await api.post('/admin/2fa/verify', { otp });
			const { accessToken, refreshToken, ...userData } = response.data;
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			setUser(userData);
		} catch (error) {
			throw error;
		}
	};

	const logout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		setUser(null);
	};

	const value = {
		user,
		isAuthenticated: !!user,
		login,
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
