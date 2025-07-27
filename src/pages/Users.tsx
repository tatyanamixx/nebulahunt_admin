import { useAuth } from '../contexts/AuthContext';

export default function Users() {
	const { isAuthenticated } = useAuth();

	// Не показываем компонент, если пользователь не аутентифицирован
	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-white'>
					User Management
				</h1>
				<p className='mt-1 text-sm text-gray-400'>
					View and manage system users
				</p>
			</div>

			<div className='bg-gray-800 shadow rounded-lg border border-gray-700 p-6'>
				<h2 className='text-lg font-medium text-white mb-4'>
					User Management
				</h2>
				<p className='text-gray-400'>
					User management is temporarily disabled for testing login
					functionality.
				</p>
			</div>
		</div>
	);
}
