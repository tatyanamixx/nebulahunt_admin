import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { isDevelopment } from '../lib/env';
import { UserPlus, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			fetchInvites();
		} else {
			setLoading(false);
		}
	}, [isAuthenticated]);

	const fetchInvites = async () => {
		try {
			const response = await api.get('/admin/invites');
			setInvites(response.data);
		} catch (error: any) {
			console.error('Error fetching invites:', error);
			// Show error message instead of test data
			// if (isDevelopment()) {
			// 	setInvites([
			// 		{
			// 			id: '1',
			// 			email: 'admin1@test.com',
			// 			name: 'John Doe',
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
			// 			name: 'Jane Smith',
			// 			role: 'SUPERVISOR',
			// 			status: 'ACCEPTED',
			// 			createdAt: new Date(
			// 				Date.now() - 2 * 24 * 60 * 60 * 1000
			// 			).toISOString(),
			// 		},
			// 		{
			// 			id: '3',
			// 			email: 'admin2@test.com',
			// 			name: 'Bob Johnson',
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
				return 'Pending';
			case 'ACCEPTED':
				return 'Accepted';
			case 'EXPIRED':
				return 'Expired';
			default:
				return 'Unknown';
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) {
			return 'N/A';
		}
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return 'Invalid Date';
		}
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Компонент включен для отображения приглашений

	if (loading) {
		return (
			<div className='bg-gray-800 shadow rounded-lg p-6 border border-gray-700'>
				<div className='animate-pulse'>
					<div className='h-4 bg-gray-700 rounded w-1/4 mb-4'></div>
					<div className='space-y-3'>
						<div className='h-4 bg-gray-700 rounded'></div>
						<div className='h-4 bg-gray-700 rounded'></div>
						<div className='h-4 bg-gray-700 rounded'></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-gray-800 shadow rounded-lg border border-gray-700'>
			<div className='px-4 py-5 sm:p-6'>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-lg leading-6 font-medium text-white flex items-center'>
						<UserPlus className='h-5 w-5 mr-2' />
						Administrator Invitations
					</h3>
					<span className='text-sm text-gray-400'>
						{invites.length} invitations
					</span>
				</div>

				{invites.length === 0 ? (
					<div className='text-center py-8'>
						<Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-400'>No active invitations</p>
					</div>
				) : (
					<div className='overflow-hidden'>
						<table className='min-w-full divide-y divide-gray-700'>
							<thead className='bg-gray-700'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
										Administrator
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
										Role
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
										Status
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
										Created
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
										Expires
									</th>
								</tr>
							</thead>
							<tbody className='bg-gray-800 divide-y divide-gray-700'>
								{invites.map((invite) => (
									<tr
										key={invite.id}
										className='hover:bg-gray-700'>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div>
												<div className='text-sm font-medium text-white'>
													{invite.name}
												</div>
												<div className='text-sm text-gray-400'>
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
													? 'Supervisor'
													: 'Administrator'}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												{getStatusIcon(invite.status)}
												<span className='ml-2 text-sm text-white'>
													{getStatusText(
														invite.status
													)}
												</span>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400'>
											{formatDate(invite.createdAt)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400'>
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
