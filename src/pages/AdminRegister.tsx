import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { isDevelopment } from '../lib/env';

interface RegisterForm {
	email: string;
	password: string;
	confirmPassword: string;
	name: string;
	otp: string;
}

export default function AdminRegister() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'register' | '2fa'>('register');
	const [formData, setFormData] = useState<RegisterForm>({
		email: '',
		password: '',
		confirmPassword: '',
		name: '',
		otp: '',
	});
	const [message, setMessage] = useState('');
	const [qrCode, setQrCode] = useState('');
	const [google2faSecret, setGoogle2faSecret] = useState('');
	const [inviteToken, setInviteToken] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Get invitation token from URL
	useEffect(() => {
		const token = searchParams.get('token');
		if (token) {
			setInviteToken(token);
			// Validate token
			validateInviteToken(token);
		}
	}, [searchParams]);

	// Fill test data in development mode
	useEffect(() => {
		if (isDevelopment() && !formData.email) {
			setFormData((prev) => ({
				...prev,
				email: 'admin@test.com',
				name: 'Test Admin',
				password: 'TestPass123!',
				confirmPassword: 'TestPass123!',
			}));
		}
	}, []);

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const validateInviteToken = async (token: string) => {
		try {
			const response = await api.get(
				`/admin/invite/validate?token=${token}`
			);
			const { email, name, role } = response.data;
			setFormData((prev) => ({
				...prev,
				email,
				name,
			}));
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Invalid invitation';
			showMessage(message, true);
			// Redirect to login page after 3 seconds
			setTimeout(() => navigate('/admin/login'), 3000);
		}
	};

	const validatePassword = (password: string) => {
		const minLength = 8;

		if (password.length < minLength) {
			return `Password must contain at least ${minLength} characters`;
		}

		if (!/\d/.test(password)) {
			return 'Password must contain at least one number';
		}

		if (!/[a-zA-Z]/.test(password)) {
			return 'Password must contain at least one letter';
		}

		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			return 'Password must contain at least one special character';
		}

		return null;
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email || !formData.password || !formData.name) {
			showMessage('Please fill in all required fields', true);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			showMessage('Passwords do not match', true);
			return;
		}

		const passwordError = validatePassword(formData.password);
		if (passwordError) {
			showMessage(passwordError, true);
			return;
		}

		setLoading(true);
		try {
			const response = await api.post('/admin/register', {
				email: formData.email,
				password: formData.password,
				name: formData.name,
				inviteToken,
			});

			const { google2faSecret, otpAuthUrl } = response.data;
			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			setStep('2fa');
			showMessage('Registration successful! Set up Google Authenticator');
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Registration error';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handle2FAVerification = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.otp) {
			showMessage('Please enter 2FA code', true);
			return;
		}

		setLoading(true);
		try {
			await api.post('/admin/2fa/complete', {
				email: formData.email,
				otp: formData.otp,
				inviteToken,
			});

			showMessage('Registration completed! Redirecting to login page...');
			setTimeout(() => navigate('/admin/login'), 2000);
		} catch (error: any) {
			const message =
				error.response?.data?.message || '2FA verification error';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: keyof RegisterForm, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	if (!inviteToken && !isDevelopment()) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
				<div className='max-w-md w-full text-center'>
					<div className='mx-auto h-12 w-12 text-red-400'>❌</div>
					<h2 className='mt-6 text-2xl font-bold text-white'>
						Invalid Link
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						A valid invitation is required for registration
					</p>
					<button
						onClick={() => navigate('/admin/login')}
						className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-blue-400'>
						{step === 'register' ? '👤' : '🔐'}
					</div>
					<h2 className='mt-6 text-3xl font-bold text-white'>
						{step === 'register'
							? 'Admin Registration'
							: '2FA Setup'}
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						{step === 'register'
							? 'Complete admin registration'
							: 'Set up Google Authenticator to complete registration'}
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-md'>
							<p className='text-sm text-yellow-200'>
								🧪 Development mode: Testing registration
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

				{step === 'register' && (
					<form onSubmit={handleRegister} className='space-y-6'>
						<div>
							<label
								htmlFor='name'
								className='block text-sm font-medium text-gray-300'>
								Name *
							</label>
							<input
								id='name'
								name='name'
								type='text'
								required
								value={formData.name}
								onChange={(e) =>
									handleInputChange('name', e.target.value)
								}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='John Doe'
							/>
						</div>

						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium text-gray-300'>
								Email *
							</label>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								value={formData.email}
								onChange={(e) =>
									handleInputChange('email', e.target.value)
								}
								className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='admin@example.com'
								readOnly={!!inviteToken}
							/>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-gray-300'>
								Password *
							</label>
							<div className='mt-1 relative'>
								<input
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									autoComplete='new-password'
									required
									value={formData.password}
									onChange={(e) =>
										handleInputChange(
											'password',
											e.target.value
										)
									}
									className='appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
									placeholder='Minimum 8 characters'
								/>
								<button
									type='button'
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300'>
									{showPassword ? '👁️' : '👁️‍🗨️'}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-300'>
								Confirm Password *
							</label>
							<div className='mt-1 relative'>
								<input
									id='confirmPassword'
									name='confirmPassword'
									type={
										showConfirmPassword
											? 'text'
											: 'password'
									}
									autoComplete='new-password'
									required
									value={formData.confirmPassword}
									onChange={(e) =>
										handleInputChange(
											'confirmPassword',
											e.target.value
										)
									}
									className='appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
									placeholder='Repeat password'
								/>
								<button
									type='button'
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
									className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300'>
									{showConfirmPassword ? '👁️' : '👁️‍🗨️'}
								</button>
							</div>
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
								'Register'
							)}
						</button>
					</form>
				)}

				{step === '2fa' && (
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
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
												qrCode
											)}`}
											alt='QR Code'
											className='border border-gray-600 rounded'
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Secret for manual entry:
									</label>
									<div className='flex items-center space-x-2'>
										<input
											type='text'
											value={google2faSecret}
											readOnly
											aria-label='Google 2FA secret key'
											className='flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white text-sm font-mono rounded-md'
										/>
										<button
											onClick={() =>
												navigator.clipboard.writeText(
													google2faSecret
												)
											}
											className='px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600'
											aria-label='Copy secret to clipboard'>
											Copy
										</button>
									</div>
								</div>

								<div className='bg-blue-900 p-4 rounded-md border border-blue-700'>
									<h4 className='text-sm font-medium text-blue-200 mb-2'>
										Instructions:
									</h4>
									<ol className='text-sm text-blue-300 space-y-1'>
										<li>1. Open Google Authenticator</li>
										<li>2. Tap "+" to add account</li>
										<li>
											3. Choose "Scan QR code" or enter
											secret manually
										</li>
										<li>
											4. Enter the received code below
										</li>
									</ol>
								</div>
							</div>
						</div>

						<form
							onSubmit={handle2FAVerification}
							className='space-y-6'>
							<div>
								<label
									htmlFor='otp'
									className='block text-sm font-medium text-gray-300'>
									2FA Code *
								</label>
								<input
									id='otp'
									name='otp'
									type='text'
									autoComplete='one-time-code'
									required
									value={formData.otp}
									onChange={(e) =>
										handleInputChange(
											'otp',
											e.target.value
												.replace(/\D/g, '')
												.slice(0, 6)
										)
									}
									className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
									placeholder='000000'
									maxLength={6}
								/>
							</div>

							<div className='flex space-x-3'>
								<button
									type='button'
									onClick={() => setStep('register')}
									className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'>
									Back
								</button>
								<button
									type='submit'
									disabled={
										loading || formData.otp.length !== 6
									}
									className={cn(
										'flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
									)}>
									{loading ? (
										<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full mx-auto' />
									) : (
										'Complete Registration'
									)}
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
