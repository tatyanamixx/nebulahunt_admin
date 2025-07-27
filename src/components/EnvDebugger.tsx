import React, { useEffect } from 'react';
import { isDevelopment } from '../lib/env';

export default function EnvDebugger() {
	useEffect(() => {
		if (isDevelopment()) {
			console.log('=== Environment Variables Debug ===');
			console.log('MODE:', import.meta.env.MODE);
			console.log('DEV:', import.meta.env.DEV);
			console.log('PROD:', import.meta.env.PROD);
			console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
			console.log(
				'VITE_GOOGLE_CLIENT_ID:',
				import.meta.env.VITE_GOOGLE_CLIENT_ID
			);
			console.log(
				'VITE_GOOGLE_CLIENT_ID length:',
				import.meta.env.VITE_GOOGLE_CLIENT_ID?.length
			);
			console.log(
				'VITE_GOOGLE_CLIENT_ID type:',
				typeof import.meta.env.VITE_GOOGLE_CLIENT_ID
			);
			console.log('====================================');
		}
	}, []);

	// Этот компонент не рендерит ничего видимого
	return null;
}
