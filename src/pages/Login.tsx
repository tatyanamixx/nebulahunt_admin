import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
	isDevelopment,
	isTelegramWebApp,
	logEnvironmentInfo,
} from '../lib/env';

export default function Login() {
	const { login, verify2FA, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [step, setStep] = useState<'telegram' | '2fa'>('telegram');
	const [loading, setLoading] = useState(false);
	const [otp, setOtp] = useState('');
	const [message, setMessage] = useState('');
	const [user, setUser] = useState<{
		id: number;
		username: string;
		first_name: string;
		last_name?: string;
	} | null>(null);

	// Логируем информацию об окружении в режиме разработки
	useEffect(() => {
		logEnvironmentInfo();
	}, []);

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard');
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		// Инициализация Telegram WebApp
		if (isTelegramWebApp()) {
			window.Telegram.WebApp.ready();
			window.Telegram.WebApp.expand();

			const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
			if (telegramUser) {
				setUser(telegramUser);
			}
		} else if (isDevelopment()) {
			// В режиме разработки создаем тестового пользователя
			setUser({
				id: 123456789,
				username: 'test_admin',
				first_name: 'Test',
			});
		}
	}, []);

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 3000);
	};

	const handleTelegramLogin = async () => {
		let initData = '';

		if (isTelegramWebApp()) {
			initData = window.Telegram.WebApp.initData;
		} else if (isDevelopment()) {
			// В режиме разработки используем тестовые данные
			initData = 'test_init_data_for_development';
		}

		if (!initData) {
			showMessage('Ошибка инициализации Telegram WebApp', true);
			return;
		}

		setLoading(true);
		try {
			await login(initData);
			setStep('2fa');
			showMessage('Telegram аутентификация успешна');
		} catch (error: any) {
			const message = error.response?.data?.message || 'Ошибка входа';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handle2FAVerification = async () => {
		if (!otp) {
			showMessage('Введите код 2FA', true);
			return;
		}

		setLoading(true);
		try {
			await verify2FA(otp);
			showMessage('Вход выполнен успешно');
			navigate('/dashboard');
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Ошибка верификации 2FA';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	console.log('🔍 Debug: isDevelopment:', isDevelopment());
	console.log('🔍 Debug: isTelegramWebApp:', isTelegramWebApp());

	// Показываем предупреждение в режиме разработки
	if (!isTelegramWebApp() && !isDevelopment()) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='max-w-md w-full space-y-8'>
					<div className='text-center'>
						<div className='mx-auto h-12 w-12 text-gray-400'>
							🔒
						</div>
						<h2 className='mt-6 text-3xl font-bold text-gray-900'>
							Доступ запрещен
						</h2>
						<p className='mt-2 text-sm text-gray-600'>
							Это приложение доступно только через Telegram WebApp
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-primary-600'>🔐</div>
					<h2 className='mt-6 text-3xl font-bold text-gray-900'>
						{step === 'telegram'
							? 'Вход в админ-панель'
							: 'Подтверждение 2FA'}
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						{step === 'telegram'
							? 'Используйте Telegram для входа в систему'
							: 'Введите код из приложения аутентификации'}
					</p>
					{isDevelopment() && !isTelegramWebApp() && (
						<div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
							<p className='text-sm text-yellow-800'>
								🧪 Режим разработки: Тестирование без Telegram
								WebApp
							</p>
						</div>
					)}
				</div>

				{message && (
					<div
						className={cn(
							'p-4 rounded-md',
							message.includes('Ошибка')
								? 'bg-red-50 text-red-700'
								: 'bg-green-50 text-green-700'
						)}>
						{message}
					</div>
				)}

				{step === 'telegram' && (
					<div className='space-y-6'>
						{user && (
							<div className='bg-white p-4 rounded-lg border border-gray-200'>
								<div className='flex items-center space-x-3'>
									<div className='flex-shrink-0'>
										<div className='h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center'>
											<span className='text-primary-600 font-medium'>
												{user.first_name.charAt(0)}
											</span>
										</div>
									</div>
									<div>
										<p className='text-sm font-medium text-gray-900'>
											{user.first_name}{' '}
											{user.last_name || ''}
										</p>
										<p className='text-sm text-gray-500'>
											@{user.username}
										</p>
									</div>
								</div>
							</div>
						)}

						<button
							onClick={handleTelegramLogin}
							disabled={loading}
							className={cn(
								'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
							)}>
							{loading ? (
								<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full' />
							) : isDevelopment() && !isTelegramWebApp() ? (
								'Тестовый вход'
							) : (
								'Войти через Telegram'
							)}
						</button>
					</div>
				)}

				{step === '2fa' && (
					<div className='space-y-6'>
						<div className='bg-white p-4 rounded-lg border border-gray-200'>
							<div className='flex items-center space-x-3'>
								<div className='h-5 w-5 text-gray-400'>📱</div>
								<div>
									<p className='text-sm font-medium text-gray-900'>
										Код подтверждения
									</p>
									<p className='text-sm text-gray-500'>
										Введите 6-значный код из приложения
									</p>
									{isDevelopment() && (
										<p className='text-xs text-gray-400 mt-1'>
											Тест: используйте любой 6-значный
											код
										</p>
									)}
								</div>
							</div>
						</div>

						<div>
							<label htmlFor='otp' className='sr-only'>
								Код 2FA
							</label>
							<input
								id='otp'
								name='otp'
								type='text'
								autoComplete='one-time-code'
								required
								value={otp}
								onChange={(e) =>
									setOtp(
										e.target.value
											.replace(/\D/g, '')
											.slice(0, 6)
									)
								}
								className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm'
								placeholder='000000'
								maxLength={6}
							/>
						</div>

						<div className='flex space-x-3'>
							<button
								onClick={() => setStep('telegram')}
								className='flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
								Назад
							</button>
							<button
								onClick={handle2FAVerification}
								disabled={loading || otp.length !== 6}
								className={cn(
									'flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
								)}>
								{loading ? (
									<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full mx-auto' />
								) : (
									'Подтвердить'
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
