import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Admin {
	id: number;
	email: string;
	name: string;
	role: string;
}

export default function ForceChangePassword() {
	const [adminId, setAdminId] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [admins, setAdmins] = useState<Admin[]>([]);
	const [loadingAdmins, setLoadingAdmins] = useState(false);
	const { user } = useAuth();

	// Проверяем, что текущий пользователь - супервизор
	if (!user || user.role !== 'SUPERVISOR') {
		return (
			<div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-md'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-red-400'>🚫</div>
					<h2 className='mt-4 text-xl font-bold text-gray-900'>
						Доступ запрещен
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						Только супервизор может принудительно менять пароли
						администраторов
					</p>
				</div>
			</div>
		);
	}

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

	const fetchAdmins = async () => {
		setLoadingAdmins(true);
		try {
			const response = await fetch('/api/admin/users', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						'accessToken'
					)}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setAdmins(data.admins || []);
			}
		} catch (err) {
			console.error('Failed to fetch admins:', err);
		} finally {
			setLoadingAdmins(false);
		}
	};

	React.useEffect(() => {
		fetchAdmins();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		if (!adminId || !newPassword) {
			setError('Выберите администратора и введите новый пароль');
			setLoading(false);
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Новые пароли не совпадают');
			setLoading(false);
			return;
		}

		const passwordError = validatePassword(newPassword);
		if (passwordError) {
			setError(passwordError);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/admin/password/force-change', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem(
						'accessToken'
					)}`,
				},
				body: JSON.stringify({
					adminId: parseInt(adminId),
					newPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Ошибка смены пароля');
			}

			setSuccess(`Пароль для ${data.email} успешно изменен`);
			setAdminId('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Произошла ошибка');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-md'>
			<div className='text-center mb-6'>
				<div className='mx-auto h-12 w-12 text-orange-400'>🔧</div>
				<h2 className='mt-4 text-xl font-bold text-gray-900'>
					Принудительная смена пароля
				</h2>
				<p className='mt-2 text-sm text-gray-600'>
					Измените пароль администратора
				</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label
						htmlFor='adminId'
						className='block text-sm font-medium text-gray-700'>
						Администратор *
					</label>
					<select
						id='adminId'
						value={adminId}
						onChange={(e) => setAdminId(e.target.value)}
						required
						className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'>
						<option value=''>Выберите администратора</option>
						{loadingAdmins ? (
							<option disabled>Загрузка...</option>
						) : (
							admins.map((admin) => (
								<option key={admin.id} value={admin.id}>
									{admin.name} ({admin.email}) - {admin.role}
								</option>
							))
						)}
					</select>
				</div>

				<div>
					<label
						htmlFor='newPassword'
						className='block text-sm font-medium text-gray-700'>
						Новый пароль *
					</label>
					<input
						type='password'
						id='newPassword'
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
						className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
					/>
					<p className='mt-1 text-xs text-gray-500'>
						Минимум 8 символов, включая цифры, буквы и специальные
						символы
					</p>
				</div>

				<div>
					<label
						htmlFor='confirmPassword'
						className='block text-sm font-medium text-gray-700'>
						Подтвердите новый пароль *
					</label>
					<input
						type='password'
						id='confirmPassword'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
					/>
				</div>

				{error && (
					<div className='rounded-md bg-red-50 p-4'>
						<div className='text-sm text-red-700'>{error}</div>
					</div>
				)}

				{success && (
					<div className='rounded-md bg-green-50 p-4'>
						<div className='text-sm text-green-700'>{success}</div>
					</div>
				)}

				<button
					type='submit'
					disabled={loading}
					className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed'>
					{loading
						? 'Смена пароля...'
						: 'Принудительно сменить пароль'}
				</button>
			</form>

			<div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
				<div className='flex'>
					<div className='flex-shrink-0'>
						<div className='h-5 w-5 text-yellow-400'>⚠️</div>
					</div>
					<div className='ml-3'>
						<h3 className='text-sm font-medium text-yellow-800'>
							Внимание
						</h3>
						<div className='mt-2 text-sm text-yellow-700'>
							<p>
								Принудительная смена пароля отправит
								администратору уведомление о необходимости входа
								с новым паролем.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
