import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { isDevelopment } from '../lib/env';

interface RegisterForm {
	email: string;
	password: string;
	confirmPassword: string;
	name: string;
	otp: string;
}

export default function AdminRegister() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'register' | '2fa'>('register');
	const [formData, setFormData] = useState<RegisterForm>({
		email: '',
		password: '',
		confirmPassword: '',
		name: '',
		otp: '',
	});
	const [message, setMessage] = useState('');
	const [qrCode, setQrCode] = useState('');
	const [google2faSecret, setGoogle2faSecret] = useState('');
	const [inviteToken, setInviteToken] = useState('');

	// Get invitation token from URL
	useEffect(() => {
		const token = searchParams.get('token');
		if (token) {
			setInviteToken(token);
			// Validate token
			validateInviteToken(token);
		}
	}, [searchParams]);

	// Fill test data in development mode
	useEffect(() => {
		if (isDevelopment() && !formData.email) {
			setFormData((prev) => ({
				...prev,
				email: 'admin@test.com',
				name: 'Test Admin',
				password: 'TestPass123!',
				confirmPassword: 'TestPass123!',
			}));
		}
	}, []);

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const validateInviteToken = async (token: string) => {
		try {
			const response = await api.get(
				`/admin/invite/validate?token=${token}`
			);
			const { email, name, role } = response.data;
			setFormData((prev) => ({
				...prev,
				email,
				name,
			}));
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Invalid invitation';
			showMessage(message, true);
			// Redirect to login page after 3 seconds
			setTimeout(() => navigate('/admin/login'), 3000);
		}
	};

	const validatePassword = (password: string) => {
		const minLength = 8;

		if (password.length < minLength) {
			return `Пароль должен содержать минимум ${minLength} символов`;
		}

		if (!/\d/.test(password)) {
			return 'Пароль должен содержать хотя бы одну цифру';
		}

		if (!/[a-zA-Z]/.test(password)) {
			return 'Пароль должен содержать хотя бы одну букву';
		}

		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			return 'Пароль должен содержать хотя бы один специальный символ';
		}

		return null;
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email || !formData.password || !formData.name) {
			showMessage('Заполните все обязательные поля', true);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			showMessage('Пароли не совпадают', true);
			return;
		}

		const passwordError = validatePassword(formData.password);
		if (passwordError) {
			showMessage(passwordError, true);
			return;
		}

		setLoading(true);
		try {
			const response = await api.post('/admin/register', {
				email: formData.email,
				password: formData.password,
				name: formData.name,
				inviteToken,
			});

			const { google2faSecret, otpAuthUrl } = response.data;
			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			setStep('2fa');
			showMessage('Регистрация успешна! Настройте Google Authenticator');
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Registration error';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handle2FAVerification = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.otp) {
			showMessage('Enter 2FA code', true);
			return;
		}

		setLoading(true);
		try {
			await api.post('/admin/2fa/complete', {
				email: formData.email,
				otp: formData.otp,
				inviteToken,
			});

			showMessage(
				'Регистрация завершена! Перенаправление на страницу входа...'
			);
			setTimeout(() => navigate('/admin/login'), 2000);
		} catch (error: any) {
			const message =
				error.response?.data?.message || '2FA verification error';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: keyof RegisterForm, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	if (!inviteToken && !isDevelopment()) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
				<div className='max-w-md w-full text-center'>
					<div className='mx-auto h-12 w-12 text-red-400'>❌</div>
					<h2 className='mt-6 text-2xl font-bold text-white'>
						Недействительная ссылка
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						Для регистрации требуется действующее приглашение
					</p>
					<button
						onClick={() => navigate('/admin/login')}
						className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
						Перейти к входу
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-blue-400'>
						{step === 'register' ? '👤' : '🔐'}
					</div>
					<h2 className='mt-6 text-3xl font-bold text-white'>
						{step === 'register'
							? 'Регистрация администратора'
							: 'Настройка 2FA'}
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						{step === 'register'
							? 'Завершите регистрацию администратора'
							: 'Настройте Google Authenticator для завершения регистрации'}
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-md'>
							<p className='text-sm text-yellow-200'>
								🧪 Development mode: Testing registration
							</p>
						</div>
					)}
				</div>

				{message && (
					<div
						className={cn(
							'p-4 rounded-md',
							message.includes('error') ||
								message.includes('Error')
								? 'bg-red-900 text-red-200 border border-red-700'
								: 'bg-green-900 text-green-200 border border-green-700'
						)}>
						{message}
					</div>
				)}

				{step === 'register' && (
					<form onSubmit={handleRegister} className='space-y-6'>
						<div>
							<label
								htmlFor='name'
								className='block text-sm font-medium text-gray-300'>
								Имя *
							</label>
							<input
								id='name'
								name='name'
								type='text'
								required
								value={formData.name}
								onChange={(e) =>
									handleInputChange('name', e.target.value)
								}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='John Doe'
							/>
						</div>

						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium text-gray-300'>
								Email *
							</label>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								value={formData.email}
								onChange={(e) =>
									handleInputChange('email', e.target.value)
								}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='admin@example.com'
								readOnly={!!inviteToken}
							/>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-gray-300'>
								Пароль *
							</label>
							<input
								id='password'
								name='password'
								type='password'
								autoComplete='new-password'
								required
								value={formData.password}
								onChange={(e) =>
									handleInputChange(
										'password',
										e.target.value
									)
								}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='Минимум 8 символов'
							/>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-300'>
								Подтвердите пароль *
							</label>
							<input
								id='confirmPassword'
								name='confirmPassword'
								type='password'
								autoComplete='new-password'
								required
								value={formData.confirmPassword}
								onChange={(e) =>
									handleInputChange(
										'confirmPassword',
										e.target.value
									)
								}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='Повторите пароль'
							/>
						</div>

						<button
							type='submit'
							disabled={loading}
							className={cn(
								'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
							)}>
							{loading ? (
								<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full' />
							) : (
								'Зарегистрироваться'
							)}
						</button>
					</form>
				)}

				{step === '2fa' && (
					<div className='space-y-6'>
						<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
							<h3 className='text-lg font-medium text-white mb-4'>
								Настройка Google Authenticator
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										QR-код для сканирования:
									</label>
									<div className='flex justify-center'>
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
												qrCode
											)}`}
											alt='QR Code'
											className='border border-gray-600 rounded'
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Секрет для ручного ввода:
									</label>
									<div className='flex items-center space-x-2'>
										<input
											type='text'
											value={google2faSecret}
											readOnly
											aria-label='Google 2FA secret key'
											className='flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white text-sm font-mono rounded-md'
										/>
										<button
											onClick={() =>
												navigator.clipboard.writeText(
													google2faSecret
												)
											}
											className='px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600'
											aria-label='Copy secret to clipboard'>
											Копировать
										</button>
									</div>
								</div>

								<div className='bg-blue-900 p-4 rounded-md border border-blue-700'>
									<h4 className='text-sm font-medium text-blue-200 mb-2'>
										Инструкции:
									</h4>
									<ol className='text-sm text-blue-300 space-y-1'>
										<li>
											1. Откройте Google Authenticator
										</li>
										<li>
											2. Нажмите "+" для добавления
											аккаунта
										</li>
										<li>
											3. Выберите "Сканировать QR-код" или
											введите секрет вручную
										</li>
										<li>4. Введите полученный код ниже</li>
									</ol>
								</div>
							</div>
						</div>

						<form
							onSubmit={handle2FAVerification}
							className='space-y-6'>
							<div>
								<label
									htmlFor='otp'
									className='block text-sm font-medium text-gray-300'>
									Код 2FA *
								</label>
								<input
									id='otp'
									name='otp'
									type='text'
									autoComplete='one-time-code'
									required
									value={formData.otp}
									onChange={(e) =>
										handleInputChange(
											'otp',
											e.target.value
												.replace(/\D/g, '')
												.slice(0, 6)
										)
									}
									className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
									placeholder='000000'
									maxLength={6}
								/>
							</div>

							<div className='flex space-x-3'>
								<button
									type='button'
									onClick={() => setStep('register')}
									className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'>
									Назад
								</button>
								<button
									type='submit'
									disabled={
										loading || formData.otp.length !== 6
									}
									className={cn(
										'flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
									)}>
									{loading ? (
										<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full mx-auto' />
									) : (
										'Завершить регистрацию'
									)}
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
