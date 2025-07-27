import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminInit from './pages/AdminInit';
import AdminInvite from './pages/AdminInvite';
import AdminRegister from './pages/AdminRegister';
import AdminSettings from './pages/AdminSettings';
import AdminSettingsWithTabs from './pages/AdminSettingsWithTabs';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import TokenInfo from './pages/TokenInfo';
import Layout from './components/Layout';
import EnvDebugger from './components/EnvDebugger';
import UltraSimpleDebug from './components/UltraSimpleDebug';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, user } = useAuth();

	console.log('🔒 ProtectedRoute: isAuthenticated =', isAuthenticated);
	console.log('🔒 ProtectedRoute: user =', user);

	if (!isAuthenticated) {
		console.log('🔒 ProtectedRoute: Redirecting to login');
		return <Navigate to='/login' replace />;
	}

	console.log('🔒 ProtectedRoute: Rendering children');
	try {
		return <>{children}</>;
	} catch (error) {
		console.error('🔒 ProtectedRoute: Error rendering children:', error);
		return <div>Error loading page</div>;
	}
}

function AppRoutes() {
	console.log('🛣️ AppRoutes: Component mounted');

	return (
		<Routes>
			<Route path='/login' element={<Login />} />
			<Route path='/admin/login' element={<AdminLogin />} />
			<Route path='/admin/init' element={<AdminInit />} />
			<Route path='/admin/invite' element={<AdminInvite />} />
			<Route path='/admin/register' element={<AdminRegister />} />

			<Route
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}>
				<Route
					path='/'
					element={<Navigate to='/dashboard' replace />}
				/>
				<Route path='/dashboard' element={<Dashboard />} />
				<Route path='/users' element={<Users />} />
				<Route path='/settings' element={<Settings />} />
				<Route path='/admin-settings' element={<AdminSettings />} />
				<Route
					path='/admin-settings-tabs'
					element={<AdminSettingsWithTabs />}
				/>
				<Route path='/token-info' element={<TokenInfo />} />
			</Route>

			{/* Fallback */}
			<Route path='*' element={<Navigate to='/dashboard' replace />} />
		</Routes>
	);
}

function App() {
	console.log('🚀 App: Component mounted');
	console.log('🚀 App: Environment mode:', import.meta.env.MODE);
	console.log('🚀 App: Development mode:', import.meta.env.DEV);

	return (
		<AuthProvider>
			<AppRoutes />
		</AuthProvider>
	);
}

export default App;
