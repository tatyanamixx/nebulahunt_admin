import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../lib/api.js";
import { isDevelopment } from "../lib/env.js";

export default function DebugPanel() {
	const { user, isAuthenticated } = useAuth();
	const [debugInfo, setDebugInfo] = useState({
		environment: {
			mode: import.meta.env.MODE,
			dev: import.meta.env.DEV,
			prod: import.meta.env.PROD,
			apiUrl: import.meta.env.VITE_API_URL || "/api",
			googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "not_set",
		},
		auth: {
			isAuthenticated,
			user,
			hasAccessToken: !!localStorage.getItem("accessToken"),
			hasRefreshToken: !!localStorage.getItem("refreshToken"),
		},
		google: {
			scriptLoaded: false,
			oauthAvailable: false,
		},
		network: {
			apiStatus: "checking",
			lastCheck: new Date().toLocaleTimeString(),
		},
	});

	const [isExpanded, setIsExpanded] = useState(false);
	const [isVisible, setIsVisible] = useState(true); // Всегда показываем в режиме разработки

	useEffect(() => {
		// Отладочная информация о компоненте
		console.log("🐛 DebugPanel: Component mounted");
		console.log("🐛 DebugPanel: isDevelopment() =", isDevelopment());
		console.log("🐛 DebugPanel: isVisible =", isVisible);

		// Проверяем Google OAuth
		const checkGoogleOAuth = () => {
			const scriptLoaded = !!document.querySelector(
				'script[src*="accounts.google.com"]'
			);
			const oauthAvailable = !!window.google?.accounts?.oauth2;

			setDebugInfo((prev) => ({
				...prev,
				google: {
					scriptLoaded,
					oauthAvailable,
				},
			}));
		};

		// Проверяем API статус
		const checkApiStatus = async () => {
			try {
				await api.get("/health");
				setDebugInfo((prev) => ({
					...prev,
					network: {
						apiStatus: "online",
						lastCheck: new Date().toLocaleTimeString(),
					},
				}));
			} catch (error) {
				setDebugInfo((prev) => ({
					...prev,
					network: {
						apiStatus: "error",
						lastCheck: new Date().toLocaleTimeString(),
					},
				}));
			}
		};

		// Проверяем токены
		const checkTokens = () => {
			const accessToken = localStorage.getItem("accessToken");
			const refreshToken = localStorage.getItem("refreshToken");

			let tokenExpiry;
			if (accessToken) {
				try {
					const payload = JSON.parse(atob(accessToken.split(".")[1]));
					const expiryDate = new Date(payload.exp * 1000);
					tokenExpiry = expiryDate.toLocaleString();
				} catch (error) {
					tokenExpiry = "invalid_token";
				}
			}

			setDebugInfo((prev) => ({
				...prev,
				auth: {
					...prev.auth,
					hasAccessToken: !!accessToken,
					hasRefreshToken: !!refreshToken,
					tokenExpiry,
				},
			}));
		};

		// Инициализация
		checkGoogleOAuth();
		checkApiStatus();
		checkTokens();

		// Периодические проверки
		const interval = setInterval(() => {
			checkGoogleOAuth();
			checkApiStatus();
			checkTokens();
		}, 5000);

		return () => clearInterval(interval);
	}, [isAuthenticated, user]);

	const getStatusColor = (status) => {
		switch (status) {
			case "online":
				return "text-green-400";
			case "offline":
				return "text-red-400";
			case "error":
				return "text-yellow-400";
			default:
				return "text-gray-400";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "online":
				return "🟢";
			case "offline":
				return "🔴";
			case "error":
				return "🟡";
			default:
				return "⚪";
		}
	};

	if (!isVisible) {
		console.log("🐛 DebugPanel: Rendering collapsed button");
		return (
			<div className="fixed bottom-4 right-4 z-50">
				<button
					onClick={() => setIsVisible(true)}
					className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700"
				>
					🐛 Debug
				</button>
			</div>
		);
	}

	console.log("🐛 DebugPanel: Rendering full panel");
	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-md">
			<div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-gray-600">
					<h3 className="text-white font-semibold text-sm">
						🐛 Debug Panel
					</h3>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="text-gray-400 hover:text-white text-sm"
						>
							{isExpanded ? "▼" : "▶"}
						</button>
						<button
							onClick={() => setIsVisible(false)}
							className="text-gray-400 hover:text-white text-sm"
						>
							✕
						</button>
					</div>
				</div>

				{/* Content */}
				{isExpanded && (
					<div className="p-3 space-y-3 text-xs">
						{/* Environment */}
						<div>
							<h4 className="text-white font-medium mb-2">
								Environment
							</h4>
							<div className="space-y-1 text-gray-300">
								<div>
									Mode:{" "}
									<span className="text-blue-400">
										{debugInfo.environment.mode}
									</span>
								</div>
								<div>
									Dev:{" "}
									<span
										className={
											debugInfo.environment.dev
												? "text-green-400"
												: "text-red-400"
										}
									>
										{debugInfo.environment.dev ? "Yes" : "No"}
									</span>
								</div>
								<div>
									API URL:{" "}
									<span className="text-blue-400">
										{debugInfo.environment.apiUrl}
									</span>
								</div>
								<div>
									Google Client ID:{" "}
									<span className="text-blue-400">
										{debugInfo.environment.googleClientId.substring(
											0,
											20
										)}
										...
									</span>
								</div>
							</div>
						</div>

						{/* Authentication */}
						<div>
							<h4 className="text-white font-medium mb-2">
								Authentication
							</h4>
							<div className="space-y-1 text-gray-300">
								<div>
									Authenticated:{" "}
									<span
										className={
											debugInfo.auth.isAuthenticated
												? "text-green-400"
												: "text-red-400"
										}
									>
										{debugInfo.auth.isAuthenticated
											? "Yes"
											: "No"}
									</span>
								</div>
								<div>
									Access Token:{" "}
									<span
										className={
											debugInfo.auth.hasAccessToken
												? "text-green-400"
												: "text-red-400"
										}
									>
										{debugInfo.auth.hasAccessToken
											? "Present"
											: "Missing"}
									</span>
								</div>
								<div>
									Refresh Token:{" "}
									<span
										className={
											debugInfo.auth.hasRefreshToken
												? "text-green-400"
												: "text-red-400"
										}
									>
										{debugInfo.auth.hasRefreshToken
											? "Present"
											: "Missing"}
									</span>
								</div>
								{debugInfo.auth.tokenExpiry && (
									<div>
										Token Expires:{" "}
										<span className="text-yellow-400">
											{debugInfo.auth.tokenExpiry}
										</span>
									</div>
								)}
								{debugInfo.auth.user && (
									<div>
										User ID:{" "}
										<span className="text-blue-400">
											{debugInfo.auth.user.id}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Google OAuth */}
						<div>
							<h4 className="text-white font-medium mb-2">
								Google OAuth
							</h4>
							<div className="space-y-1 text-gray-300">
								<div>
									Script Loaded:{" "}
									<span
										className={
											debugInfo.google.scriptLoaded
												? "text-green-400"
												: "text-red-400"
										}
									>
										{debugInfo.google.scriptLoaded
											? "Yes"
											: "No"}
									</span>
								</div>
								<div>
									OAuth Available:{" "}
									<span
										className={
											debugInfo.google.oauthAvailable
												? "text-green-400"
												: "text-red-400"
										}
									>
										{debugInfo.google.oauthAvailable
											? "Yes"
											: "No"}
									</span>
								</div>
							</div>
						</div>

						{/* Network */}
						<div>
							<h4 className="text-white font-medium mb-2">Network</h4>
							<div className="space-y-1 text-gray-300">
								<div>
									API Status:{" "}
									<span
										className={getStatusColor(
											debugInfo.network.apiStatus
										)}
									>
										{getStatusIcon(debugInfo.network.apiStatus)}{" "}
										{debugInfo.network.apiStatus}
									</span>
								</div>
								<div>
									Last Check:{" "}
									<span className="text-blue-400">
										{debugInfo.network.lastCheck}
									</span>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="pt-2 border-t border-gray-600">
							<div className="flex space-x-2">
								<button
									onClick={() => {
										localStorage.clear();
										window.location.reload();
									}}
									className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
								>
									Clear Storage
								</button>
								<button
									onClick={() => window.location.reload()}
									className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
								>
									Reload
								</button>
								<button
									onClick={() => {
										console.log("Debug Info:", debugInfo);
										console.log(
											"Local Storage:",
											Object.fromEntries(
												Object.entries(localStorage)
											)
										);
									}}
									className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
								>
									Log to Console
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Collapsed view */}
				{!isExpanded && (
					<div className="p-3">
						<div className="flex items-center justify-between text-xs">
							<div className="text-gray-300">
								<span
									className={
										debugInfo.auth.isAuthenticated
											? "text-green-400"
											: "text-red-400"
									}
								>
									{debugInfo.auth.isAuthenticated ? "🔐" : "🔓"}
								</span>
								<span
									className={getStatusColor(
										debugInfo.network.apiStatus
									)}
								>
									{getStatusIcon(debugInfo.network.apiStatus)}
								</span>
							</div>
							<div className="text-gray-400">
								{debugInfo.auth.user?.email || "Not logged in"}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
