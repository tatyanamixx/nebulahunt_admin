import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
	LayoutDashboard,
	Users,
	Settings,
	LogOut,
	Menu,
	X,
	Shield,
	Table,
	Gamepad2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils.js";
import { isDevelopment } from "../lib/env.js";
import DebugPanel from "./DebugPanel.jsx";
import TestDebugButton from "./TestDebugButton.jsx";
import SimpleDebugButton from "./SimpleDebugButton.jsx";
// import PasswordStatus from './PasswordStatus';

const navigation = [
	{ name: "Dashboard", href: "/", icon: LayoutDashboard },
	{ name: "Users", href: "/users", icon: Users },
	{ name: "Game Settings", href: "/game-settings", icon: Gamepad2 },
	{
		name: "Admin Settings",
		href: "/admin-settings-tabs",
		icon: Table,
	},
	{ name: "Token Info", href: "/token-info", icon: Shield },
];

export default function Layout() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Debug: Log navigation items
	console.log(
		"Navigation items:",
		navigation.map((item) => item.name)
	);

	// Отладочная информация отключена для тестирования

	return (
		<div className="min-h-screen bg-gray-900">
			{/* Mobile sidebar */}
			<div
				className={cn(
					"fixed inset-0 z-50 lg:hidden",
					sidebarOpen ? "block" : "hidden"
				)}
			>
				<div
					className="fixed inset-0 bg-gray-600 bg-opacity-75"
					onClick={() => setSidebarOpen(false)}
				/>
				<div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-800">
					<div className="flex h-16 items-center justify-between px-4">
						<h1 className="text-lg font-semibold text-white">
							Nebulahunt Admin
						</h1>
						<button
							onClick={() => setSidebarOpen(false)}
							className="text-gray-400 hover:text-white"
							aria-label="Close sidebar"
						>
							<X className="h-6 w-6" />
						</button>
					</div>
					<nav className="flex-1 space-y-1 px-2 py-4">
						{navigation.map((item) => {
							const isActive = location.pathname === item.href;
							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"group flex items-center px-2 py-2 text-sm font-medium rounded-md",
										isActive
											? "bg-blue-600 text-white"
											: "text-gray-300 hover:bg-gray-700 hover:text-white"
									)}
									onClick={() => setSidebarOpen(false)}
								>
									<item.icon className="mr-3 h-5 w-5" />
									{item.name}
								</Link>
							);
						})}
					</nav>
				</div>
			</div>

			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
				<div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700">
					<div className="flex h-16 items-center px-4">
						<h1 className="text-lg font-semibold text-white">
							Nebulahunt Admin
						</h1>
					</div>
					<nav className="flex-1 space-y-1 px-2 py-4">
						{navigation.map((item) => {
							const isActive = location.pathname === item.href;
							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"group flex items-center px-2 py-2 text-sm font-medium rounded-md",
										isActive
											? "bg-blue-600 text-white"
											: "text-gray-300 hover:bg-gray-700 hover:text-white"
									)}
								>
									<item.icon className="mr-3 h-5 w-5" />
									{item.name}
								</Link>
							);
						})}
					</nav>
				</div>
			</div>

			{/* Main content */}
			<div className="lg:pl-64">
				{/* Top bar */}
				<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
					<button
						type="button"
						className="-m-2.5 p-2.5 text-gray-300 lg:hidden"
						onClick={() => setSidebarOpen(true)}
						aria-label="Open sidebar"
					>
						<Menu className="h-6 w-6" />
					</button>

					<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
						<div className="flex flex-1" />
						<div className="flex items-center gap-x-4 lg:gap-x-6">
							{/* Password Status temporarily disabled */}
							<div className="flex items-center gap-x-2">
								<span className="text-sm text-gray-300">
									{user?.username}
								</span>
								<button
									onClick={logout}
									className="flex items-center gap-x-2 text-sm text-gray-300 hover:text-white"
								>
									<LogOut className="h-4 w-4" />
									Logout
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="py-6 bg-gray-900">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>

			{/* Debug components disabled for testing */}
		</div>
	);
}
