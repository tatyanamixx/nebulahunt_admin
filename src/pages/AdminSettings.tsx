import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function AdminSettings() {
	const { user, isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [qrCode, setQrCode] = useState('');
	const [google2faSecret, setGoogle2faSecret] = useState('');
	const [otp, setOtp] = useState('');
	const [show2FASetup, setShow2FASetup] = useState(false);
	const [show2FAInfo, setShow2FAInfo] = useState(false);
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);

	// Password change states
	const [showPasswordChange, setShowPasswordChange] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordInfo, setPasswordInfo] = useState<any>(null);

	// Password visibility states
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordMismatch, setPasswordMismatch] = useState(false);
	const [hasCyrillic, setHasCyrillic] = useState(false);

	// Admin invitation states
	const [showInviteForm, setShowInviteForm] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteName, setInviteName] = useState('');
	const [inviteRole, setInviteRole] = useState('ADMIN');
	const [invites, setInvites] = useState([]);

	// Check 2FA status on component mount
	useEffect(() => {
		const check2FAStatus = async () => {
			try {
				const response = await api.get('/admin/2fa/info');
				setIs2FAEnabled(response.data.is2FAEnabled);
			} catch (error: any) {
				// If 2FA info is not available, it means 2FA is not enabled
				setIs2FAEnabled(false);
			}
		};

		if (isAuthenticated && user) {
			check2FAStatus();
			fetchPasswordInfo();
			fetchInvites();
		}
	}, [isAuthenticated, user]);

	// Don't show component if user is not authenticated
	if (!isAuthenticated) {
		return null;
	}

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const handleSetup2FA = async () => {
		setLoading(true);
		try {
			console.log('🔐 Setting up 2FA for user:', user);
			console.log(
				'🔐 Access token:',
				localStorage.getItem('accessToken')
			);

			const response = await api.post('/admin/2fa/setup', {
				email: user?.email,
			});

			const { google2faSecret, otpAuthUrl } = response.data;
			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			setShow2FASetup(true);
			showMessage('2FA setup initiated. Please scan the QR code.');
		} catch (error: any) {
			console.error('🔐 2FA setup error:', error);
			console.error('🔐 Error response:', error.response?.data);
			const message =
				error.response?.data?.message || 'Failed to setup 2FA';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handle2FAVerification = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!otp || otp.length !== 6) {
			showMessage('Please enter a valid 6-digit 2FA code', true);
			return;
		}

		setLoading(true);
		try {
			const response = await api.post('/admin/2fa/complete', {
				email: user?.email,
				otp,
				inviteToken: 'existing-admin', // For existing administrators
			});

			showMessage('2FA setup completed successfully!');
			setIs2FAEnabled(true);
			setShow2FASetup(false);
			setOtp('');
			setQrCode('');
			setGoogle2faSecret('');
		} catch (error: any) {
			const message =
				error.response?.data?.message || '2FA verification failed';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleGet2FAInfo = async () => {
		console.log('🔐 handleGet2FAInfo called');
		console.log('🔐 Current state - show2FAInfo:', show2FAInfo);
		console.log('🔐 Current state - qrCode:', qrCode);
		console.log('🔐 Current state - google2faSecret:', google2faSecret);

		// Debug JWT token
		const accessToken = localStorage.getItem('accessToken');
		console.log(
			'🔐 Access token from localStorage:',
			accessToken ? 'present' : 'missing'
		);
		console.log(
			'🔐 Access token preview:',
			accessToken ? accessToken.substring(0, 50) + '...' : 'none'
		);

		setLoading(true);
		try {
			console.log('🔐 Getting 2FA info for user:', user);
			console.log('🔐 Making API call to /admin/2fa/info');

			const response = await api.get('/admin/2fa/info');
			console.log('🔐 API response received:', response.data);

			const {
				google2faSecret,
				otpAuthUrl,
				is2FAEnabled: status,
			} = response.data;

			console.log('🔐 Extracted data:', {
				google2faSecret,
				otpAuthUrl,
				status,
			});

			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			setIs2FAEnabled(status);
			setShow2FAInfo(true);

			console.log('🔐 State updated - show2FAInfo should be true now');
			console.log('🔐 State updated - qrCode should be:', otpAuthUrl);

			showMessage('2FA info retrieved. You can now scan the QR code.');
		} catch (error: any) {
			console.error('🔐 Get 2FA info error:', error);
			console.error('🔐 Error response:', error.response?.data);
			const message =
				error.response?.data?.message || 'Failed to get 2FA info';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	// Password change functions
	const fetchPasswordInfo = async () => {
		try {
			const response = await api.get('/admin/password/info');
			setPasswordInfo(response.data);
		} catch (error: any) {
			console.error('Failed to fetch password info:', error);
		}
	};

	const fetchInvites = async () => {
		try {
			const response = await api.get('/admin/invites');
			setInvites(response.data);
		} catch (error: any) {
			console.error('Failed to fetch invites:', error);
		}
	};

	const handleSendInvite = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!inviteEmail || !inviteName || !inviteRole) {
			showMessage('All fields are required', true);
			return;
		}

		setLoading(true);
		try {
			await api.post('/admin/invite', {
				email: inviteEmail,
				name: inviteName,
				role: inviteRole,
			});

			showMessage('Invitation sent successfully');
			setInviteEmail('');
			setInviteName('');
			setInviteRole('ADMIN');
			setShowInviteForm(false);

			// Refresh invites list
			await fetchInvites();
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Failed to send invitation';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	// Check password match in real-time
	const checkPasswordMatch = () => {
		const shouldShowError = Boolean(
			newPassword && confirmPassword && newPassword !== confirmPassword
		);
		setPasswordMismatch(shouldShowError);

		// Debug logging
		console.log('🔐 Password match check:', {
			newPassword: newPassword
				? `${newPassword.substring(0, 3)}...`
				: 'empty',
			confirmPassword: confirmPassword
				? `${confirmPassword.substring(0, 3)}...`
				: 'empty',
			match: newPassword === confirmPassword,
			willShowError: shouldShowError,
			currentPasswordMismatchState: passwordMismatch,
		});
	};

	// Check for Cyrillic characters
	const checkCyrillic = (text: string) => {
		const cyrillicRegex = /[а-яё]/i;
		return cyrillicRegex.test(text);
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			showMessage('New passwords do not match', true);
			return;
		}

		if (checkCyrillic(newPassword)) {
			showMessage('Password must contain only Latin letters', true);
			return;
		}

		setLoading(true);
		try {
			await api.post('/admin/password/change', {
				currentPassword,
				newPassword,
			});

			showMessage('Password changed successfully');
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			setShowPasswordChange(false);
			setShowCurrentPassword(false);
			setShowNewPassword(false);
			setShowConfirmPassword(false);
			setPasswordMismatch(false);
			setHasCyrillic(false);

			// Update password information
			await fetchPasswordInfo();
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Password change error';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleDisable2FA = async () => {
		if (
			!confirm(
				'Are you sure you want to disable 2FA? This will make your account less secure.'
			)
		) {
			return;
		}

		setLoading(true);
		try {
			await api.post('/admin/2fa/disable', {
				email: user?.email,
			});

			showMessage('2FA has been disabled.');
			setIs2FAEnabled(false);
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Failed to disable 2FA';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-white'>
					Admin Settings
				</h1>
				<p className='mt-1 text-sm text-gray-400'>
					Manage your administrator account settings
				</p>
			</div>

			{message && (
				<div
					className={cn(
						'p-4 rounded-md border',
						message.includes('error') || message.includes('failed')
							? 'bg-red-900 border-red-700 text-red-200'
							: 'bg-green-900 border-green-700 text-green-200'
					)}>
					{message}
				</div>
			)}

			{/* Account Information */}
			<div className='bg-gray-800 shadow rounded-lg border border-gray-700 p-6'>
				<h2 className='text-lg font-medium text-white mb-4'>
					👤 Account Information
				</h2>
				<div className='space-y-3'>
					<div className='flex justify-between'>
						<span className='text-gray-400'>Email:</span>
						<span className='text-white'>{user?.email}</span>
					</div>
					<div className='flex justify-between'>
						<span className='text-gray-400'>Role:</span>
						<span className='text-white'>{user?.role}</span>
					</div>
					<div className='flex justify-between'>
						<span className='text-gray-400'>2FA Status:</span>
						<span
							className={cn(
								'px-2 py-1 rounded-full text-xs font-medium',
								is2FAEnabled
									? 'bg-green-900 text-green-200'
									: 'bg-red-900 text-red-200'
							)}>
							{is2FAEnabled ? 'Enabled' : 'Disabled'}
						</span>
					</div>
				</div>
			</div>

			{/* 2FA Setup Section */}
			{!show2FASetup && (
				<div className='bg-gray-800 shadow rounded-lg border border-gray-700 p-6'>
					<h2 className='text-lg font-medium text-white mb-4'>
						🔐 Two-Factor Authentication
					</h2>
					<p className='text-gray-400 mb-4'>
						Two-factor authentication adds an extra layer of
						security to your account by requiring a code from your
						phone in addition to your password.
					</p>

					{/* Debug info */}
					<div className='mb-4 p-3 bg-gray-700 rounded-md border border-gray-600'>
						<p className='text-sm text-gray-300'>
							<strong>Debug:</strong> is2FAEnabled ={' '}
							{is2FAEnabled ? 'true' : 'false'}
						</p>
					</div>

					{is2FAEnabled ? (
						<div className='space-y-4'>
							<div className='bg-green-900 p-4 rounded-md border border-green-700'>
								<p className='text-green-200 text-sm'>
									✅ 2FA is enabled for your account. Your
									account is now more secure.
								</p>
							</div>
							<div className='flex space-x-3'>
								<button
									onClick={handleGet2FAInfo}
									disabled={loading}
									className='px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50'>
									{loading ? 'Loading...' : '📱 Get QR Code'}
								</button>
								<button
									onClick={handleDisable2FA}
									disabled={loading}
									className='px-4 py-2 border border-red-600 rounded-md text-red-300 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50'>
									{loading ? 'Disabling...' : 'Disable 2FA'}
								</button>
							</div>
						</div>
					) : (
						<div className='space-y-4'>
							<button
								onClick={handleSetup2FA}
								disabled={loading}
								className='px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50'>
								{loading ? 'Setting up...' : 'Setup 2FA'}
							</button>

							{/* Always show Get QR Code button for testing */}
							<div className='border-t border-gray-600 pt-4'>
								<p className='text-sm text-gray-400 mb-2'>
									Test: Get QR Code (always visible)
								</p>
								<button
									onClick={handleGet2FAInfo}
									disabled={loading}
									className='px-4 py-2 bg-green-600 border border-transparent rounded-md text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50'>
									{loading
										? 'Loading...'
										: '📱 Get QR Code (Test)'}
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Password Management Section - MOVED TO BOTTOM */}

			{/* 2FA Setup Form */}
			{show2FASetup && (
				<div className='space-y-6'>
					<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
						<h3 className='text-lg font-medium text-white mb-4'>
							📱 Google Authenticator Setup
						</h3>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									QR Code for scanning:
								</label>
								<div className='flex justify-center'>
									{qrCode ? (
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
												qrCode
											)}&margin=10&format=png`}
											alt='QR Code for Google Authenticator'
											className='border-2 border-gray-600 rounded-lg shadow-lg'
											style={{
												maxWidth: '250px',
												height: 'auto',
											}}
										/>
									) : (
										<div className='flex items-center justify-center w-64 h-64 border-2 border-gray-600 rounded-lg bg-gray-700'>
											<div className='text-gray-400 text-center'>
												<div className='text-4xl mb-2'>
													📱
												</div>
												<div className='text-sm'>
													QR Code loading...
												</div>
											</div>
										</div>
									)}
								</div>
								{qrCode && (
									<div className='text-center mt-2'>
										<p className='text-xs text-gray-400'>
											Scan this QR code with Google
											Authenticator
										</p>
									</div>
								)}
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Secret Key (for manual entry):
								</label>
								<div className='flex items-center space-x-2'>
									<input
										type='text'
										value={google2faSecret}
										readOnly
										aria-label='Google 2FA secret key'
										className='flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white text-sm font-mono tracking-wider'
									/>
									<button
										onClick={() => {
											navigator.clipboard.writeText(
												google2faSecret
											);
											showMessage(
												'Secret key copied to clipboard!'
											);
										}}
										className='px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors'
										aria-label='Copy secret to clipboard'>
										📋 Copy
									</button>
								</div>
								<p className='text-xs text-gray-400 mt-1'>
									Use this secret key if you can't scan the QR
									code
								</p>
							</div>

							<div className='bg-blue-900 p-4 rounded-md border border-blue-700'>
								<h4 className='text-sm font-medium text-blue-200 mb-2'>
									📱 Setup Instructions:
								</h4>
								<ol className='text-sm text-blue-300 space-y-2'>
									<li className='flex items-start'>
										<span className='mr-2'>1.</span>
										<span>
											Open{' '}
											<strong>
												Google Authenticator
											</strong>{' '}
											app on your phone
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>2.</span>
										<span>
											Tap the <strong>"+"</strong> button
											to add a new account
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>3.</span>
										<span>
											Choose{' '}
											<strong>"Scan QR code"</strong> and
											scan the code above, OR
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>4.</span>
										<span>
											Choose{' '}
											<strong>"Enter setup key"</strong>{' '}
											and paste the secret key
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>5.</span>
										<span>
											Verify the 6-digit code appears in
											the app
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>6.</span>
										<span>
											Enter the code below to complete
											setup
										</span>
									</li>
								</ol>
							</div>
						</div>
					</div>

					{/* 2FA Verification Form */}
					<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
						<h3 className='text-lg font-medium text-white mb-4'>
							🔐 Complete 2FA Setup
						</h3>
						<form
							onSubmit={handle2FAVerification}
							className='space-y-4'>
							<div>
								<label
									htmlFor='otp'
									className='block text-sm font-medium text-gray-300 mb-2'>
									2FA Verification Code:
								</label>
								<input
									type='text'
									id='otp'
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									placeholder='Enter 6-digit code from Google Authenticator'
									className='w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									maxLength={6}
									pattern='[0-9]{6}'
									required
								/>
								<p className='text-xs text-gray-400 mt-1'>
									Enter the 6-digit code from your Google
									Authenticator app
								</p>
							</div>
							<div className='flex space-x-3'>
								<button
									type='submit'
									disabled={
										loading || !otp || otp.length !== 6
									}
									className='flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
									{loading ? (
										<div className='flex items-center justify-center'>
											<div className='h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2' />
											Verifying...
										</div>
									) : (
										'✅ Complete 2FA Setup'
									)}
								</button>
								<button
									type='button'
									onClick={() => {
										setShow2FASetup(false);
										setOtp('');
										setQrCode('');
										setGoogle2faSecret('');
									}}
									className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Password Change Form */}
			{showPasswordChange && (
				<div className='space-y-6'>
					<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
						<h3 className='text-lg font-medium text-white mb-4'>
							🔑 Change Password
						</h3>
						<form
							onSubmit={handlePasswordChange}
							className='space-y-4'>
							<div>
								<label
									htmlFor='currentPassword'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Current Password
								</label>
								<div className='relative'>
									<input
										type={
											showCurrentPassword
												? 'text'
												: 'password'
										}
										id='currentPassword'
										value={currentPassword}
										onChange={(e) =>
											setCurrentPassword(e.target.value)
										}
										required
										className='w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									<button
										type='button'
										onClick={() =>
											setShowCurrentPassword(
												!showCurrentPassword
											)
										}
										className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none'>
										{showCurrentPassword ? (
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
												/>
											</svg>
										) : (
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
												/>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
												/>
											</svg>
										)}
									</button>
								</div>
							</div>

							<div>
								<label
									htmlFor='newPassword'
									className='block text-sm font-medium text-gray-300 mb-2'>
									New Password
								</label>
								<div className='relative'>
									<input
										type={
											showNewPassword
												? 'text'
												: 'password'
										}
										id='newPassword'
										value={newPassword}
										onChange={(e) => {
											const value = e.target.value;
											console.log(
												'🔐 New password changed:',
												value
													? `${value.substring(
															0,
															3
													  )}...`
													: 'empty'
											);
											setNewPassword(value);
											setHasCyrillic(
												checkCyrillic(value)
											);
											checkPasswordMatch();
										}}
										required
										className='w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									<button
										type='button'
										onClick={() =>
											setShowNewPassword(!showNewPassword)
										}
										className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none'>
										{showNewPassword ? (
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
												/>
											</svg>
										) : (
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
												/>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
												/>
											</svg>
										)}
									</button>
								</div>
								<p className='mt-1 text-xs text-gray-400'>
									Minimum 8 characters, including numbers,
									letters and special characters
								</p>
								{hasCyrillic && (
									<p className='mt-1 text-xs text-red-400'>
										❌ Use only Latin letters (A-Z, a-z)
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor='confirmPassword'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Confirm New Password
								</label>
								<div className='relative'>
									<input
										type={
											showConfirmPassword
												? 'text'
												: 'password'
										}
										id='confirmPassword'
										value={confirmPassword}
										onChange={(e) => {
											const value = e.target.value;
											console.log(
												'🔐 Confirm password changed:',
												value
													? `${value.substring(
															0,
															3
													  )}...`
													: 'empty'
											);
											setConfirmPassword(value);
											checkPasswordMatch();
										}}
										required
										className='w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									<button
										type='button'
										onClick={() =>
											setShowConfirmPassword(
												!showConfirmPassword
											)
										}
										className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none'>
										{showConfirmPassword ? (
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
												/>
											</svg>
										) : (
											<svg
												className='h-5 w-5'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
												/>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
												/>
											</svg>
										)}
									</button>
								</div>
								{passwordMismatch && (
									<p className='mt-1 text-xs text-red-400'>
										❌ Passwords do not match (Debug:{' '}
										{passwordMismatch ? 'true' : 'false'})
									</p>
								)}
							</div>

							<div className='flex space-x-3'>
								<button
									type='submit'
									disabled={
										loading ||
										!currentPassword ||
										!newPassword ||
										!confirmPassword ||
										passwordMismatch ||
										hasCyrillic
									}
									className='flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
									{loading ? (
										<div className='flex items-center justify-center'>
											<div className='h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2' />
											Changing...
										</div>
									) : (
										'✅ Change Password'
									)}
								</button>
								<button
									type='button'
									onClick={() => {
										setShowPasswordChange(false);
										setCurrentPassword('');
										setNewPassword('');
										setConfirmPassword('');
										setShowCurrentPassword(false);
										setShowNewPassword(false);
										setShowConfirmPassword(false);
										setPasswordMismatch(false);
										setHasCyrillic(false);
									}}
									className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* 2FA Info Display (for already configured 2FA) */}
			{/* Debug: show2FAInfo = {show2FAInfo ? 'true' : 'false'}, qrCode = {qrCode ? 'set' : 'not set'} */}
			{show2FAInfo && (
				<div className='space-y-6'>
					{/* Debug info */}
					<div className='bg-yellow-900 p-4 rounded-md border border-yellow-700'>
						<p className='text-yellow-200 text-sm'>
							<strong>Debug QR Section:</strong> show2FAInfo ={' '}
							{show2FAInfo ? 'true' : 'false'}, qrCode ={' '}
							{qrCode
								? 'set (' + qrCode.substring(0, 50) + '...)'
								: 'not set'}
							, google2faSecret ={' '}
							{google2faSecret
								? 'set (' +
								  google2faSecret.substring(0, 20) +
								  '...)'
								: 'not set'}
						</p>
					</div>
					<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
						<h3 className='text-lg font-medium text-white mb-4'>
							📱 Your 2FA QR Code
						</h3>
						<p className='text-gray-400 mb-4'>
							Scan this QR code with Google Authenticator to set
							up 2FA on your device.
						</p>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									QR Code for scanning:
								</label>
								<div className='flex justify-center'>
									{qrCode ? (
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
												qrCode
											)}&margin=10&format=png`}
											alt='QR Code for Google Authenticator'
											className='border-2 border-gray-600 rounded-lg shadow-lg'
											style={{
												maxWidth: '250px',
												height: 'auto',
											}}
										/>
									) : (
										<div className='flex items-center justify-center w-64 h-64 border-2 border-gray-600 rounded-lg bg-gray-700'>
											<div className='text-gray-400 text-center'>
												<div className='text-4xl mb-2'>
													📱
												</div>
												<div className='text-sm'>
													QR Code loading...
												</div>
											</div>
										</div>
									)}
								</div>
								{qrCode && (
									<div className='text-center mt-2'>
										<p className='text-xs text-gray-400'>
											Scan this QR code with Google
											Authenticator
										</p>
									</div>
								)}
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									Secret Key (for manual entry):
								</label>
								<div className='flex items-center space-x-2'>
									<input
										type='text'
										value={google2faSecret}
										readOnly
										aria-label='Google 2FA secret key'
										className='flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white text-sm font-mono tracking-wider'
									/>
									<button
										onClick={() => {
											navigator.clipboard.writeText(
												google2faSecret
											);
											showMessage(
												'Secret key copied to clipboard!'
											);
										}}
										className='px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors'
										aria-label='Copy secret to clipboard'>
										📋 Copy
									</button>
								</div>
								<p className='text-xs text-gray-400 mt-1'>
									Use this secret key if you can't scan the QR
									code
								</p>
							</div>

							<div className='bg-green-900 p-4 rounded-md border border-green-700'>
								<h4 className='text-sm font-medium text-green-200 mb-2'>
									✅ Setup Instructions:
								</h4>
								<ol className='text-sm text-green-300 space-y-2'>
									<li className='flex items-start'>
										<span className='mr-2'>1.</span>
										<span>
											Open{' '}
											<strong>
												Google Authenticator
											</strong>{' '}
											app on your phone
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>2.</span>
										<span>
											Tap the <strong>"+"</strong> button
											to add a new account
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>3.</span>
										<span>
											Choose{' '}
											<strong>"Scan QR code"</strong> and
											scan the code above, OR
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>4.</span>
										<span>
											Choose{' '}
											<strong>"Enter setup key"</strong>{' '}
											and paste the secret key
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>5.</span>
										<span>
											Verify the 6-digit code appears in
											the app
										</span>
									</li>
									<li className='flex items-start'>
										<span className='mr-2'>6.</span>
										<span>
											You can now use this code to login
											to the admin panel
										</span>
									</li>
								</ol>
							</div>
						</div>
					</div>

					<div className='flex justify-center'>
						<button
							onClick={() => {
								setShow2FAInfo(false);
								setQrCode('');
								setGoogle2faSecret('');
							}}
							className='px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'>
							Close
						</button>
					</div>
				</div>
			)}

			{/* Password Management Section */}
			<div className='bg-gray-800 shadow rounded-lg border border-gray-700 p-6'>
				<h2 className='text-lg font-medium text-white mb-4'>
					🔑 Password Management
				</h2>

				{/* Password Info */}
				{passwordInfo && (
					<div className='mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600'>
						<h4 className='text-sm font-medium text-gray-200 mb-3'>
							Password Information
						</h4>
						<div className='space-y-2 text-sm'>
							<p className='text-gray-300'>
								<strong>Password set:</strong>{' '}
								{passwordInfo.hasPassword ? '✅ Yes' : '❌ No'}
							</p>
							{passwordInfo.passwordChangedAt && (
								<p className='text-gray-300'>
									<strong>Last changed:</strong>{' '}
									{new Date(
										passwordInfo.passwordChangedAt
									).toLocaleDateString()}
								</p>
							)}
							{passwordInfo.passwordExpiresAt && (
								<p className='text-gray-300'>
									<strong>Expires:</strong>{' '}
									{new Date(
										passwordInfo.passwordExpiresAt
									).toLocaleDateString()}
								</p>
							)}
							{passwordInfo.lastLoginAt && (
								<p className='text-gray-300'>
									<strong>Last login:</strong>{' '}
									{new Date(
										passwordInfo.lastLoginAt
									).toLocaleDateString()}
								</p>
							)}
							{passwordInfo.passwordWarning && (
								<p className='text-yellow-400'>
									<strong>Warning:</strong>{' '}
									{passwordInfo.passwordMessage}
								</p>
							)}
							{passwordInfo.isLocked && (
								<p className='text-red-400'>
									<strong>Account locked:</strong>{' '}
									{passwordInfo.lockMinutesLeft} min.
								</p>
							)}
						</div>
					</div>
				)}

				{/* Password Change Button */}
				<button
					onClick={() => setShowPasswordChange(!showPasswordChange)}
					className='px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'>
					{showPasswordChange ? '❌ Cancel' : '🔑 Change Password'}
				</button>
			</div>

			{/* Admin Invitation Section */}
			<div className='bg-gray-800 shadow rounded-lg border border-gray-700 p-6'>
				<h2 className='text-lg font-medium text-white mb-4'>
					👥 Admin Invitations
				</h2>

				{/* Invite Form */}
				{!showInviteForm && (
					<div className='flex space-x-3'>
						<button
							onClick={() => setShowInviteForm(true)}
							className='px-4 py-2 bg-green-600 border border-transparent rounded-md text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800'>
							📧 Send New Invitation
						</button>
						<button
							onClick={fetchInvites}
							disabled={loading}
							className='px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'>
							🔄 Refresh List
						</button>
					</div>
				)}

				{showInviteForm && (
					<div className='space-y-4'>
						<form onSubmit={handleSendInvite} className='space-y-4'>
							<div>
								<label
									htmlFor='inviteEmail'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Email Address
								</label>
								<input
									type='email'
									id='inviteEmail'
									value={inviteEmail}
									onChange={(e) =>
										setInviteEmail(e.target.value)
									}
									required
									className='w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Enter email address'
								/>
							</div>

							<div>
								<label
									htmlFor='inviteName'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Full Name
								</label>
								<input
									type='text'
									id='inviteName'
									value={inviteName}
									onChange={(e) =>
										setInviteName(e.target.value)
									}
									required
									className='w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Enter full name'
								/>
							</div>

							<div>
								<label
									htmlFor='inviteRole'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Role
								</label>
								<select
									id='inviteRole'
									value={inviteRole}
									onChange={(e) =>
										setInviteRole(e.target.value)
									}
									required
									className='w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
									<option value='ADMIN'>Admin</option>
									<option value='SUPERVISOR'>
										Supervisor
									</option>
								</select>
							</div>

							<div className='flex space-x-3'>
								<button
									type='submit'
									disabled={loading}
									className='flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'>
									{loading ? 'Sending...' : 'Send Invitation'}
								</button>
								<button
									type='button'
									onClick={() => {
										setShowInviteForm(false);
										setInviteEmail('');
										setInviteName('');
										setInviteRole('ADMIN');
									}}
									className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Invites List */}
				{invites.length > 0 ? (
					<div className='mt-6'>
						<h3 className='text-md font-medium text-white mb-3'>
							Recent Invitations
						</h3>
						<div className='space-y-2'>
							{invites.map((invite: any, index: number) => (
								<div
									key={index}
									className='p-3 bg-gray-700 rounded-lg border border-gray-600'>
									<div className='flex justify-between items-start'>
										<div>
											<p className='text-white font-medium'>
												{invite.name}
											</p>
											<p className='text-gray-400 text-sm'>
												{invite.email}
											</p>
											<p className='text-gray-500 text-xs'>
												Role: {invite.role}
											</p>
										</div>
										<div className='text-right'>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													invite.status === 'PENDING'
														? 'bg-yellow-900 text-yellow-200'
														: invite.status ===
														  'ACCEPTED'
														? 'bg-green-900 text-green-200'
														: 'bg-red-900 text-red-200'
												}`}>
												{invite.status}
											</span>
											<p className='text-gray-500 text-xs mt-1'>
												{new Date(
													invite.createdAt
												).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className='mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600'>
						<p className='text-gray-400 text-center'>
							No invitations sent yet
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
