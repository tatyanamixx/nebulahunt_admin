import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminInit from './pages/AdminInit';
import AdminInvite from './pages/AdminInvite';
import AdminRegister from './pages/AdminRegister';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	return <>{children}</>;
}

function AppRoutes() {
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
			</Route>

			{/* Фолбэк */}
			<Route path='*' element={<Navigate to='/dashboard' replace />} />
		</Routes>
	);
}

function App() {
	return (
		<AuthProvider>
			<AppRoutes />
		</AuthProvider>
	);
}

export default App;
