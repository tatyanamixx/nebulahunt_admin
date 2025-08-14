import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils.js';
import { api } from '../lib/api.js';
import { isDevelopment } from '../lib/env.js';

export default function AdminInvite() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		role: 'ADMIN',
		name: '',
	});
	const [message, setMessage] = useState('');

	// Fill test data in development mode
	if (isDevelopment() && !formData.email) {
		setFormData((prev) => ({
			...prev,
			email: 'admin@test.com',
			name: 'Test Admin',
		}));
	}

	const showMessage = (text, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.email || !formData.name) {
			showMessage('Fill in all required fields', true);
			return;
		}

		setLoading(true);
		try {
			await api.post('/admin/invite', formData);
			showMessage(`Invitation sent to ${formData.email}`);

			// Clear form
			setFormData({
				email: '',
				role: 'ADMIN',
				name: '',
			});
		} catch (error) {
			const message =
				error.response?.data?.message || 'Error sending invitation';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-blue-400'>📧</div>
					<h2 className='mt-6 text-3xl font-bold text-white'>
						Invite Administrator
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						Send invitation to new administrator via email
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-md'>
							<p className='text-sm text-yellow-200'>
								🧪 Development mode: Testing invitations
							</p>
						</div>
					)}
				</div>

				{message && (
					<div
						className={cn(
							'p-4 rounded-md',
							message.includes('Error') ||
								message.includes('error')
								? 'bg-red-900 text-red-200 border border-red-700'
								: 'bg-green-900 text-green-200 border border-green-700'
						)}>
						{message}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label
							htmlFor='name'
							className='block text-sm font-medium text-gray-300'>
							Administrator Name *
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
							Administrator Email *
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
						/>
					</div>

					<div>
						<label
							htmlFor='role'
							className='block text-sm font-medium text-gray-300'>
							Role
						</label>
						<select
							id='role'
							name='role'
							value={formData.role}
							onChange={(e) =>
								handleInputChange(
									'role',
									e.target.value
								)
							}
							className='mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'>
							<option value='ADMIN'>Administrator</option>
							<option value='SUPERVISOR'>Supervisor</option>
						</select>
					</div>

					<div className='bg-blue-900 p-4 rounded-md border border-blue-700'>
						<h4 className='text-sm font-medium text-blue-200 mb-2'>
							What will happen:
						</h4>
						<ul className='text-sm text-blue-300 space-y-1'>
							<li>
								• An invitation will be sent to the specified
								email
							</li>
							<li>
								• Administrator will receive a registration link
							</li>
							<li>
								• Google 2FA setup will be required during
								registration
							</li>
							<li>• Access will be activated after 2FA setup</li>
						</ul>
					</div>

					<div className='flex space-x-3'>
						<button
							type='button'
							onClick={() => navigate('/dashboard')}
							className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'>
							Cancel
						</button>
						<button
							type='submit'
							disabled={loading}
							className={cn(
								'flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
							)}>
							{loading ? (
								<div className='h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full mx-auto' />
							) : (
								'Send Invitation'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
