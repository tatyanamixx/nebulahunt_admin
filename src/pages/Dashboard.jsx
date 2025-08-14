import { useAuth } from "../contexts/AuthContext.jsx";

export default function Dashboard() {
	const { isAuthenticated } = useAuth();

	// Не показываем компонент, если пользователь не аутентифицирован
	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-white">Dashboard</h1>
				<p className="mt-1 text-sm text-gray-400">
					Welcome to the admin panel
				</p>
			</div>

			<div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
				<h2 className="text-lg font-medium text-white mb-4">
					Welcome to Admin Panel
				</h2>
				<p className="text-gray-400">
					Dashboard is temporarily disabled for testing login
					functionality.
				</p>
			</div>
		</div>
	);
}
