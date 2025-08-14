import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils.js';
import { api } from '../lib/api.js';
import { isDevelopment } from '../lib/env.js';

export default function AdminInit() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [secretKey, setSecretKey] = useState('');
	const [message, setMessage] = useState('');
	const [qrCode, setQrCode] = useState('');
	const [google2faSecret, setGoogle2faSecret] = useState('');
	const [otp, setOtp] = useState('');

	// Fill test data in development mode
	useEffect(() => {
		if (isDevelopment()) {
			setEmail('admin@test.com');
			setSecretKey('supersecret');
		}
	}, []);

	const showMessage = (text, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const handleInitAdmin = async (e) => {
		e.preventDefault();

		if (!email || !secretKey) {
			showMessage('Fill in all fields', true);
			return;
		}

		setLoading(true);
		try {
			const response = await api.post('/admin/init', {
				email,
				secretKey,
			});
			const { google2faSecret, otpAuthUrl } = response.data;

			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			showMessage(
				'Administrator initialized! Set up Google Authenticator'
			);
		} catch (error) {
			const message =
				error.response?.data?.message || 'Initialization error';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleInitSupervisor = async () => {
		setLoading(true);
		try {
			const response = await api.post('/admin/supervisor/init');
			const { google2faSecret, otpAuthUrl } = response.data;

			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			showMessage('Supervisor initialized! Set up Google Authenticator');
		} catch (error) {
			const message =
				error.response?.data?.message ||
				'Supervisor initialization error';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handle2FAVerification = async (e) => {
		e.preventDefault();

		if (!otp || otp.length !== 6) {
			showMessage('Please enter a valid 6-digit 2FA code', true);
			return;
		}

		setLoading(true);
		try {
			// For admin initialization, we need to complete 2FA setup
			// This would typically be done after registration
			// For now, we'll just verify the code works
			const response = await api.post('/admin/2fa/verify', {
				email,
				otp,
			});

			showMessage('2FA setup completed successfully! You can now login.');

			// Clear the form
			setOtp('');
			setQrCode('');
			setGoogle2faSecret('');

			// Optionally redirect to login
			setTimeout(() => {
				navigate('/admin/login');
			}, 2000);
		} catch (error) {
			const message =
				error.response?.data?.message || '2FA verification failed';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-blue-400'>⚙️</div>
					<h2 className='mt-6 text-3xl font-bold text-white'>
						Administrator Initialization
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						Create new administrators and supervisor
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-md'>
							<p className='text-sm text-yellow-200'>
								🧪 Development mode: Testing initialization
							</p>
						</div>
					)}
				</div>

				{message && (
					<div
						className={cn(
							'p-4 rounded-md',
							message.includes('error') ||
								message.includes('Error')
								? 'bg-red-900 text-red-200 border border-red-700'
								: 'bg-green-900 text-green-200 border border-green-700'
						)}>
						{message}
					</div>
				)}

				{!qrCode ? (
					<div className='space-y-6'>
						<form onSubmit={handleInitAdmin} className='space-y-6'>
							<div>
								<label
									htmlFor='email'
									className='block text-sm font-medium text-gray-300'>
									Administrator Email
								</label>
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
									placeholder='admin@example.com'
								/>
							</div>

							<div>
								<label
									htmlFor='secretKey'
									className='block text-sm font-medium text-gray-300'>
									Secret Key
								</label>
								<input
									id='secretKey'
									name='secretKey'
									type='password'
									required
									value={secretKey}
									onChange={(e) =>
										setSecretKey(e.target.value)
									}
									className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
									placeholder='Enter secret key'
								/>
							</div>

							<button
								type='submit'
								disabled={loading}
								className={cn(
									'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
								)}>
								{loading ? (
									<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full' />
								) : (
									'Initialize Administrator'
								)}
							</button>
						</form>

						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-600' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-gray-900 text-gray-400'>
									Or
								</span>
							</div>
						</div>

						<button
							onClick={handleInitSupervisor}
							disabled={loading}
							className={cn(
								'group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
							)}>
							{loading ? (
								<div className='h-5 w-5 animate-spin border-2 border-gray-400 border-t-transparent rounded-full' />
							) : (
								'Initialize Supervisor'
							)}
						</button>
					</div>
				) : (
					<div className='space-y-6'>
						<div className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
							<h3 className='text-lg font-medium text-white mb-4'>
								Google Authenticator Setup
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
										Use this secret key if you can't scan
										the QR code
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
												Tap the <strong>"+"</strong>{' '}
												button to add a new account
											</span>
										</li>
										<li className='flex items-start'>
											<span className='mr-2'>3.</span>
											<span>
												Choose{' '}
												<strong>"Scan QR code"</strong>{' '}
												and scan the code above, OR
											</span>
										</li>
										<li className='flex items-start'>
											<span className='mr-2'>4.</span>
											<span>
												Choose{' '}
												<strong>
													"Enter setup key"
												</strong>{' '}
												and paste the secret key
											</span>
										</li>
										<li className='flex items-start'>
											<span className='mr-2'>5.</span>
											<span>
												Verify the 6-digit code appears
												in the app
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
								<button
									type='submit'
									disabled={
										loading || !otp || otp.length !== 6
									}
									className='w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
									{loading ? (
										<div className='flex items-center justify-center'>
											<div className='h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2' />
											Verifying...
										</div>
									) : (
										'✅ Complete 2FA Setup'
									)}
								</button>
							</form>
						</div>

						<div className='flex space-x-3'>
							<button
								onClick={() => {
									setQrCode('');
									setGoogle2faSecret('');
									setMessage('');
								}}
								className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'>
								Back
							</button>
							<button
								onClick={() => navigate('/admin/login')}
								className='flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'>
								Go to Login
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
