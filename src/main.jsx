import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

// Отладочная информация о переменных окружения
console.log('🚀 App starting...');
console.log('🔍 import.meta.env:', import.meta.env);
console.log('🔍 All env variables:', {
	VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
	VITE_API_URL: import.meta.env.VITE_API_URL,
	VITE_ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API,
	VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
	VITE_ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA,
	VITE_ENABLE_TELEGRAM_AUTH: import.meta.env.VITE_ENABLE_TELEGRAM_AUTH,
	DEV: import.meta.env.DEV,
	MODE: import.meta.env.MODE,
	BASE_URL: import.meta.env.BASE_URL,
});

// Импортируем env для инициализации
import './lib/env.js';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
			<Toaster
				position='top-right'
				toastOptions={{
					duration: 4000,
					style: {
						background: '#363636',
						color: '#fff',
					},
				}}
			/>
		</BrowserRouter>
	</React.StrictMode>
);
