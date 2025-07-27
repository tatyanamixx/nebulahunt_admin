import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PasswordInfo {
	hasPassword: boolean;
	passwordChangedAt: string | null;
	passwordExpiresAt: string | null;
	lastLoginAt: string | null;
	loginAttempts: number;
	lockedUntil: string | null;
	passwordWarning: boolean;
	passwordDaysLeft: number | null;
	passwordMessage: string | null;
	isLocked: boolean;
	lockMinutesLeft: number | null;
}

export default function ChangePassword() {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [passwordInfo, setPasswordInfo] = useState<PasswordInfo | null>(null);
	const { user } = useAuth();

	const fetchPasswordInfo = async () => {
		try {
			const response = await fetch('/api/admin/password/info', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						'accessToken'
					)}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setPasswordInfo(data);
			}
		} catch (err) {
			console.error('Failed to fetch password info:', err);
		}
	};

	React.useEffect(() => {
		fetchPasswordInfo();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		if (newPassword !== confirmPassword) {
			setError('Новые пароли не совпадают');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/admin/password/change', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem(
						'accessToken'
					)}`,
				},
				body: JSON.stringify({
					currentPassword,
					newPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Ошибка смены пароля');
			}

			setSuccess('Пароль успешно изменен');
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');

			// Обновляем информацию о пароле
			await fetchPasswordInfo();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Произошла ошибка');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-md'>
			<h2 className='text-2xl font-bold mb-6 text-gray-900'>
				Смена пароля
			</h2>

			{/* Информация о пароле */}
			{passwordInfo && (
				<div className='mb-6 p-4 bg-gray-50 rounded-lg'>
					<h3 className='text-lg font-semibold mb-3'>
						Информация о пароле
					</h3>
					<div className='space-y-2 text-sm'>
						<p>
							<strong>Пароль установлен:</strong>{' '}
							{passwordInfo.hasPassword ? 'Да' : 'Нет'}
						</p>
						{passwordInfo.passwordChangedAt && (
							<p>
								<strong>Изменен:</strong>{' '}
								{new Date(
									passwordInfo.passwordChangedAt
								).toLocaleDateString()}
							</p>
						)}
						{passwordInfo.passwordExpiresAt && (
							<p>
								<strong>Истекает:</strong>{' '}
								{new Date(
									passwordInfo.passwordExpiresAt
								).toLocaleDateString()}
							</p>
						)}
						{passwordInfo.lastLoginAt && (
							<p>
								<strong>Последний вход:</strong>{' '}
								{new Date(
									passwordInfo.lastLoginAt
								).toLocaleDateString()}
							</p>
						)}
						{passwordInfo.passwordWarning && (
							<p className='text-yellow-600'>
								<strong>Предупреждение:</strong>{' '}
								{passwordInfo.passwordMessage}
							</p>
						)}
						{passwordInfo.isLocked && (
							<p className='text-red-600'>
								<strong>Аккаунт заблокирован:</strong>{' '}
								{passwordInfo.lockMinutesLeft} мин.
							</p>
						)}
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label
						htmlFor='currentPassword'
						className='block text-sm font-medium text-gray-700'>
						Текущий пароль
					</label>
					<input
						type='password'
						id='currentPassword'
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						required
						className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
					/>
				</div>

				<div>
					<label
						htmlFor='newPassword'
						className='block text-sm font-medium text-gray-700'>
						Новый пароль
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
						Подтвердите новый пароль
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
					className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'>
					{loading ? 'Смена пароля...' : 'Сменить пароль'}
				</button>
			</form>
		</div>
	);
}
