import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface GameSettings {
	DAILY_BONUS_STARDUST: number;
	DAILY_BONUS_DARK_MATTER: number;
	GALAXY_BASE_PRICE: number;
	ARTIFACT_DROP_RATE: number;
	LEADERBOARD_LIMIT: number;
}

export default function Settings() {
	const { user, logout } = useAuth();
	const [settings, setSettings] = useState<GameSettings>({
		DAILY_BONUS_STARDUST: 50,
		DAILY_BONUS_DARK_MATTER: 5,
		GALAXY_BASE_PRICE: 100,
		ARTIFACT_DROP_RATE: 0.1,
		LEADERBOARD_LIMIT: 100,
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');

	useEffect(() => {
		fetchSettings();
	}, []);

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 3000);
	};

	const fetchSettings = async () => {
		try {
			const response = await api.get('/admin/settings');
			setSettings(response.data);
		} catch (error) {
			showMessage('Ошибка загрузки настроек', true);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await api.put('/admin/settings', settings);
			showMessage('Настройки сохранены');
		} catch (error) {
			showMessage('Ошибка сохранения настроек', true);
		} finally {
			setSaving(false);
		}
	};

	const handleReset = () => {
		setSettings({
			DAILY_BONUS_STARDUST: 50,
			DAILY_BONUS_DARK_MATTER: 5,
			GALAXY_BASE_PRICE: 100,
			ARTIFACT_DROP_RATE: 0.1,
			LEADERBOARD_LIMIT: 100,
		});
		showMessage('Настройки сброшены к значениям по умолчанию');
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='h-8 w-8 animate-spin border-2 border-primary-600 border-t-transparent rounded-full' />
			</div>
		);
	}

	const settingFields = [
		{
			key: 'DAILY_BONUS_STARDUST' as keyof GameSettings,
			label: 'Ежедневный бонус Stardust',
			description: 'Количество Stardust, выдаваемое за ежедневный вход',
			icon: '⭐',
			type: 'number',
			min: 0,
			max: 1000,
			step: 1,
		},
		{
			key: 'DAILY_BONUS_DARK_MATTER' as keyof GameSettings,
			label: 'Ежедневный бонус Dark Matter',
			description:
				'Количество Dark Matter, выдаваемое за ежедневный вход',
			icon: '💎',
			type: 'number',
			min: 0,
			max: 100,
			step: 1,
		},
		{
			key: 'GALAXY_BASE_PRICE' as keyof GameSettings,
			label: 'Базовая цена галактики',
			description: 'Стоимость покупки новой галактики в Stardust',
			icon: '🌌',
			type: 'number',
			min: 10,
			max: 10000,
			step: 10,
		},
		{
			key: 'ARTIFACT_DROP_RATE' as keyof GameSettings,
			label: 'Шанс выпадения артефакта',
			description:
				'Вероятность получения артефакта при исследовании (0.0 - 1.0)',
			icon: '⚡',
			type: 'number',
			min: 0,
			max: 1,
			step: 0.01,
		},
		{
			key: 'LEADERBOARD_LIMIT' as keyof GameSettings,
			label: 'Лимит таблицы лидеров',
			description: 'Максимальное количество игроков в таблице лидеров',
			icon: '🏆',
			type: 'number',
			min: 10,
			max: 1000,
			step: 10,
		},
	];

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<div className='bg-white shadow'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center py-6'>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								Настройки игры
							</h1>
							<p className='mt-1 text-sm text-gray-500'>
								Управление параметрами игры и экономики
							</p>
						</div>
						<div className='flex items-center space-x-4'>
							<span className='text-sm text-gray-700'>
								{user?.username}
							</span>
							<button
								onClick={logout}
								className='text-sm text-gray-700 hover:text-gray-900'>
								Выйти
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{message && (
					<div
						className={cn(
							'mb-6 p-4 rounded-md',
							message.includes('Ошибка')
								? 'bg-red-50 text-red-700'
								: 'bg-green-50 text-green-700'
						)}>
						{message}
					</div>
				)}

				<div className='bg-white shadow rounded-lg'>
					<div className='px-4 py-5 sm:p-6'>
						<div className='space-y-6'>
							{settingFields.map((field) => (
								<div
									key={field.key}
									className='flex items-start space-x-4'>
									<div className='flex-shrink-0'>
										<div className='inline-flex items-center justify-center p-2 rounded-md bg-primary-100 text-primary-600'>
											<span className='text-lg'>
												{field.icon}
											</span>
										</div>
									</div>
									<div className='flex-1 min-w-0'>
										<label
											htmlFor={field.key}
											className='block text-sm font-medium text-gray-700'>
											{field.label}
										</label>
										<p className='text-sm text-gray-500'>
											{field.description}
										</p>
										<div className='mt-2'>
											<input
												type={field.type}
												id={field.key}
												value={settings[field.key]}
												onChange={(e) => {
													const value =
														field.type === 'number'
															? parseFloat(
																	e.target
																		.value
															  )
															: e.target.value;
													setSettings((prev) => ({
														...prev,
														[field.key]: value,
													}));
												}}
												min={field.min}
												max={field.max}
												step={field.step}
												className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
											/>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className='mt-8 flex justify-end space-x-3'>
							<button
								onClick={handleReset}
								className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
								Сбросить
							</button>
							<button
								onClick={handleSave}
								disabled={saving}
								className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{saving ? (
									<div className='h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2' />
								) : (
									<span className='mr-2'>💾</span>
								)}
								Сохранить
							</button>
						</div>
					</div>
				</div>

				<div className='mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4'>
					<div className='flex'>
						<div className='flex-shrink-0'>
							<span className='text-yellow-400'>⚠️</span>
						</div>
						<div className='ml-3'>
							<h3 className='text-sm font-medium text-yellow-800'>
								Внимание
							</h3>
							<div className='mt-2 text-sm text-yellow-700'>
								<p>
									Изменение настроек игры может повлиять на
									игровой баланс и экономику. Убедитесь, что
									новые значения сбалансированы и
									протестированы.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
