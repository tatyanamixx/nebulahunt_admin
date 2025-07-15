import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Users, Star, Gem, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { formatNumber } from '../lib/utils';

interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	totalStardust: number;
	totalDarkMatter: number;
	totalGalaxies: number;
	totalArtifacts: number;
}

export default function Dashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await api.get('/admin/stats');
				setStats(response.data);
			} catch (error) {
				console.error('Error fetching stats:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-primary-600' />
			</div>
		);
	}

	const statCards = [
		{
			name: 'Всего пользователей',
			value: formatNumber(stats?.totalUsers || 0),
			icon: Users,
			color: 'bg-blue-500',
		},
		{
			name: 'Активных пользователей',
			value: formatNumber(stats?.activeUsers || 0),
			icon: Activity,
			color: 'bg-green-500',
		},
		{
			name: 'Всего Stardust',
			value: formatNumber(stats?.totalStardust || 0),
			icon: Star,
			color: 'bg-yellow-500',
		},
		{
			name: 'Всего Dark Matter',
			value: formatNumber(stats?.totalDarkMatter || 0),
			icon: Gem,
			color: 'bg-purple-500',
		},
		{
			name: 'Всего галактик',
			value: formatNumber(stats?.totalGalaxies || 0),
			icon: TrendingUp,
			color: 'bg-indigo-500',
		},
		{
			name: 'Всего артефактов',
			value: formatNumber(stats?.totalArtifacts || 0),
			icon: Star,
			color: 'bg-red-500',
		},
	];

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-gray-900'>
					Панель управления
				</h1>
				<p className='mt-1 text-sm text-gray-500'>
					Обзор статистики и ключевых показателей системы
				</p>
			</div>

			<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
				{statCards.map((stat) => (
					<div
						key={stat.name}
						className='bg-white overflow-hidden shadow rounded-lg'>
						<div className='p-5'>
							<div className='flex items-center'>
								<div className='flex-shrink-0'>
									<div
										className={`inline-flex items-center justify-center p-3 rounded-md ${stat.color} text-white`}>
										<stat.icon className='h-6 w-6' />
									</div>
								</div>
								<div className='ml-5 w-0 flex-1'>
									<dl>
										<dt className='text-sm font-medium text-gray-500 truncate'>
											{stat.name}
										</dt>
										<dd className='text-lg font-medium text-gray-900'>
											{stat.value}
										</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className='bg-white shadow rounded-lg'>
				<div className='px-4 py-5 sm:p-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Быстрые действия
					</h3>
					<div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						<button className='relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300'>
							<div>
								<span className='rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white'>
									<Users className='h-6 w-6' />
								</span>
							</div>
							<div className='mt-8'>
								<h3 className='text-lg font-medium'>
									<span
										className='absolute inset-0'
										aria-hidden='true'
									/>
									Управление пользователями
								</h3>
								<p className='mt-2 text-sm text-gray-500'>
									Просмотр, блокировка и управление
									пользователями системы
								</p>
							</div>
						</button>

						<button className='relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300'>
							<div>
								<span className='rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white'>
									<Activity className='h-6 w-6' />
								</span>
							</div>
							<div className='mt-8'>
								<h3 className='text-lg font-medium'>
									<span
										className='absolute inset-0'
										aria-hidden='true'
									/>
									Настройки игры
								</h3>
								<p className='mt-2 text-sm text-gray-500'>
									Изменение параметров игры и экономики
								</p>
							</div>
						</button>

						<button className='relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300'>
							<div>
								<span className='rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white'>
									<TrendingUp className='h-6 w-6' />
								</span>
							</div>
							<div className='mt-8'>
								<h3 className='text-lg font-medium'>
									<span
										className='absolute inset-0'
										aria-hidden='true'
									/>
									Аналитика
								</h3>
								<p className='mt-2 text-sm text-gray-500'>
									Просмотр статистики и аналитических данных
								</p>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
