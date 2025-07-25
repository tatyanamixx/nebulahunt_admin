import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { isDevelopment, logEnvironmentInfo } from '../lib/env';

export default function Login() {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// Логируем информацию об окружении в режиме разработки
	useEffect(() => {
		logEnvironmentInfo();
	}, []);

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard');
		}
	}, [isAuthenticated, navigate]);

	// Перенаправляем на админ-логин, так как система перешла на Google 2FA
	useEffect(() => {
		navigate('/admin/login');
	}, [navigate]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-12 w-12 text-primary-600'>🔄</div>
					<h2 className='mt-6 text-3xl font-bold text-gray-900'>
						Перенаправление...
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						Система перешла на новую аутентификацию через Google 2FA
					</p>
					{isDevelopment() && (
						<div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
							<p className='text-sm text-blue-800'>
								🔄 Перенаправление на страницу входа
								администратора
							</p>
						</div>
					)}
				</div>

				<div className='text-center'>
					<Link
						to='/admin/login'
						className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
						Перейти к входу
					</Link>
				</div>
			</div>
		</div>
	);
}
