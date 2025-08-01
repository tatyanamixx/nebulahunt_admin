import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

// Types for Google OAuth
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
	provider: 'google' | 'password';
	providerId: string | null;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	// OAuth methods
	loginWithGoogle: (on2FARequired?: () => void) => Promise<void>;
	// Password methods
	login: () => Promise<void>;
	// 2FA methods
	verify2FA: (otp: string) => Promise<void>;
	// Token methods
	refreshToken: () => Promise<void>;
	// General methods
	logout: () => void;
	clearTokens: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Logout function (defined before other functions)
	const logout = () => {
		console.log('🔐 AuthContext: logout called');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('tempOAuthData');
		setUser(null);
	};

	// Clear tokens function
	const clearTokens = () => {
		console.log('🔐 AuthContext: clearTokens called');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('tempOAuthData');
		setUser(null); // Reset user when clearing tokens
	};

	// Token refresh function (defined before useEffect)
	const refreshToken = async () => {
		try {
			const refreshTokenValue = localStorage.getItem('refreshToken');
			console.log(
				'🔐 Attempting token refresh with refresh token:',
				refreshTokenValue
					? refreshTokenValue.substring(0, 50) + '...'
					: 'none'
			);

			if (!refreshTokenValue) {
				throw new Error('No refresh token found');
			}

			const response = await api.post('/admin/refresh', {
				refreshToken: refreshTokenValue,
			});

			console.log('Token refresh response:', response.data);

			const {
				accessToken,
				refreshToken: newRefreshToken,
				...userData
			} = response.data;
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', newRefreshToken);
			setUser(userData);
			console.log('🔐 Token refresh successful, user set:', userData);
		} catch (error: any) {
			console.error('Token refresh error:', error);
			console.error('Refresh error details:', {
				status: error.response?.status,
				statusText: error.response?.statusText,
				data: error.response?.data,
			});

			// Handle server unavailability
			if (
				error.response?.status === 0 ||
				error.response?.data?.error === 'NETWORK_ERROR' ||
				error.response?.data?.error === 'JSON_PARSE_ERROR' ||
				error.message?.includes('HTTP 500') ||
				error.message?.includes('Internal Server Error')
			) {
				console.error('Server unavailable during token refresh');
				logout();
				throw new Error('Server unavailable. Please try again later.');
			}

			// If token refresh failed, logout
			logout();
			throw error;
		}
	};

	// Check existing session on load
	useEffect(() => {
		const checkSession = async () => {
			const token = localStorage.getItem('accessToken');
			if (token) {
				try {
					const payload = JSON.parse(atob(token.split('.')[1]));
					console.log('Token payload:', payload);

					// Check that token is not expired
					const currentTime = Math.floor(Date.now() / 1000);
					if (payload.exp && payload.exp < currentTime) {
						console.log('Token expired, attempting refresh');
						try {
							await refreshToken();
							return;
						} catch (error) {
							console.error('Token refresh failed:', error);
							logout();
							return;
						}
					}

					// Verify token with server
					try {
						console.log(
							'🔐 Attempting server verification with token:',
							token.substring(0, 50) + '...'
						);
						const response = await api.get('/admin/me');
						console.log(
							'Server verification response:',
							response.data
						);
						setUser(response.data);
					} catch (error: any) {
						console.error('Server verification failed:', error);
						console.error('Error details:', {
							status: error.response?.status,
							statusText: error.response?.statusText,
							data: error.response?.data,
						});

						// Handle server unavailability
						if (
							error.response?.status === 0 ||
							error.response?.data?.error === 'NETWORK_ERROR' ||
							error.response?.data?.error === 'JSON_PARSE_ERROR'
						) {
							console.error('Server unavailable, logging out');
							logout();
							return;
						}

						// If server verification fails, try to refresh token
						try {
							console.log(
								'🔐 Attempting token refresh after verification failure'
							);
							await refreshToken();
						} catch (refreshError) {
							console.error(
								'Token refresh failed after server verification:',
								refreshError
							);
							logout();
						}
						return;
					}
				} catch (error) {
					console.error('Token parsing error:', error);
					localStorage.removeItem('accessToken');
					localStorage.removeItem('refreshToken');
					setUser(null);
				}
			} else {
				console.log('No access token found, clearing user');
				setUser(null);
			}
			setLoading(false);
		};

		checkSession();
	}, []);

	// Google OAuth login
	const loginWithGoogle = async (on2FARequired?: () => void) => {
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
					try {
						if (response.error) {
							throw new Error(
								`Google OAuth error: ${response.error}`
							);
						}

						// Send token to server for verification
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
						console.log(
							'🔐 Server response requires2FA:',
							serverResponse.data.requires2FA
						);

						// If 2FA is required, save temporary data
						if (serverResponse.data.requires2FA) {
							const tempData = {
								provider: 'google',
								accessToken: response.access_token,
								userData: serverResponse.data.userData,
							};
							console.log('🔐 Saving temp OAuth data:', tempData);
							localStorage.setItem(
								'tempOAuthData',
								JSON.stringify(tempData)
							);
							console.log(
								'🔐 tempOAuthData saved to localStorage'
							);
							// Notify that 2FA is required
							if (on2FARequired) {
								on2FARequired();
							}
							return;
						}

						// If 2FA is not required, authorize immediately
						const { accessToken, refreshToken, ...userData } =
							serverResponse.data;
						localStorage.setItem('accessToken', accessToken);
						localStorage.setItem('refreshToken', refreshToken);
						setUser(userData);
					} catch (serverError: any) {
						console.error(
							'Google OAuth server error:',
							serverError
						);

						// Handle server unavailability
						if (
							serverError.response?.status === 0 ||
							serverError.response?.data?.error ===
								'NETWORK_ERROR' ||
							serverError.response?.data?.error ===
								'JSON_PARSE_ERROR' ||
							serverError.message?.includes('HTTP 500') ||
							serverError.message?.includes(
								'Internal Server Error'
							)
						) {
							throw new Error(
								'Server unavailable. Please try again later.'
							);
						}

						// Handle specific server errors (like user not found, etc.)
						if (serverError.response?.data?.message) {
							throw new Error(serverError.response.data.message);
						}

						// Handle other server errors
						throw new Error(
							'Google authentication failed. Please try again.'
						);
					}
				},
			});

			client.requestAccessToken();
		} catch (error: any) {
			console.error('Google OAuth error:', error);

			// Don't throw technical errors to the UI
			if (
				error.message?.includes('Server unavailable') ||
				error.message?.includes('Network Error') ||
				error.message?.includes('Failed to fetch')
			) {
				throw error; // Re-throw server errors as they're handled by the UI
			}

			// For other errors, provide a user-friendly message
			throw new Error('Authentication failed. Please try again.');
		}
	};

	// Password login
	const login = async () => {
		try {
			console.log('🔐 login() вызван');
			const accessToken = localStorage.getItem('accessToken');
			console.log(
				'🔐 accessToken из localStorage:',
				accessToken ? 'present' : 'missing'
			);

			if (!accessToken) {
				throw new Error('No access token found');
			}

			console.log('🔐 Decoding token...');
			// Decode token to get user data
			const tokenParts = accessToken.split('.');
			console.log('🔐 Token parts count:', tokenParts.length);

			if (tokenParts.length !== 3) {
				throw new Error('Invalid token format');
			}

			const payload = JSON.parse(atob(tokenParts[1]));
			console.log('🔐 Token payload:', payload);

			const userData = {
				id: payload.id,
				email: payload.email,
				username: payload.name,
				firstName: payload.firstName,
				lastName: payload.lastName,
				role: payload.role,
				provider: payload.provider,
				providerId: payload.providerId,
			};

			console.log('🔐 Setting user data:', userData);
			setUser(userData);
			console.log('🔐 setUser() вызван');
		} catch (error) {
			console.error('Password login error:', error);
			throw error;
		}
	};

	// 2FA verification
	const verify2FA = async (otp: string) => {
		try {
			console.log('🔐 verify2FA called with OTP:', otp);

			const tempData = localStorage.getItem('tempOAuthData');
			console.log('🔐 tempOAuthData from localStorage:', tempData);

			if (!tempData) {
				throw new Error('No temporary OAuth data found');
			}

			const { provider, ...oauthData } = JSON.parse(tempData);
			console.log('🔐 Parsed OAuth data:', { provider, oauthData });

			const requestData = {
				provider,
				otp,
				...oauthData,
			};
			console.log('🔐 Sending 2FA verification request:', requestData);

			const response = await api.post(
				'/admin/oauth/2fa/verify',
				requestData
			);

			console.log('🔐 2FA verification response:', response.data);

			// Clear temporary data
			localStorage.removeItem('tempOAuthData');

			// Save tokens and set user
			const { accessToken, refreshToken, ...userData } = response.data;
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
			setUser(userData);
		} catch (error: any) {
			console.error('🔐 2FA verification error:', error);

			// Handle server unavailability
			if (
				error.response?.status === 0 ||
				error.response?.data?.error === 'NETWORK_ERROR' ||
				error.response?.data?.error === 'JSON_PARSE_ERROR' ||
				error.message?.includes('HTTP 500') ||
				error.message?.includes('Internal Server Error')
			) {
				throw new Error('Server unavailable. Please try again later.');
			}

			// Handle specific server errors (like invalid OTP)
			if (error.response?.data?.message) {
				throw new Error(error.response.data.message);
			}

			// Handle other server errors
			throw new Error('2FA verification failed. Please try again.');
		}
	};

	const value = {
		user,
		isAuthenticated: !!user,
		loginWithGoogle,
		login,
		verify2FA,
		refreshToken,
		logout,
		clearTokens,
		loading,
	};

	// Отладочная информация отключена для тестирования

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	// console.log('🔐 useAuth: context =', context);

	if (context === undefined) {
		console.error(
			'🔐 useAuth: Context is undefined - not within AuthProvider'
		);
		throw new Error('useAuth must be used within an AuthProvider');
	}

	// console.log('🔐 useAuth: isAuthenticated =', context.isAuthenticated);
	return context;
}
