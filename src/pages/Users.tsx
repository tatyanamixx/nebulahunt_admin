import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
	Users as UsersIcon,
	UserCheck,
	UserX,
	Search,
	Loader2,
	Shield,
	ShieldOff,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

interface User {
	id: number;
	username: string;
	role: string;
	blocked: boolean;
	referral?: string;
	createdAt: string;
}

export default function Users() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRole, setFilterRole] = useState('all');
	const [filterBlocked, setFilterBlocked] = useState('all');

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const response = await api.get('/admin/users');
			setUsers(response.data);
		} catch (error) {
			toast.error('Ошибка загрузки пользователей');
		} finally {
			setLoading(false);
		}
	};

	const handleBlockUser = async (userId: number) => {
		try {
			await api.post(`/admin/users/${userId}/block`);
			setUsers(
				users.map((user) =>
					user.id === userId ? { ...user, blocked: true } : user
				)
			);
			toast.success('Пользователь заблокирован');
		} catch (error) {
			toast.error('Ошибка блокировки пользователя');
		}
	};

	const handleUnblockUser = async (userId: number) => {
		try {
			await api.post(`/admin/users/${userId}/unblock`);
			setUsers(
				users.map((user) =>
					user.id === userId ? { ...user, blocked: false } : user
				)
			);
			toast.success('Пользователь разблокирован');
		} catch (error) {
			toast.error('Ошибка разблокировки пользователя');
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch = user.username
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesRole = filterRole === 'all' || user.role === filterRole;
		const matchesBlocked =
			filterBlocked === 'all' ||
			(filterBlocked === 'blocked' && user.blocked) ||
			(filterBlocked === 'active' && !user.blocked);

		return matchesSearch && matchesRole && matchesBlocked;
	});

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-primary-600' />
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-gray-900'>
					Управление пользователями
				</h1>
				<p className='mt-1 text-sm text-gray-500'>
					Просмотр и управление пользователями системы
				</p>
			</div>

			{/* Filters */}
			<div className='bg-white shadow rounded-lg p-6'>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
					<div>
						<label
							htmlFor='search'
							className='block text-sm font-medium text-gray-700'>
							Поиск
						</label>
						<div className='mt-1 relative'>
							<input
								type='text'
								id='search'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
								placeholder='Поиск по имени...'
							/>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<Search className='h-5 w-5 text-gray-400' />
							</div>
						</div>
					</div>

					<div>
						<label
							htmlFor='role'
							className='block text-sm font-medium text-gray-700'>
							Роль
						</label>
						<select
							id='role'
							value={filterRole}
							onChange={(e) => setFilterRole(e.target.value)}
							className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'>
							<option value='all'>Все роли</option>
							<option value='USER'>Пользователь</option>
							<option value='ADMIN'>Администратор</option>
						</select>
					</div>

					<div>
						<label
							htmlFor='status'
							className='block text-sm font-medium text-gray-700'>
							Статус
						</label>
						<select
							id='status'
							value={filterBlocked}
							onChange={(e) => setFilterBlocked(e.target.value)}
							className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'>
							<option value='all'>Все</option>
							<option value='active'>Активные</option>
							<option value='blocked'>Заблокированные</option>
						</select>
					</div>

					<div className='flex items-end'>
						<button
							onClick={fetchUsers}
							className='w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'>
							Обновить
						</button>
					</div>
				</div>
			</div>

			{/* Users table */}
			<div className='bg-white shadow overflow-hidden sm:rounded-md'>
				<ul className='divide-y divide-gray-200'>
					{filteredUsers.map((user) => (
						<li key={user.id}>
							<div className='px-4 py-4 sm:px-6'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<div className='flex-shrink-0'>
											<div className='h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center'>
												<span className='text-primary-600 font-medium'>
													{user.username
														.charAt(0)
														.toUpperCase()}
												</span>
											</div>
										</div>
										<div className='ml-4'>
											<div className='flex items-center'>
												<p className='text-sm font-medium text-gray-900'>
													{user.username}
												</p>
												{user.role === 'ADMIN' && (
													<Shield className='ml-2 h-4 w-4 text-yellow-500' />
												)}
												{user.blocked && (
													<ShieldOff className='ml-2 h-4 w-4 text-red-500' />
												)}
											</div>
											<div className='flex items-center text-sm text-gray-500'>
												<span>ID: {user.id}</span>
												{user.referral && (
													<>
														<span className='mx-2'>
															•
														</span>
														<span>
															Реферал:{' '}
															{user.referral}
														</span>
													</>
												)}
											</div>
											<p className='text-sm text-gray-500'>
												Зарегистрирован:{' '}
												{formatDate(user.createdAt)}
											</p>
										</div>
									</div>
									<div className='flex items-center space-x-2'>
										{user.blocked ? (
											<button
												onClick={() =>
													handleUnblockUser(user.id)
												}
												className='inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
												<UserCheck className='h-4 w-4 mr-1' />
												Разблокировать
											</button>
										) : (
											<button
												onClick={() =>
													handleBlockUser(user.id)
												}
												className='inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
												<UserX className='h-4 w-4 mr-1' />
												Заблокировать
											</button>
										)}
									</div>
								</div>
							</div>
						</li>
					))}
				</ul>
			</div>

			{filteredUsers.length === 0 && (
				<div className='text-center py-12'>
					<UsersIcon className='mx-auto h-12 w-12 text-gray-400' />
					<h3 className='mt-2 text-sm font-medium text-gray-900'>
						Пользователи не найдены
					</h3>
					<p className='mt-1 text-sm text-gray-500'>
						Попробуйте изменить параметры поиска или фильтры.
					</p>
				</div>
			)}
		</div>
	);
}
