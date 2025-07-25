import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { isDevelopment } from '../lib/env';
import { UserPlus, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Invite {
	id: string;
	email: string;
	name: string;
	role: 'ADMIN' | 'SUPERVISOR';
	status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
	createdAt: string;
	expiresAt: string;
}

export default function InviteInfo() {
	const [invites, setInvites] = useState<Invite[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchInvites();
	}, []);

	const fetchInvites = async () => {
		try {
			const response = await api.get('/admin/invites');
			setInvites(response.data);
		} catch (error: any) {
			console.error('Error fetching invites:', error);
			// Показываем сообщение об ошибке вместо тестовых данных
			// if (isDevelopment()) {
			// 	setInvites([
			// 		{
			// 			id: '1',
			// 			email: 'admin1@test.com',
			// 			name: 'Иван Иванов',
			// 			role: 'ADMIN',
			// 			status: 'PENDING',
			// 			createdAt: new Date().toISOString(),
			// 			expiresAt: new Date(
			// 				Date.now() + 7 * 24 * 60 * 60 * 1000
			// 			).toISOString(),
			// 		},
			// 		{
			// 			id: '2',
			// 			email: 'supervisor@test.com',
			// 			name: 'Петр Петров',
			// 			role: 'SUPERVISOR',
			// 			status: 'ACCEPTED',
			// 			createdAt: new Date(
			// 				Date.now() - 2 * 24 * 60 * 60 * 1000
			// 			).toISOString(),
			// 		},
			// 		{
			// 			id: '3',
			// 			email: 'admin2@test.com',
			// 			name: 'Анна Сидорова',
			// 			role: 'ADMIN',
			// 			status: 'EXPIRED',
			// 			createdAt: new Date(
			// 				Date.now() - 10 * 24 * 60 * 60 * 1000
			// 			).toISOString(),
			// 			expiresAt: new Date(
			// 				Date.now() - 3 * 24 * 60 * 60 * 1000
			// 			).toISOString(),
			// 		},
			// 	]);
			// }
		} finally {
			setLoading(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'PENDING':
				return <Clock className='h-4 w-4 text-yellow-500' />;
			case 'ACCEPTED':
				return <CheckCircle className='h-4 w-4 text-green-500' />;
			case 'EXPIRED':
				return <XCircle className='h-4 w-4 text-red-500' />;
			default:
				return <Clock className='h-4 w-4 text-gray-500' />;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'PENDING':
				return 'Ожидает';
			case 'ACCEPTED':
				return 'Принято';
			case 'EXPIRED':
				return 'Истекло';
			default:
				return 'Неизвестно';
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<div className='bg-white shadow rounded-lg p-6'>
				<div className='animate-pulse'>
					<div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
					<div className='space-y-3'>
						<div className='h-4 bg-gray-200 rounded'></div>
						<div className='h-4 bg-gray-200 rounded'></div>
						<div className='h-4 bg-gray-200 rounded'></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-white shadow rounded-lg'>
			<div className='px-4 py-5 sm:p-6'>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-lg leading-6 font-medium text-gray-900 flex items-center'>
						<UserPlus className='h-5 w-5 mr-2' />
						Приглашения администраторов
					</h3>
					<span className='text-sm text-gray-500'>
						{invites.length} приглашений
					</span>
				</div>

				{invites.length === 0 ? (
					<div className='text-center py-8'>
						<Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-500'>
							Нет активных приглашений
						</p>
					</div>
				) : (
					<div className='overflow-hidden'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Администратор
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Роль
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Статус
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Создано
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Истекает
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{invites.map((invite) => (
									<tr
										key={invite.id}
										className='hover:bg-gray-50'>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div>
												<div className='text-sm font-medium text-gray-900'>
													{invite.name}
												</div>
												<div className='text-sm text-gray-500'>
													{invite.email}
												</div>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													invite.role === 'SUPERVISOR'
														? 'bg-purple-100 text-purple-800'
														: 'bg-blue-100 text-blue-800'
												}`}>
												{invite.role === 'SUPERVISOR'
													? 'Супервайзер'
													: 'Администратор'}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												{getStatusIcon(invite.status)}
												<span className='ml-2 text-sm text-gray-900'>
													{getStatusText(
														invite.status
													)}
												</span>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{formatDate(invite.createdAt)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{formatDate(invite.expiresAt)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
