import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminInit from "./pages/AdminInit.jsx";
import AdminInvite from "./pages/AdminInvite.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";
import AdminSettingsWithTabs from "./pages/AdminSettingsWithTabs.jsx";
import Settings from "./pages/Settings.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import Transactions from "./pages/Transactions.jsx";
import GameSettings from "./pages/GameSettings.jsx";
import TokenInfo from "./pages/TokenInfo.jsx";
import Layout from "./components/Layout.jsx";
import EnvDebugger from "./components/EnvDebugger.jsx";
import UltraSimpleDebug from "./components/UltraSimpleDebug.jsx";

function ProtectedRoute({ children }) {
	const { isAuthenticated, user } = useAuth();

	console.log("🔒 ProtectedRoute: isAuthenticated =", isAuthenticated);
	console.log("🔒 ProtectedRoute: user =", user);

	if (!isAuthenticated) {
		console.log("🔒 ProtectedRoute: Redirecting to login");
		return <Navigate to="/login" replace />;
	}

	console.log("🔒 ProtectedRoute: Rendering children");
	try {
		return <>{children}</>;
	} catch (error) {
		console.error("🔒 ProtectedRoute: Error rendering children:", error);
		return <div>Error loading page</div>;
	}
}

function AppRoutes() {
	console.log("🛣️ AppRoutes: Component mounted");

	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin/init" element={<AdminInit />} />
			<Route path="/admin/invite" element={<AdminInvite />} />
			<Route path="/admin/register" element={<AdminRegister />} />

			<Route
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route path="/" element={<Navigate to="/dashboard" replace />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/users" element={<Users />} />
				<Route path="/users/:userId" element={<UserDetail />} />
				<Route path="/transactions" element={<Transactions />} />
				<Route path="/game-settings" element={<GameSettings />} />
				<Route path="/settings" element={<Settings />} />
				<Route
					path="/admin-settings-tabs"
					element={<AdminSettingsWithTabs />}
				/>
				<Route path="/token-info" element={<TokenInfo />} />
			</Route>

			{/* Fallback */}
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}

function App() {
	console.log("🚀 App: Component mounted");
	console.log("🚀 App: Environment mode:", import.meta.env.MODE);
	console.log("🚀 App: Development mode:", import.meta.env.DEV);

	return (
		<AuthProvider>
			<AppRoutes />
		</AuthProvider>
	);
}

export default App;
