import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { cn } from '../lib/utils.js';
import ForceChangePassword from '../components/ForceChangePassword.jsx';

export default function Settings() {
	const { user, logout } = useAuth();
	const [activeTab, setActiveTab] = useState('game');
	const [settings, setSettings] = useState({
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

	const showMessage = (text, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 3000);
	};

	const fetchSettings = async () => {
		try {
			const response = await api.get('/admin/settings');
			setSettings(response.data);
		} catch (error) {
			showMessage('Error loading settings', true);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await api.put('/admin/settings', settings);
			showMessage('Settings saved');
		} catch (error) {
			showMessage('Error saving settings', true);
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
		showMessage('Settings reset to default values');
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='h-8 w-8 animate-spin border-2 border-blue-400 border-t-transparent rounded-full' />
			</div>
		);
	}

	const settingFields = [
		{
			key: 'DAILY_BONUS_STARDUST',
			label: 'Daily Stardust Bonus',
			description: 'Amount of Stardust given for daily login',
			icon: '⭐',
			type: 'number',
			min: 0,
			max: 1000,
			step: 1,
		},
		{
			key: 'DAILY_BONUS_DARK_MATTER',
			label: 'Daily Dark Matter Bonus',
			description: 'Amount of Dark Matter given for daily login',
			icon: '💎',
			type: 'number',
			min: 0,
			max: 100,
			step: 1,
		},
		{
			key: 'GALAXY_BASE_PRICE',
			label: 'Galaxy Base Price',
			description: 'Cost to purchase a new galaxy in Stardust',
			icon: '🌌',
			type: 'number',
			min: 10,
			max: 10000,
			step: 10,
		},
		{
			key: 'ARTIFACT_DROP_RATE',
			label: 'Artifact Drop Rate',
			description:
				'Probability of getting an artifact when exploring (0.0 - 1.0)',
			icon: '⚡',
			type: 'number',
			min: 0,
			max: 1,
			step: 0.01,
		},
		{
			key: 'LEADERBOARD_LIMIT',
			label: 'Leaderboard Limit',
			description: 'Maximum number of players in leaderboard',
			icon: '🏆',
			type: 'number',
			min: 10,
			max: 1000,
			step: 10,
		},
	];

	return (
		<div className='min-h-screen bg-gray-900'>
			{/* Header */}
			<div className='bg-gray-800 shadow border-b border-gray-700'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center py-6'>
						<div>
							<h1 className='text-2xl font-bold text-white'>
								Настройки
							</h1>
							<p className='mt-1 text-sm text-gray-400'>
								Управление настройками игры и безопасности
							</p>
						</div>
						<div className='flex items-center space-x-4'>
							<span className='text-sm text-gray-300'>
								{user?.username}
							</span>
							<button
								onClick={logout}
								className='text-sm text-gray-300 hover:text-white'>
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
							message.includes('Error')
								? 'bg-red-900 text-red-200 border border-red-700'
								: 'bg-green-900 text-green-200 border border-green-700'
						)}>
						{message}
					</div>
				)}

				{/* Tabs */}
				<div className='mb-4 sm:mb-6 border-b border-gray-700 overflow-x-auto'>
					<nav className='-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide' style={{ WebkitOverflowScrolling: 'touch' }}>
						<button
							onClick={() => setActiveTab('game')}
							className={cn(
								'py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0',
								activeTab === 'game'
									? 'border-blue-500 text-blue-400'
									: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
							)}>
							<span className="hidden sm:inline">🎮 Настройки игры</span>
							<span className="sm:hidden">🎮 Игра</span>
						</button>

						{user?.role === 'SUPERVISOR' && (
							<button
								onClick={() => setActiveTab('force-password')}
								className={cn(
									'py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0',
									activeTab === 'force-password'
										? 'border-blue-500 text-blue-400'
										: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
								)}>
								<span className="hidden sm:inline">🔧 Принудительная смена</span>
								<span className="sm:hidden">🔧 Смена</span>
							</button>
						)}
					</nav>
				</div>

				{/* Game Settings Tab */}
				{activeTab === 'game' && (
					<>
						<div className='bg-gray-800 shadow rounded-lg border border-gray-700'>
							<div className='px-4 py-4 sm:py-5 sm:p-6'>
								<div className='space-y-4 sm:space-y-6'>
									{settingFields.map((field) => (
										<div
											key={field.key}
											className='flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4'>
											<div className='flex-shrink-0'>
												<div className='inline-flex items-center justify-center p-2 rounded-md bg-blue-100 text-blue-600'>
													<span className='text-base sm:text-lg'>
														{field.icon}
													</span>
												</div>
											</div>
											<div className='flex-1 min-w-0'>
												<label
													htmlFor={field.key}
													className='block text-xs sm:text-sm font-medium text-gray-300'>
													{field.label}
												</label>
												<p className='text-xs sm:text-sm text-gray-400 mt-1'>
													{field.description}
												</p>
												<div className='mt-2'>
													<input
														type={field.type}
														id={field.key}
														value={
															settings[field.key]
														}
														onChange={(e) => {
															const value =
																field.type ===
																'number'
																	? parseFloat(
																			e
																				.target
																				.value
																	  )
																	: e.target
																			.value;
															setSettings(
																(prev) => ({
																	...prev,
																	[field.key]:
																		value,
																})
															);
														}}
														min={field.min}
														max={field.max}
														step={field.step}
														className='block w-full border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm'
													/>
												</div>
											</div>
										</div>
									))}
								</div>

								<div className='mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3'>
									<button
										onClick={handleReset}
										className='px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800'>
										Сбросить
									</button>
									<button
										onClick={handleSave}
										disabled={saving}
										className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'>
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
						<div className='mt-6 bg-yellow-900 border border-yellow-700 rounded-md p-4'>
							<div className='flex'>
								<div className='flex-shrink-0'>
									<span className='text-yellow-400'>⚠️</span>
								</div>
								<div className='ml-3'>
									<h3 className='text-sm font-medium text-yellow-200'>
										Предупреждение
									</h3>
									<div className='mt-2 text-sm text-yellow-300'>
										<p>
											Изменение настроек игры может
											повлиять на баланс и экономику.
											Убедитесь, что новые значения
											сбалансированы и протестированы.
										</p>
									</div>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Force Password Change Tab */}
				{activeTab === 'force-password' && (
					<div className='bg-gray-800 shadow rounded-lg border border-gray-700'>
						<div className='px-4 py-5 sm:p-6'>
							<ForceChangePassword />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
