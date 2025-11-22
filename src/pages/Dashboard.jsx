import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../lib/api.js";

export default function Dashboard() {
	const { isAuthenticated } = useAuth();
	const [reminderStats, setReminderStats] = useState(null);
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [message, setMessage] = useState(null);

	// Custom notification state
	const [customMessage, setCustomMessage] = useState("");
	const [photoFile, setPhotoFile] = useState(null);
	const [showOpenGameButton, setShowOpenGameButton] = useState(false);
	const [showCommunityButton, setShowCommunityButton] = useState(false);
	const [sendingCustom, setSendingCustom] = useState(false);
	const [customMessageResult, setCustomMessageResult] = useState(null);

	// Test payment mode state
	const [testPaymentMode, setTestPaymentMode] = useState(false);
	const [testPaymentModeLoading, setTestPaymentModeLoading] = useState(true);

	// Не показываем компонент, если пользователь не аутентифицирован
	if (!isAuthenticated) {
		return null;
	}

	// Load reminder stats
	useEffect(() => {
		loadStats();
		fetchTestPaymentMode();
	}, []);

	const fetchTestPaymentMode = async () => {
		try {
			const response = await api.get("/admin/test-payment-mode");
			setTestPaymentMode(response.data.enabled);
		} catch (error) {
			console.error("Error loading test payment mode:", error);
		} finally {
			setTestPaymentModeLoading(false);
		}
	};

	const handleTestPaymentModeToggle = async (enabled) => {
		try {
			const response = await api.put("/admin/test-payment-mode", {
				enabled,
			});
			setTestPaymentMode(response.data.enabled);
			setCustomMessageResult({
				type: "success",
				text:
					response.data.message ||
					(enabled
						? "Тестовый режим платежей включен (цена = 1 звезда)"
						: "Тестовый режим платежей выключен"),
			});
		} catch (error) {
			console.error("Error updating test payment mode:", error);
			setCustomMessageResult({
				type: "error",
				text: "Ошибка при обновлении тестового режима платежей",
			});
		}
	};

	const loadStats = async () => {
		try {
			setLoading(true);
			const response = await api.get("/admin/reminders/stats");
			setReminderStats(response.data.stats);
		} catch (error) {
			console.error("Failed to load reminder stats:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSendReminders = async () => {
		if (
			!confirm(
				"Send reminder notifications to ALL users with reminders enabled? (Force mode)"
			)
		) {
			return;
		}

		try {
			setSending(true);
			setMessage(null);
			const response = await api.post("/admin/reminders/trigger", {
				force: true,
			});

			setMessage({
				type: "success",
				text: response.data.message || "Reminders sent successfully!",
			});

			// Reload stats
			await loadStats();
		} catch (error) {
			console.error("Failed to send reminders:", error);
			setMessage({
				type: "error",
				text:
					error.response?.data?.message ||
					"Failed to send reminders. Check console for details.",
			});
		} finally {
			setSending(false);
		}
	};

	const handleSendCustomNotification = async () => {
		if (!customMessage.trim()) {
			setCustomMessageResult({
				type: "error",
				text: "Message is required",
			});
			return;
		}

		if (
			!confirm(
				"Send custom notification to ALL users? This may take a while..."
			)
		) {
			return;
		}

		try {
			setSendingCustom(true);
			setCustomMessageResult(null);

			// Use FormData if file is present, otherwise JSON
			const formData = new FormData();
			formData.append("message", customMessage.trim());
			formData.append("userIds", JSON.stringify(null)); // null = send to all users
			formData.append("showOpenGameButton", showOpenGameButton);
			formData.append("showCommunityButton", showCommunityButton);
			if (photoFile) {
				formData.append("photo", photoFile);
			}

			const response = await api.post(
				"/admin/reminders/send-custom",
				formData,
				{
					// Don't set Content-Type - let browser set it with boundary
				}
			);

			setCustomMessageResult({
				type: "success",
				text:
					response.data.message ||
					`Custom notification sent! Sent: ${
						response.data.data?.sent || 0
					}, Failed: ${response.data.data?.failed || 0}`,
			});

			// Clear form
			setCustomMessage("");
			setPhotoFile(null);
			setShowOpenGameButton(false);
			setShowCommunityButton(false);
		} catch (error) {
			console.error("Failed to send custom notification:", error);
			setCustomMessageResult({
				type: "error",
				text:
					error.response?.data?.message ||
					"Failed to send custom notification. Check console for details.",
			});
		} finally {
			setSendingCustom(false);
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			<div>
				<h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
				<p className="mt-1 text-xs sm:text-sm text-gray-400">
					Welcome to the admin panel
				</p>
			</div>

			{/* Info Card */}
			<div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-4 sm:p-6">
				<h2 className="text-lg font-medium text-white mb-4">
					Welcome to Admin Panel
				</h2>
				<p className="text-gray-400">
					Use the menu on the left to navigate through different sections.
				</p>
			</div>

			{/* Reminder Management Card */}
			<div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-4 sm:p-6">
				<h2 className="text-base sm:text-lg font-medium text-white mb-4">
					📬 Reminder Notifications
				</h2>

				{/* Stats */}
				{loading ? (
					<p className="text-gray-400 mb-4 text-sm">Loading stats...</p>
				) : reminderStats ? (
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
						<div className="bg-gray-700 p-3 sm:p-4 rounded">
							<div className="text-gray-400 text-xs sm:text-sm">Enabled</div>
							<div className="text-xl sm:text-2xl font-bold text-green-400">
								{reminderStats.enabled}
							</div>
						</div>
						<div className="bg-gray-700 p-3 sm:p-4 rounded">
							<div className="text-gray-400 text-xs sm:text-sm">Disabled</div>
							<div className="text-xl sm:text-2xl font-bold text-gray-400">
								{reminderStats.disabled}
							</div>
						</div>
						<div className="bg-gray-700 p-3 sm:p-4 rounded">
							<div className="text-gray-400 text-xs sm:text-sm">Sent (24h)</div>
							<div className="text-xl sm:text-2xl font-bold text-blue-400">
								{reminderStats.recentlyNotified}
							</div>
						</div>
						<div className="bg-gray-700 p-3 sm:p-4 rounded">
							<div className="text-gray-400 text-xs sm:text-sm">Never Sent</div>
							<div className="text-xl sm:text-2xl font-bold text-yellow-400">
								{reminderStats.neverNotified}
							</div>
						</div>
					</div>
				) : null}

				{/* Message */}
				{message && (
					<div
						className={`mb-4 p-4 rounded ${
							message.type === "success"
								? "bg-green-900/30 border border-green-600 text-green-400"
								: "bg-red-900/30 border border-red-600 text-red-400"
						}`}
					>
						{message.text}
					</div>
				)}

				{/* Button */}
				<button
					onClick={handleSendReminders}
					disabled={sending}
					className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
				>
					{sending ? "Sending..." : "🚀 Send Reminders Now"}
				</button>

				<p className="text-sm text-gray-400 mt-4">
					📅 Automatic reminders are scheduled for 10:00 and 18:00 UTC
					daily.
					<br />
					This button manually triggers immediate reminder checks and sends
					notifications to inactive users.
				</p>
			</div>

			{/* Custom Notification Card */}
			<div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-4 sm:p-6">
				<h2 className="text-base sm:text-lg font-medium text-white mb-4">
					📨 Custom Notifications
				</h2>

				{/* Message */}
				{customMessageResult && (
					<div
						className={`mb-4 p-4 rounded ${
							customMessageResult.type === "success"
								? "bg-green-900/30 border border-green-600 text-green-400"
								: "bg-red-900/30 border border-red-600 text-red-400"
						}`}
					>
						{customMessageResult.text}
					</div>
				)}

				{/* Message Text */}
				<div className="mb-4">
					<label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
						Message Text
					</label>
					<textarea
						value={customMessage}
						onChange={(e) => setCustomMessage(e.target.value)}
						placeholder="Enter your message here... You can use line breaks and emojis 🚀"
						className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
						rows={4}
					/>
					<p className="text-xs text-gray-400 mt-1">
						💡 Just write your text with line breaks and emojis - no HTML
						needed!
					</p>
				</div>

				{/* Photo File */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Photo (optional)
					</label>
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setPhotoFile(e.target.files[0] || null)}
						className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{photoFile && (
						<p className="text-xs text-green-400 mt-1">
							✅ Selected: {photoFile.name} (
							{(photoFile.size / 1024).toFixed(1)} KB)
						</p>
					)}
					<p className="text-xs text-gray-400 mt-1">
						💡 Select an image file (JPG, PNG, etc.) to attach to the
						message
					</p>
				</div>

				{/* Buttons */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Buttons
					</label>
					<div className="space-y-2">
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="checkbox"
								checked={showOpenGameButton}
								onChange={(e) =>
									setShowOpenGameButton(e.target.checked)
								}
								className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
							/>
							<span className="text-gray-300">🎮 Open Game</span>
						</label>
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="checkbox"
								checked={showCommunityButton}
								onChange={(e) =>
									setShowCommunityButton(e.target.checked)
								}
								className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
							/>
							<span className="text-gray-300">💬 Community</span>
						</label>
					</div>
				</div>

				{/* Send Button */}
				<button
					onClick={handleSendCustomNotification}
					disabled={sendingCustom || !customMessage.trim()}
					className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
				>
					{sendingCustom ? "Sending..." : "📤 Send Custom Notification"}
				</button>

				<p className="text-sm text-gray-400 mt-4">
					💡 Notification will be sent to ALL users. You can add buttons to
					the message by checking the boxes above.
				</p>
			</div>

			{/* Test Payment Mode Toggle */}
			<div className="bg-yellow-900/30 border-2 border-yellow-600 shadow-lg rounded-lg p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
					<div className="flex-shrink-0">
						<div className="inline-flex items-center justify-center p-3 rounded-md bg-yellow-500 text-yellow-900">
							<span className="text-2xl sm:text-3xl">🧪</span>
						</div>
					</div>
					<div className="flex-1 min-w-0">
						<label className="block text-base sm:text-lg font-bold text-yellow-200">
							🧪 Тестовый режим платежей
						</label>
						<p className="text-sm sm:text-base text-yellow-300 mt-2 font-medium">
							Когда включен, все платежи будут стоить 1 звезду вместо
							реальной цены. Полезно для тестирования платежной системы.
						</p>
						<div className="mt-4">
							{testPaymentModeLoading ? (
								<div className="h-6 w-6 animate-spin border-2 border-yellow-400 border-t-transparent rounded-full" />
							) : (
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={testPaymentMode}
										onChange={(e) =>
											handleTestPaymentModeToggle(e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
									<span className="ml-4 text-base font-bold text-yellow-200">
										{testPaymentMode ? "✅ ВКЛЮЧЕН" : "❌ ВЫКЛЮЧЕН"}
									</span>
								</label>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
