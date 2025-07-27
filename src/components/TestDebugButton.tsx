import React, { useState } from 'react';

export default function TestDebugButton() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) {
		return (
			<div className='fixed bottom-4 right-4 z-50'>
				<button
					onClick={() => setIsVisible(true)}
					className='bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700'>
					🔴 Test Debug
				</button>
			</div>
		);
	}

	return (
		<div className='fixed bottom-4 right-4 z-50'>
			<div className='bg-red-800 border border-red-600 rounded-lg shadow-lg p-4'>
				<div className='flex items-center justify-between mb-2'>
					<h3 className='text-white font-semibold text-sm'>
						🔴 Test Debug Panel
					</h3>
					<button
						onClick={() => setIsVisible(false)}
						className='text-red-300 hover:text-white text-sm'>
						✕
					</button>
				</div>
				<div className='text-xs text-red-200 space-y-1'>
					<div>✅ Debug Panel is working!</div>
					<div>Environment: {import.meta.env.MODE}</div>
					<div>Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
					<div>
						Client ID:{' '}
						{import.meta.env.VITE_GOOGLE_CLIENT_ID
							? 'Set'
							: 'Not set'}
					</div>
				</div>
			</div>
		</div>
	);
}
