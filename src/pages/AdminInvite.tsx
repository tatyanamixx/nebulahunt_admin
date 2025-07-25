import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { isDevelopment } from '../lib/env';

interface InviteForm {
	email: string;
	role: 'ADMIN' | 'SUPERVISOR';
	name: string;
}

export default function AdminInvite() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<InviteForm>({
		email: '',
		role: 'ADMIN',
		name: '',
	});
	const [message, setMessage] = useState('');

	// В режиме разработки заполняем тестовые данные
	if (isDevelopment() && !formData.email) {
		setFormData((prev) => ({
			...prev,
			email: 'admin@test.com',
			name: 'Test Admin',
		}));
	}

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email || !formData.name) {
			showMessage('Заполните все обязательные поля', true);
			return;
		}

		setLoading(true);
		try {
			await api.post('/admin/invite', formData);
			showMessage(`Приглашение отправлено на ${formData.email}`);

			// Очищаем форму
			setFormData({
				email: '',
				role: 'ADMIN',
				name: '',
			});
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Ошибка отправки приглашения';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: keyof InviteForm, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-primary-600'>📧</div>
					<h2 className='mt-6 text-3xl font-bold text-gray-900'>
						Пригласить администратора
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						Отправьте приглашение новому администратору по email
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
							<p className='text-sm text-yellow-800'>
								🧪 Режим разработки: Тестирование приглашений
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

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label
							htmlFor='name'
							className='block text-sm font-medium text-gray-700'>
							Имя администратора *
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
							className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm'
							placeholder='Иван Иванов'
						/>
					</div>

					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700'>
							Email администратора *
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
							className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm'
							placeholder='admin@example.com'
						/>
					</div>

					<div>
						<label
							htmlFor='role'
							className='block text-sm font-medium text-gray-700'>
							Роль
						</label>
						<select
							id='role'
							name='role'
							value={formData.role}
							onChange={(e) =>
								handleInputChange(
									'role',
									e.target.value as 'ADMIN' | 'SUPERVISOR'
								)
							}
							className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm'>
							<option value='ADMIN'>Администратор</option>
							<option value='SUPERVISOR'>Супервайзер</option>
						</select>
					</div>

					<div className='bg-blue-50 p-4 rounded-md'>
						<h4 className='text-sm font-medium text-blue-900 mb-2'>
							Что произойдет:
						</h4>
						<ul className='text-sm text-blue-800 space-y-1'>
							<li>
								• На указанный email будет отправлено
								приглашение
							</li>
							<li>
								• Администратор получит ссылку для регистрации
							</li>
							<li>
								• При регистрации потребуется настроить Google
								2FA
							</li>
							<li>
								• После настройки 2FA доступ будет активирован
							</li>
						</ul>
					</div>

					<div className='flex space-x-3'>
						<button
							type='button'
							onClick={() => navigate('/dashboard')}
							className='flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
							Отмена
						</button>
						<button
							type='submit'
							disabled={loading}
							className={cn(
								'flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
							)}>
							{loading ? (
								<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full mx-auto' />
							) : (
								'Отправить приглашение'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
