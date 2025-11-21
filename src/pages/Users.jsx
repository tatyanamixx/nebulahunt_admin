import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import {
	Users as UsersIcon,
	UserCheck,
	UserX,
	Search,
	RefreshCw,
	Calendar,
	Wallet,
	User,
	RefreshCw as RefreshIcon,
	Hash,
	Star,
	Gem,
	Zap,
} from 'lucide-react';

export default function Users() {
	const navigate = useNavigate();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('success');

	useEffect(() => {
		if (isAuthenticated) {
			fetchUsers();
		}
	}, [isAuthenticated]);

	const fetchUsers = async () => {
		try {
			console.log('🔍 Fetching users...');
			setLoading(true);
			const response = await api.get('/admin-users/users');
			console.log('🔍 Users response:', response.data);
			console.log('🔍 Users data:', response.data?.data);
			console.log('🔍 Users count:', response.data?.count);

			// Extract users from the new response structure
			const users = response.data?.data || [];
			console.log('🔍 Users array:', users);

			setUsers(users);
		} catch (error) {
			console.error('❌ Error fetching users:', error);
			console.error('❌ Error details:', {
				status: error.response?.status,
				statusText: error.response?.statusText,
				data: error.response?.data,
			});
			if (
				error.response?.status !== 401 &&
				error.response?.status !== 403
			) {
				showMessage('Failed to fetch users', 'error');
			}
		} finally {
			setLoading(false);
		}
	};

	const toggleUserBlock = async (userId, blocked) => {
		try {
			console.log('🔍 Toggling user block:', {
				userId,
				blocked,
				newBlocked: !blocked,
			});
			const response = await api.patch(
				`/admin-users/users/${userId}/block`,
				{
					blocked: !blocked,
				}
			);
			console.log('🔍 Block toggle response:', response.data);

			// Update local state with the returned user data
			if (response.data?.success && response.data?.data) {
				setUsers((prevUsers) =>
					prevUsers.map((user) =>
						user.id === userId ? response.data.data : user
					)
				);
			} else {
				// Fallback to simple toggle if no data returned
				setUsers((prevUsers) =>
					prevUsers.map((user) =>
						user.id === userId
							? { ...user, blocked: !blocked }
							: user
					)
				);
			}

			showMessage(
				`User ${blocked ? 'unblocked' : 'blocked'} successfully`,
				'success'
			);
		} catch (error) {
			console.error('❌ Error toggling user block:', error);
			console.error('❌ Error details:', {
				status: error.response?.status,
				statusText: error.response?.statusText,
				data: error.response?.data,
			});
			if (
				error.response?.status !== 401 &&
				error.response?.status !== 403
			) {
				showMessage(
					`Failed to ${blocked ? 'unblock' : 'block'} user`,
					'error'
				);
			}
		}
	};

	const showMessage = (text, type) => {
		setMessage(text);
		setMessageType(type);
		setTimeout(() => setMessage(''), 5000);
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';

		try {
			const date = new Date(dateString);
			// Check if the date is valid
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
		} catch (error) {
			console.error('Error formatting date:', dateString, error);
			return 'Invalid Date';
		}
	};

	const formatLastLogin = (dateString) => {
		if (!dateString) return 'Never';

		try {
			const date = new Date(dateString);
			// Check if the date is valid
			if (isNaN(date.getTime())) {
				return 'Never';
			}
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		} catch (error) {
			console.error(
				'Error formatting last login date:',
				dateString,
				error
			);
			return 'Never';
		}
	};

	console.log('🔍 Current users state:', users);
	console.log('🔍 Current search term:', searchTerm);

	const filteredUsers = users.filter((user) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			user.username?.toLowerCase().includes(searchLower) ||
			user.id?.toString().includes(searchLower) ||
			user.tonWallet?.toLowerCase().includes(searchLower) ||
			user.role?.toLowerCase().includes(searchLower)
		);
	});

	console.log('🔍 Filtered users:', filteredUsers);

	if (authLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				<span className='ml-2 text-white'>Loading...</span>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='space-y-4 sm:space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-xl sm:text-2xl font-bold text-white'>
						User Manager
					</h1>
					<p className='text-xs sm:text-sm text-gray-400'>
						Manage game users and their accounts
					</p>
				</div>
				<button
					onClick={fetchUsers}
					disabled={loading}
					className='inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 text-sm'>
					<RefreshCw
						className={`h-4 w-4 mr-2 ${
							loading ? 'animate-spin' : ''
						}`}
					/>
					Refresh
				</button>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`p-4 rounded-md ${
						messageType === 'success'
							? 'bg-green-600 text-white'
							: 'bg-red-600 text-white'
					}`}>
					{message}
				</div>
			)}

			{/* Search */}
			<div className='bg-gray-800 rounded-lg p-3 sm:p-4'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
					<input
						type='text'
						placeholder='Search users...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
					/>
				</div>
			</div>

			{/* Users List */}
			<div className='bg-gray-800 rounded-lg'>
				{loading ? (
					<div className='flex items-center justify-center p-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
						<span className='ml-2 text-white'>
							Loading users...
						</span>
					</div>
				) : filteredUsers.length === 0 ? (
					<div className='flex flex-col items-center justify-center p-8 text-gray-400'>
						<UsersIcon className='h-12 w-12 text-gray-500 mx-auto mb-4' />
						<p className='text-lg font-medium'>No users found</p>
						<p className='text-sm'>Try adjusting your search</p>
					</div>
				) : (
					<div className='divide-y divide-gray-700'>
						{filteredUsers.map((user) => (
							<div
								key={user.id}
								className='p-4 sm:p-6 hover:bg-gray-750 transition-colors'>
								<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
									{/* User Info */}
									<div className='flex-1 min-w-0'>
										<div className='flex flex-wrap items-center gap-2 sm:gap-3 mb-2'>
											<div className='flex flex-wrap items-center gap-2'>
												<h3 className='text-base sm:text-lg font-medium text-white break-words'>
													{user.username ||
														'Unknown User'}
												</h3>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														user.role === 'SYSTEM'
															? 'bg-purple-100 text-purple-800'
															: 'bg-blue-100 text-blue-800'
													}`}>
													{user.role}
												</span>
												{user.blocked && (
													<span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
														BLOCKED
													</span>
												)}
											</div>
										</div>

										{/* User Details */}
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm'>
											<div className='space-y-2'>
												<div className='flex items-center text-gray-400'>
													<Hash className='h-4 w-4 mr-2 flex-shrink-0' />
													<span>ID: {user.id}</span>
												</div>
												{user.tonWallet && (
													<div className='flex items-center text-gray-400'>
														<Wallet className='h-4 w-4 mr-2 flex-shrink-0' />
														<span>
															Wallet:{' '}
															{user.tonWallet.substring(
																0,
																8
															)}
															...
														</span>
													</div>
												)}
												<div className='flex items-center text-gray-400'>
													<UsersIcon className='h-4 w-4 mr-2 flex-shrink-0' />
													<span>
														Referrals:{' '}
														{user.referralsCount || 0}
													</span>
												</div>
												{user.referral && user.referral !== 0 && (
													<div className='flex items-center text-gray-400 text-xs'>
														<span>
															Invited by: {user.referral}
														</span>
													</div>
												)}
												{user.userState && (
													<div className='mt-3 space-y-1'>
														<div className='flex items-center text-gray-400 text-xs'>
															<Star className='h-3 w-3 mr-2 flex-shrink-0' />
															<span>
																Stars:{' '}
																{user.userState.stars.toLocaleString()}
															</span>
														</div>
														<div className='flex items-center text-gray-400 text-xs'>
															<Gem className='h-3 w-3 mr-2 flex-shrink-0' />
															<span>
																Stardust:{' '}
																{user.userState.stardust.toLocaleString()}
															</span>
														</div>
														<div className='flex items-center text-gray-400 text-xs'>
															<Zap className='h-3 w-3 mr-2 flex-shrink-0' />
															<span>
																Dark Matter:{' '}
																{user.userState.darkMatter.toLocaleString()}
															</span>
														</div>
													</div>
												)}
											</div>
											<div className='space-y-2'>
												{user.createdAt && (
													<div className='flex items-center text-gray-400'>
														<Calendar className='h-4 w-4 mr-2 flex-shrink-0' />
														<span>
															Created:{' '}
															{formatDate(
																user.createdAt
															)}
														</span>
													</div>
												)}
												{user.lastLoginAt && (
													<div className='flex items-center text-gray-400'>
														<User className='h-4 w-4 mr-2 flex-shrink-0' />
														<span>
															Last Login:{' '}
															{formatLastLogin(
																user.lastLoginAt
															)}
														</span>
													</div>
												)}
												{user.updatedAt && (
													<div className='flex items-center text-gray-400'>
														<RefreshIcon className='h-4 w-4 mr-2 flex-shrink-0' />
														<span>
															Updated:{' '}
															{formatDate(
																user.updatedAt
															)}
														</span>
													</div>
												)}
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className='flex items-center justify-start sm:justify-end space-x-2 sm:ml-4'>
										<button
											onClick={() => navigate(`/users/${user.id}`)}
											className='inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white'>
											<User className='h-4 w-4 mr-1' />
											View Details
										</button>
										<button
											onClick={() =>
												toggleUserBlock(
													user.id,
													user.blocked
												)
											}
											className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
												user.blocked
													? 'bg-green-600 hover:bg-green-700 text-white'
													: 'bg-red-600 hover:bg-red-700 text-white'
											}`}>
											{user.blocked ? (
												<UserCheck className='h-4 w-4 mr-1' />
											) : (
												<UserX className='h-4 w-4 mr-1' />
											)}
											{user.blocked ? 'Unblock' : 'Block'}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
