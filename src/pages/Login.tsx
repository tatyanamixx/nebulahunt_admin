import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { isDevelopment, logEnvironmentInfo } from '../lib/env';

export default function Login() {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// Log environment information in development mode
	useEffect(() => {
		logEnvironmentInfo();
	}, []);

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard');
		}
	}, [isAuthenticated, navigate]);

	// Redirect to admin login as system switched to Google 2FA
	useEffect(() => {
		navigate('/admin/login');
	}, [navigate]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-blue-400'>🔄</div>
					<h2 className='mt-6 text-3xl font-bold text-white'>
						Redirecting...
					</h2>
					<p className='mt-2 text-sm text-gray-400'>
						System switched to new Google 2FA authentication
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-blue-900 border border-blue-700 rounded-md'>
							<p className='text-sm text-blue-200'>
								🔄 Redirecting to administrator login page
							</p>
						</div>
					)}
				</div>

				<div className='text-center'>
					<Link
						to='/admin/login'
						className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'>
						Go to Login
					</Link>
				</div>
			</div>
		</div>
	);
}
