import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isDevelopment } from '../lib/env';

export default function AdminLogin() {
	const navigate = useNavigate();
	const {
		loginWithGoogle,
		verify2FA,
		login,
		clearTokens,
		loading,
		isAuthenticated,
	} = useAuth();
	const [step, setStep] = useState<'oauth' | '2fa'>('oauth');

	// Debug authentication state on component mount
	useEffect(() => {
		console.log('🔐 AdminLogin component mount - Auth state:', {
			isAuthenticated,
			accessToken: localStorage.getItem('accessToken')
				? 'present'
				: 'missing',
			refreshToken: localStorage.getItem('refreshToken')
				? 'present'
				: 'missing',
			tempOAuthData: localStorage.getItem('tempOAuthData')
				? 'present'
				: 'missing',
		});

		// If already authenticated, redirect to dashboard
		if (isAuthenticated) {
			console.log('🔐 Already authenticated, redirecting to dashboard');
			navigate('/dashboard');
		}

		// If we're on 2FA step but no tempOAuthData, go back to OAuth step
		if (step === '2fa' && !localStorage.getItem('tempOAuthData')) {
			console.log(
				'🔐 No tempOAuthData found on 2FA step, returning to OAuth step'
			);
			setStep('oauth');
			showMessage('Please complete Google OAuth first', true);
		}
	}, [isAuthenticated, navigate, step]);
	const [otp, setOtp] = useState('');
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// State for email/password form
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [debugInfo, setDebugInfo] = useState({
		clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'not_set',
		googleOAuthAvailable: false,
		scriptLoaded: false,
	});

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		if (!isError) {
			setTimeout(() => setMessage(''), 5000);
		}
	};

	// Debug information
	useEffect(() => {
		const checkGoogleOAuth = () => {
			const scriptLoaded = !!document.querySelector(
				'script[src*="accounts.google.com"]'
			);
			const oauthAvailable = !!window.google?.accounts?.oauth2;

			setDebugInfo({
				clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'not_set',
				googleOAuthAvailable: oauthAvailable,
				scriptLoaded,
			});
		};

		checkGoogleOAuth();
		const interval = setInterval(checkGoogleOAuth, 2000);
		return () => clearInterval(interval);
	}, []);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await loginWithGoogle();
			// If loginWithGoogle didn't throw an error, 2FA is required
			setStep('2fa');
			showMessage(
				'Google authentication successful. Please enter 2FA code'
			);
		} catch (error: any) {
			console.error('Google login error:', error);
			let message =
				error.response?.data?.message ||
				error.message ||
				'Google login error';

			// Show more understandable message for setup error
			if (message.includes('Google OAuth Client ID not configured')) {
				message =
					'Google OAuth not configured. Follow instructions in GOOGLE_OAUTH_SETUP_CLIENT.md';
			}

			showMessage(message, true);
		} finally {
			setIsLoading(false);
		}
	};

	const handle2FAVerification = async (e: React.FormEvent) => {
		e.preventDefault();

		console.log('🔐 handle2FAVerification called with OTP:', otp);

		// Debug localStorage state
		const accessToken = localStorage.getItem('accessToken');
		const refreshToken = localStorage.getItem('refreshToken');
		const tempOAuthData = localStorage.getItem('tempOAuthData');

		console.log('🔐 localStorage debug:', {
			accessToken: accessToken ? 'present' : 'missing',
			refreshToken: refreshToken ? 'present' : 'missing',
			tempOAuthData: tempOAuthData ? 'present' : 'missing',
			tempOAuthDataContent: tempOAuthData,
		});

		if (!otp) {
			showMessage('Please enter 2FA code', true);
			return;
		}

		setIsLoading(true);
		try {
			console.log('🔐 Calling verify2FA...');
			await verify2FA(otp);
			console.log('🔐 verify2FA successful');
			showMessage('Login successful');
			navigate('/dashboard');
		} catch (error: any) {
			console.error('🔐 handle2FAVerification error:', error);
			const message =
				error.response?.data?.message || '2FA verification error';
			showMessage(message, true);
		} finally {
			setIsLoading(false);
		}
	};

	// Function for email and password login
	const handlePasswordLogin = async (e: React.FormEvent) => {
		console.log('🔐 handlePasswordLogin called');
		e.preventDefault();
		console.log('🔐 preventDefault executed');
		setPasswordLoading(true);
		setMessage('');
		console.log('🔐 State updated');

		try {
			console.log('🔐 Отправляем запрос:', {
				email,
				hasPassword: !!password,
			});
			const response = await fetch('/api/admin/login/password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});
			console.log('🔐 Ответ получен:', response.status);

			const data = await response.json();
			console.log('🔐 Данные ответа:', data);

			if (!response.ok) {
				throw new Error(data.message || 'Login error');
			}

			// Сохраняем токены
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);

			// Обновляем контекст аутентификации
			await login();

			// Show password warning if exists
			if (data.passwordWarning) {
				alert(`Warning: ${data.passwordMessage}`);
			}

			// Перенаправляем на дашборд
			navigate('/dashboard');
		} catch (err) {
			console.log('🔐 Ошибка:', err);
			setMessage(
				err instanceof Error ? err.message : 'An error occurred'
			);
		} finally {
			console.log('🔐 Завершение handlePasswordLogin');
			setPasswordLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-blue-400'>🔐</div>
					<h2 className='mt-6 text-3xl font-bold text-white'>
						Admin Login
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						Sign in with Google OAuth or email and password
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-md'>
							<p className='text-sm text-yellow-200'>
								🧪 Development mode: Testing вход
							</p>
							<div className='mt-2 text-xs text-yellow-300 space-y-1'>
								<div>
									Client ID:{' '}
									{debugInfo.clientId.substring(0, 20)}...
								</div>
								<div>
									Script Loaded:{' '}
									{debugInfo.scriptLoaded ? '✅' : '❌'}
								</div>
								<div>
									OAuth Available:{' '}
									{debugInfo.googleOAuthAvailable
										? '✅'
										: '❌'}
								</div>
							</div>
							<button
								onClick={clearTokens}
								className='mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700'>
								Clear Tokens
							</button>
						</div>
					)}
				</div>

				{message && (
					<div
						className={`p-4 rounded-md ${
							message.includes('error') ||
							message.includes('Error')
								? 'bg-red-900 text-red-200 border border-red-700'
								: 'bg-green-900 text-green-200 border border-green-700'
						}`}>
						{message}
					</div>
				)}

				{/* Google OAuth + 2FA */}
				{step === 'oauth' && (
					<div className='space-y-6'>
						{/* Google OAuth кнопка */}
						<div className='space-y-4'>
							<button
								onClick={handleGoogleLogin}
								disabled={isLoading || loading}
								className='w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'>
								<svg
									className='w-5 h-5 mr-3'
									viewBox='0 0 24 24'>
									<path
										fill='#4285F4'
										d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
									/>
									<path
										fill='#34A853'
										d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
									/>
									<path
										fill='#FBBC05'
										d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
									/>
									<path
										fill='#EA4335'
										d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
									/>
								</svg>
								Sign in with Google
							</button>
							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<div className='w-full border-t border-gray-600' />
								</div>
								<div className='relative flex justify-center text-sm'>
									<span className='px-2 bg-gray-900 text-gray-400'>
										2FA обязательно
									</span>
								</div>
							</div>
						</div>

						{/* Форма email/пароль */}
						<form
							onSubmit={handlePasswordLogin}
							className='space-y-4'>
							<div>
								<label
									htmlFor='email'
									className='block text-sm font-medium text-gray-300'>
									Email
								</label>
								<input
									id='email'
									name='email'
									type='email'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
									placeholder='Enter email'
								/>
							</div>
							<div>
								<label
									htmlFor='password'
									className='block text-sm font-medium text-gray-300'>
									Пароль
								</label>
								<input
									id='password'
									name='password'
									type='password'
									required
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className='mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
									placeholder='Enter password'
								/>
							</div>
							<button
								type='submit'
								disabled={passwordLoading}
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{passwordLoading
									? 'Signing in...'
									: 'Sign in with email and password'}
							</button>
						</form>

						<div className='text-center text-sm text-gray-400'>
							<p>For admin panel access, you need:</p>
							<p>1. Google authentication + 2FA</p>
							<p>2. Or sign in with email and password</p>
						</div>
					</div>
				)}

				{/* 2FA форма */}
				{step === '2fa' && (
					<form
						onSubmit={handle2FAVerification}
						className='space-y-6'>
						<div>
							<label
								htmlFor='otp'
								className='block text-sm font-medium text-gray-300'>
								2FA Code
							</label>
							<input
								id='otp'
								name='otp'
								type='text'
								required
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='000000'
								maxLength={6}
								pattern='[0-9]{6}'
							/>
						</div>

						<div>
							<button
								type='submit'
								disabled={isLoading || loading}
								className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isLoading || loading
									? 'Verifying...'
									: 'Verify'}
							</button>
						</div>

						<div className='text-center'>
							<button
								type='button'
								onClick={() => setStep('oauth')}
								className='text-sm text-blue-400 hover:text-blue-300'>
								← Back to login options
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
