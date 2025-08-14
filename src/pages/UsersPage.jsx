import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import {
	Users as UsersIcon,
	UserCheck,
	UserX,
	Search,
	Filter,
	RefreshCw,
	Eye,
	EyeOff,
	Shield,
	Calendar,
	Wallet,
} from 'lucide-react';
import { TokenDebugger } from '../components/TokenDebugger.jsx';

export default function UsersPage() {
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRole, setFilterRole] = useState('ALL');
	const [filterStatus, setFilterStatus] = useState('ALL');
	const [showUserDetails, setShowUserDetails] = useState(null);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('success');

	useEffect(() => {
		if (isAuthenticated) {
			fetchUsers();
		}
	}, [isAuthenticated]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await api.get('/admin-users/users');
			setUsers(response.data || []);
		} catch (error) {
			console.error('Error fetching users:', error);
			// Don't show error message for auth errors, let AuthContext handle them
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
			await api.patch(`/admin-users/users/${userId}/block`, {
				blocked: !blocked,
			});

			// Update local state
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user.id === userId ? { ...user, blocked: !blocked } : user
				)
			);

			showMessage(
				`User ${blocked ? 'unblocked' : 'blocked'} successfully`,
				'success'
			);
		} catch (error) {
			console.error('Error toggling user block:', error);
			// Don't show error message for auth errors, let AuthContext handle them
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
		return new Date(dateString).toLocaleDateString();
	};

	const formatNumber = (num) => {
		return new Intl.NumberFormat().format(num);
	};

	// Filter users based on search and filters
	const filteredUsers = users.filter((user) => {
		const matchesSearch = user.username
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesRole = filterRole === 'ALL' || user.role === filterRole;
		const matchesStatus =
			filterStatus === 'ALL' ||
			(filterStatus === 'ACTIVE' && !user.blocked) ||
			(filterStatus === 'BLOCKED' && user.blocked);

		return matchesSearch && matchesRole && matchesStatus;
	});

	// Show loading while authentication is being checked
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
		<div className='space-y-6'>
			<TokenDebugger />

			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-white'>
						User Manager
					</h1>
					<p className='text-gray-400'>
						Manage game users and their accounts
					</p>
				</div>
				<button
					onClick={fetchUsers}
					disabled={loading}
					className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50'>
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

			{/* Filters */}
			<div className='bg-gray-800 rounded-lg p-4'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					{/* Search */}
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<input
							type='text'
							placeholder='Search users...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
					</div>

					{/* Role Filter */}
					<div>
						<select
							value={filterRole}
							onChange={(e) =>
								setFilterRole(
									e.target.value
								)
							}
							className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							aria-label='Filter by role'>
							<option value='ALL'>All Roles</option>
							<option value='USER'>Users</option>
							<option value='SYSTEM'>System</option>
						</select>
					</div>

					{/* Status Filter */}
					<div>
						<select
							value={filterStatus}
							onChange={(e) =>
								setFilterStatus(
									e.target.value
								)
							}
							className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
							aria-label='Filter by status'>
							<option value='ALL'>All Status</option>
							<option value='ACTIVE'>Active</option>
							<option value='BLOCKED'>Blocked</option>
						</select>
					</div>

					{/* Results Count */}
					<div className='flex items-center justify-end text-gray-400'>
						{loading
							? 'Loading...'
							: `${filteredUsers.length} users`}
					</div>
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
						<p className='text-sm'>
							Try adjusting your search or filters
						</p>
					</div>
				) : (
					<div className='divide-y divide-gray-700'>
						{filteredUsers.map((user) => (
							<div
								key={user.id}
								className='p-6 hover:bg-gray-750 transition-colors'>
								<div className='flex items-center justify-between'>
									{/* User Info */}
									<div className='flex-1'>
										<div className='flex items-center space-x-3 mb-2'>
											<div className='flex items-center space-x-2'>
												<h3 className='text-lg font-medium text-white'>
													{user.username}
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
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
											{/* Basic Info */}
											<div>
												<p className='text-gray-400'>
													🆔 ID: {user.id}
												</p>
												{user.tonWallet && (
													<p className='text-gray-400'>
														<Wallet className='h-3 w-3 inline mr-1' />
														Wallet:{' '}
														{user.tonWallet.substring(
															0,
															8
														)}
														...
													</p>
												)}
												{user.referral && (
													<p className='text-gray-400'>
														👥 Referral:{' '}
														{user.referral}
													</p>
												)}
											</div>

											{/* Activity */}
											<div>
												{user.userState && (
													<>
														<p className='text-gray-400'>
															🔥 Streak:{' '}
															{
																user.userState
																	.currentStreak
															}
															/
															{
																user.userState
																	.maxStreak
															}
														</p>
														<p className='text-gray-400'>
															📅 Last Login:{' '}
															{formatDate(
																user.userState
																	.lastLoginDate
															)}
														</p>
													</>
												)}
												{user.createdAt && (
													<p className='text-gray-400'>
														<Calendar className='h-3 w-3 inline mr-1' />
														Created:{' '}
														{formatDate(
															user.createdAt
														)}
													</p>
												)}
											</div>
										</div>

										{/* Chaos/Stability Levels */}
										{user.userState && (
											<div className='mt-3 grid grid-cols-3 gap-4 text-xs'>
												<div>
													<p className='text-gray-400'>
														Chaos:{' '}
														{user.userState.chaosLevel.toFixed(
															2
														)}
													</p>
												</div>
												<div>
													<p className='text-gray-400'>
														Stability:{' '}
														{user.userState.stabilityLevel.toFixed(
															2
														)}
													</p>
												</div>
												<div>
													<p className='text-gray-400'>
														Entropy:{' '}
														{user.userState.entropyVelocity.toFixed(
															2
														)}
													</p>
												</div>
											</div>
										)}
									</div>

									{/* Actions */}
									<div className='flex items-center space-x-2 ml-4'>
										<button
											onClick={() =>
												toggleUserBlock(
													user.id,
													user.blocked
												)
											}
											className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
