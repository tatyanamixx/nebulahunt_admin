import { cn } from '../lib/utils';

interface AccountInfoTabProps {
	user: any;
	is2FAEnabled: boolean;
}

export function AccountInfoTab({ user, is2FAEnabled }: AccountInfoTabProps) {
	return (
		<div className='space-y-6'>
			<div className='bg-gray-700 shadow rounded-lg border border-gray-600 p-6'>
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

			<div className='bg-gray-700 shadow rounded-lg border border-gray-600 p-6'>
				<h2 className='text-lg font-medium text-white mb-4'>
					📊 Account Statistics
				</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='bg-gray-600 p-4 rounded-lg'>
						<h3 className='text-sm font-medium text-gray-300 mb-2'>
							Account Type
						</h3>
						<p className='text-white font-semibold'>{user?.role}</p>
					</div>
					<div className='bg-gray-600 p-4 rounded-lg'>
						<h3 className='text-sm font-medium text-gray-300 mb-2'>
							Security Level
						</h3>
						<p className='text-white font-semibold'>
							{is2FAEnabled ? 'High (2FA Enabled)' : 'Standard'}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
