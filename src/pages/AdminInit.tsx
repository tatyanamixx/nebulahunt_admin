import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { isDevelopment } from '../lib/env';

export default function AdminInit() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [secretKey, setSecretKey] = useState('');
	const [message, setMessage] = useState('');
	const [qrCode, setQrCode] = useState('');
	const [google2faSecret, setGoogle2faSecret] = useState('');

	// В режиме разработки заполняем тестовые данные
	useEffect(() => {
		if (isDevelopment()) {
			setEmail('admin@test.com');
			setSecretKey('supersecret');
		}
	}, []);

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const handleInitAdmin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !secretKey) {
			showMessage('Заполните все поля', true);
			return;
		}

		setLoading(true);
		try {
			const response = await api.post('/admin/init', {
				email,
				secretKey,
			});
			const { google2faSecret, otpAuthUrl } = response.data;

			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			showMessage(
				'Администратор инициализирован! Настройте Google Authenticator'
			);
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Ошибка инициализации';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleInitSupervisor = async () => {
		setLoading(true);
		try {
			const response = await api.post('/admin/supervisor/init');
			const { google2faSecret, otpAuthUrl } = response.data;

			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			showMessage(
				'Супервайзер инициализирован! Настройте Google Authenticator'
			);
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				'Ошибка инициализации супервайзера';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-primary-600'>⚙️</div>
					<h2 className='mt-6 text-3xl font-bold text-gray-900'>
						Инициализация администраторов
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						Создание новых администраторов и супервайзера
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
							<p className='text-sm text-yellow-800'>
								🧪 Режим разработки: Тестирование инициализации
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

				{!qrCode ? (
					<div className='space-y-6'>
						<form onSubmit={handleInitAdmin} className='space-y-6'>
							<div>
								<label
									htmlFor='email'
									className='block text-sm font-medium text-gray-700'>
									Email администратора
								</label>
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm'
									placeholder='admin@example.com'
								/>
							</div>

							<div>
								<label
									htmlFor='secretKey'
									className='block text-sm font-medium text-gray-700'>
									Секретный ключ
								</label>
								<input
									id='secretKey'
									name='secretKey'
									type='password'
									required
									value={secretKey}
									onChange={(e) =>
										setSecretKey(e.target.value)
									}
									className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm'
									placeholder='Введите секретный ключ'
								/>
							</div>

							<button
								type='submit'
								disabled={loading}
								className={cn(
									'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
								)}>
								{loading ? (
									<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full' />
								) : (
									'Инициализировать администратора'
								)}
							</button>
						</form>

						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-300' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-gray-50 text-gray-500'>
									Или
								</span>
							</div>
						</div>

						<button
							onClick={handleInitSupervisor}
							disabled={loading}
							className={cn(
								'group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
							)}>
							{loading ? (
								<div className='h-5 w-5 animate-spin border-2 border-gray-400 border-t-transparent rounded-full' />
							) : (
								'Инициализировать супервайзера'
							)}
						</button>
					</div>
				) : (
					<div className='space-y-6'>
						<div className='bg-white p-6 rounded-lg border border-gray-200'>
							<h3 className='text-lg font-medium text-gray-900 mb-4'>
								Настройка Google Authenticator
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										QR-код для сканирования:
									</label>
									<div className='flex justify-center'>
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
												qrCode
											)}`}
											alt='QR Code'
											className='border border-gray-300 rounded'
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Секрет для ручного ввода:
									</label>
									<div className='flex items-center space-x-2'>
										<input
											type='text'
											value={google2faSecret}
											readOnly
											className='flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono'
										/>
										<button
											onClick={() =>
												navigator.clipboard.writeText(
													google2faSecret
												)
											}
											className='px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50'
											aria-label='Копировать секрет в буфер обмена'>
											Копировать
										</button>
									</div>
								</div>

								<div className='bg-blue-50 p-4 rounded-md'>
									<h4 className='text-sm font-medium text-blue-900 mb-2'>
										Инструкции:
									</h4>
									<ol className='text-sm text-blue-800 space-y-1'>
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
										<li>
											4. Используйте полученный код для
											входа
										</li>
									</ol>
								</div>
							</div>
						</div>

						<div className='flex space-x-3'>
							<button
								onClick={() => {
									setQrCode('');
									setGoogle2faSecret('');
									setMessage('');
								}}
								className='flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
								Назад
							</button>
							<button
								onClick={() => navigate('/admin/login')}
								className='flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
								Перейти к входу
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
