import React, { useState, useEffect } from 'react';
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

export default function PasswordStatus() {
	const [passwordInfo, setPasswordInfo] = useState<PasswordInfo | null>(null);
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();

	const fetchPasswordInfo = async () => {
		if (!user) return;

		setLoading(true);
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
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPasswordInfo();
		// Обновляем информацию каждые 5 минут
		const interval = setInterval(fetchPasswordInfo, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [user]);

	if (!user || !passwordInfo) {
		return null;
	}

	// Если пароль истек, показываем критическое предупреждение
	if (passwordInfo.passwordWarning && passwordInfo.passwordDaysLeft === 0) {
		return (
			<div className='bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium'>
				⚠️ Пароль истек
			</div>
		);
	}

	// Если пароль скоро истечет, показываем предупреждение
	if (
		passwordInfo.passwordWarning &&
		passwordInfo.passwordDaysLeft &&
		passwordInfo.passwordDaysLeft <= 7
	) {
		return (
			<div className='bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium'>
				⏰ Пароль истечет через {passwordInfo.passwordDaysLeft} дн.
			</div>
		);
	}

	// Если аккаунт заблокирован
	if (passwordInfo.isLocked) {
		return (
			<div className='bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium'>
				🔒 Аккаунт заблокирован ({passwordInfo.lockMinutesLeft} мин.)
			</div>
		);
	}

	// Если есть неудачные попытки входа
	if (passwordInfo.loginAttempts > 0) {
		return (
			<div className='bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium'>
				⚠️ {passwordInfo.loginAttempts} неудачных попыток
			</div>
		);
	}

	return null;
}
