import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isDevelopment } from '../lib/env';

export default function AdminLogin() {
	const navigate = useNavigate();
	const { loginWithGoogle, verify2FA, loading } = useAuth();
	const [step, setStep] = useState<'oauth' | '2fa'>('oauth');
	const [otp, setOtp] = useState('');
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		if (!isError) {
			setTimeout(() => setMessage(''), 5000);
		}
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await loginWithGoogle();
			// Если loginWithGoogle не выбросил ошибку, значит требуется 2FA
			setStep('2fa');
			showMessage('Google аутентификация успешна. Введите код 2FA');
		} catch (error: any) {
			console.error('Google login error:', error);
			let message =
				error.response?.data?.message ||
				error.message ||
				'Ошибка входа через Google';

			// Показываем более понятное сообщение для ошибки настройки
			if (message.includes('Google OAuth Client ID not configured')) {
				message =
					'Google OAuth не настроен. Следуйте инструкции в GOOGLE_OAUTH_SETUP_CLIENT.md';
			}

			showMessage(message, true);
		} finally {
			setIsLoading(false);
		}
	};

	const handle2FAVerification = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!otp) {
			showMessage('Введите код 2FA', true);
			return;
		}

		setIsLoading(true);
		try {
			await verify2FA(otp);
			showMessage('Вход выполнен успешно');
			navigate('/dashboard');
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Ошибка верификации 2FA';
			showMessage(message, true);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-primary-600'>🔐</div>
					<h2 className='mt-6 text-3xl font-bold text-gray-900'>
						{step === 'oauth'
							? 'Вход администратора'
							: 'Подтверждение 2FA'}
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						{step === 'oauth'
							? 'Выберите способ входа в админ-панель'
							: 'Введите код из Google Authenticator'}
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
							<p className='text-sm text-yellow-800'>
								🧪 Режим разработки: Тестирование OAuth + 2FA
							</p>
						</div>
					)}
				</div>

				{message && (
					<div
						className={`p-4 rounded-md ${
							message.includes('Ошибка')
								? 'bg-red-50 text-red-700'
								: 'bg-green-50 text-green-700'
						}`}>
						{message}
					</div>
				)}

				{step === 'oauth' && (
					<div className='space-y-4'>
						{/* Google OAuth кнопка */}
						<button
							onClick={handleGoogleLogin}
							disabled={isLoading || loading}
							className='w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'>
							<svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
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
							Войти через Google
						</button>

						{/* Разделитель */}
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-300' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-gray-50 text-gray-500'>
									Требуется 2FA
								</span>
							</div>
						</div>

						<div className='text-center text-sm text-gray-600'>
							<p>Для входа в админ-панель требуется:</p>
							<p>1. Google OAuth аутентификация</p>
							<p>2. Подтверждение через Google Authenticator</p>
						</div>
					</div>
				)}

				{step === '2fa' && (
					<form
						onSubmit={handle2FAVerification}
						className='space-y-6'>
						<div>
							<label
								htmlFor='otp'
								className='block text-sm font-medium text-gray-700'>
								Код 2FA
							</label>
							<input
								id='otp'
								name='otp'
								type='text'
								required
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm'
								placeholder='000000'
								maxLength={6}
								pattern='[0-9]{6}'
							/>
						</div>

						<div>
							<button
								type='submit'
								disabled={isLoading || loading}
								className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isLoading || loading
									? 'Проверка...'
									: 'Подтвердить'}
							</button>
						</div>

						<div className='text-center'>
							<button
								type='button'
								onClick={() => setStep('oauth')}
								className='text-sm text-primary-600 hover:text-primary-500'>
								← Вернуться к выбору входа
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
