import { useState, useEffect } from "react";
import { Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

export default function GameConstantsTab() {
	const [constants, setConstants] = useState({
		ECONOMY: {
			INITIAL_STARDUST: 0,
			INITIAL_DARK_MATTER: 0,
			INITIAL_STARS: 0,
		},
	});
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	// Загружаем текущие константы при монтировании
	useEffect(() => {
		loadConstants();
	}, []);

	const loadConstants = async () => {
		setLoading(true);
		try {
			const accessToken = localStorage.getItem("accessToken");
			console.log(
				"🔐 GameConstantsTab: Access token:",
				accessToken ? accessToken.substring(0, 50) + "..." : "none"
			);

			if (!accessToken) {
				setMessage({
					type: "error",
					text: "No access token found. Please login again.",
				});
				return;
			}

			// Проверяем валидность токена
			try {
				const payload = JSON.parse(atob(accessToken.split(".")[1]));
				console.log("🔐 GameConstantsTab: Token payload:", payload);
				console.log(
					"🔐 GameConstantsTab: Token expires at:",
					new Date(payload.exp * 1000)
				);
				console.log("🔐 GameConstantsTab: Current time:", new Date());

				if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
					setMessage({
						type: "error",
						text: "Token expired. Please refresh the page.",
					});
					return;
				}
			} catch (tokenError) {
				console.error(
					"🔐 GameConstantsTab: Token parsing error:",
					tokenError
				);
				setMessage({
					type: "error",
					text: "Invalid token format. Please login again.",
				});
				return;
			}

			console.log(
				"🔐 GameConstantsTab: Making request to /api/admin/game-constants"
			);
			const response = await fetch("/api/admin/game-constants", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setConstants(data.data);
					setMessage({
						type: "success",
						text: "Constants loaded successfully",
					});
				} else {
					setMessage({ type: "error", text: "Failed to load constants" });
				}
			} else {
				setMessage({ type: "error", text: "Failed to load constants" });
			}
		} catch (error) {
			console.error("Error loading constants:", error);
			setMessage({ type: "error", text: "Error loading constants" });
		} finally {
			setLoading(false);
		}
	};

	const saveConstants = async () => {
		setSaving(true);
		try {
			const accessToken = localStorage.getItem("accessToken");
			if (!accessToken) {
				setMessage({
					type: "error",
					text: "No access token found. Please login again.",
				});
				return;
			}

			const response = await fetch("/api/admin/game-constants", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ constants }),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setMessage({
						type: "success",
						text: "Constants updated successfully!",
					});
					// Перезагружаем константы для отображения актуальных значений
					await loadConstants();
				} else {
					setMessage({
						type: "error",
						text: data.message || "Failed to update constants",
					});
				}
			} else {
				const errorData = await response.json();
				setMessage({
					type: "error",
					text: errorData.message || "Failed to update constants",
				});
			}
		} catch (error) {
			console.error("Error saving constants:", error);
			setMessage({ type: "error", text: "Error saving constants" });
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (section, key, value) => {
		setConstants((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[key]: parseInt(value) || 0,
			},
		}));
	};

	const clearMessage = () => {
		setMessage({ type: "", text: "" });
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium text-white">
						Game Constants
					</h3>
					<p className="text-gray-400">
						Manage initial resources and game economy settings
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<button
						onClick={loadConstants}
						disabled={loading}
						className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
					>
						<RefreshCw
							className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
						/>
						<span>Refresh</span>
					</button>
				</div>
			</div>

			{/* Message */}
			{message.text && (
				<div
					className={`p-4 rounded-lg border ${
						message.type === "success"
							? "bg-green-900/20 border-green-700 text-green-400"
							: "bg-red-900/20 border-red-700 text-red-400"
					}`}
				>
					<div className="flex items-center space-x-2">
						{message.type === "success" ? (
							<CheckCircle className="h-5 w-5" />
						) : (
							<AlertCircle className="h-5 w-5" />
						)}
						<span>{message.text}</span>
						<button
							onClick={clearMessage}
							className="ml-auto text-gray-400 hover:text-gray-300"
						>
							×
						</button>
					</div>
				</div>
			)}

			{/* Constants Form */}
			<div className="bg-gray-750 rounded-lg p-6 border border-gray-700">
				{/* Economy Section */}
				<div className="space-y-4">
					<h4 className="text-md font-medium text-white border-b border-gray-700 pb-2">
						Initial Resources
					</h4>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Initial Stardust
							</label>
							<input
								type="number"
								value={constants.ECONOMY?.INITIAL_STARDUST || 0}
								onChange={(e) =>
									handleInputChange(
										"ECONOMY",
										"INITIAL_STARDUST",
										e.target.value
									)
								}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="5000"
								min="0"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Starting stardust for new users
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Initial Dark Matter
							</label>
							<input
								type="number"
								value={constants.ECONOMY?.INITIAL_DARK_MATTER || 0}
								onChange={(e) =>
									handleInputChange(
										"ECONOMY",
										"INITIAL_DARK_MATTER",
										e.target.value
									)
								}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="10"
								min="0"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Starting dark matter for new users
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Initial Stars
							</label>
							<input
								type="number"
								value={constants.ECONOMY?.INITIAL_STARS || 0}
								onChange={(e) =>
									handleInputChange(
										"ECONOMY",
										"INITIAL_STARS",
										e.target.value
									)
								}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="1000"
								min="0"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Starting stars for new users
							</p>
						</div>
					</div>
				</div>

				{/* Save Button */}
				<div className="mt-6 pt-4 border-t border-gray-700">
					<button
						onClick={saveConstants}
						disabled={saving || loading}
						className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
					>
						<Save className="h-4 w-4" />
						<span>{saving ? "Saving..." : "Save Changes"}</span>
					</button>
				</div>
			</div>

			{/* Info Box */}
			<div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
				<div className="flex items-start space-x-3">
					<AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
					<div className="text-sm text-blue-300">
						<h4 className="font-medium mb-2">Important Notes:</h4>
						<ul className="space-y-1 text-blue-200">
							<li>
								• Changes only affect new users - existing users are
								not modified
							</li>
							<li>
								• Constants are updated in real-time without server
								restart
							</li>
							<li>• All values must be non-negative integers</li>
							<li>
								• Changes take effect immediately for new
								registrations
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
