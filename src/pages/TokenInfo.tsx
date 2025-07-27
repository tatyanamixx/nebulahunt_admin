import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TokenInfo {
	header: any;
	payload: any;
	signature: string;
	expiresAt: string;
	isExpired: boolean;
}

export default function TokenInfo() {
	const { user, refreshToken, logout } = useAuth();
	const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [message, setMessage] = useState('');

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 5000);
	};

	const parseToken = (token: string): TokenInfo | null => {
		try {
			const parts = token.split('.');
			if (parts.length !== 3) {
				return null;
			}

			const header = JSON.parse(atob(parts[0]));
			const payload = JSON.parse(atob(parts[1]));
			const signature = parts[2];

			const expiresAt = new Date(payload.exp * 1000).toLocaleString();
			const isExpired = payload.exp < Math.floor(Date.now() / 1000);

			return {
				header,
				payload,
				signature,
				expiresAt,
				isExpired,
			};
		} catch (error) {
			console.error('Token parsing error:', error);
			return null;
		}
	};

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			const info = parseToken(token);
			setTokenInfo(info);
		}
	}, []);

	const handleRefreshToken = async () => {
		setIsRefreshing(true);
		try {
			await refreshToken();
			const token = localStorage.getItem('accessToken');
			if (token) {
				const info = parseToken(token);
				setTokenInfo(info);
			}
			showMessage('Token refreshed successfully');
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.message ||
				'Token refresh failed';
			showMessage(message, true);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleLogout = () => {
		logout();
		showMessage('Logged out successfully');
	};

	if (!user) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-900'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-white mb-4'>
						Not Authenticated
					</h2>
					<p className='text-gray-400'>
						Please log in to view token information
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-900 py-8 px-4'>
			<div className='max-w-4xl mx-auto'>
				<div className='bg-gray-800 rounded-lg shadow-lg p-6'>
					<div className='flex justify-between items-center mb-6'>
						<h1 className='text-3xl font-bold text-white'>
							JWT Token Information
						</h1>
						<div className='space-x-4'>
							<button
								onClick={handleRefreshToken}
								disabled={isRefreshing}
								className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'>
								{isRefreshing
									? 'Refreshing...'
									: 'Refresh Token'}
							</button>
							<button
								onClick={handleLogout}
								className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'>
								Logout
							</button>
						</div>
					</div>

					{message && (
						<div
							className={`p-4 rounded-md mb-6 ${
								message.includes('error') ||
								message.includes('Error') ||
								message.includes('failed')
									? 'bg-red-900 text-red-200 border border-red-700'
									: 'bg-green-900 text-green-200 border border-green-700'
							}`}>
							{message}
						</div>
					)}

					{/* User Information */}
					<div className='bg-gray-700 rounded-lg p-4 mb-6'>
						<h2 className='text-xl font-semibold text-white mb-4'>
							User Information
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<p className='text-gray-400'>ID</p>
								<p className='text-white font-mono'>
									{user.id}
								</p>
							</div>
							<div>
								<p className='text-gray-400'>Email</p>
								<p className='text-white'>{user.email}</p>
							</div>
							<div>
								<p className='text-gray-400'>Role</p>
								<p className='text-white'>{user.role}</p>
							</div>
							<div>
								<p className='text-gray-400'>Provider</p>
								<p className='text-white'>{user.provider}</p>
							</div>
						</div>
					</div>

					{/* Token Information */}
					{tokenInfo && (
						<div className='space-y-6'>
							<div className='bg-gray-700 rounded-lg p-4'>
								<div className='flex items-center justify-between mb-4'>
									<h2 className='text-xl font-semibold text-white'>
										Token Status
									</h2>
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											tokenInfo.isExpired
												? 'bg-red-900 text-red-200'
												: 'bg-green-900 text-green-200'
										}`}>
										{tokenInfo.isExpired
											? 'Expired'
											: 'Valid'}
									</span>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<p className='text-gray-400'>
											Expires At
										</p>
										<p className='text-white'>
											{tokenInfo.expiresAt}
										</p>
									</div>
									<div>
										<p className='text-gray-400'>
											Algorithm
										</p>
										<p className='text-white'>
											{tokenInfo.header.alg}
										</p>
									</div>
								</div>
							</div>

							<div className='bg-gray-700 rounded-lg p-4'>
								<h2 className='text-xl font-semibold text-white mb-4'>
									Token Payload
								</h2>
								<pre className='bg-gray-800 p-4 rounded-md overflow-x-auto text-sm text-green-400'>
									{JSON.stringify(tokenInfo.payload, null, 2)}
								</pre>
							</div>

							<div className='bg-gray-700 rounded-lg p-4'>
								<h2 className='text-xl font-semibold text-white mb-4'>
									Token Header
								</h2>
								<pre className='bg-gray-800 p-4 rounded-md overflow-x-auto text-sm text-blue-400'>
									{JSON.stringify(tokenInfo.header, null, 2)}
								</pre>
							</div>

							<div className='bg-gray-700 rounded-lg p-4'>
								<h2 className='text-xl font-semibold text-white mb-4'>
									Token Signature
								</h2>
								<pre className='bg-gray-800 p-4 rounded-md overflow-x-auto text-sm text-yellow-400 break-all'>
									{tokenInfo.signature}
								</pre>
							</div>
						</div>
					)}

					{!tokenInfo && (
						<div className='text-center py-8'>
							<p className='text-gray-400'>
								No token information available
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
