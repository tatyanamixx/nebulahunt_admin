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
	const [showOpenGameButton, setShowOpenGameButton] = useState(false);
	const [showCommunityButton, setShowCommunityButton] = useState(false);
	const [sendingCustom, setSendingCustom] = useState(false);
	const [customMessageResult, setCustomMessageResult] = useState(null);

	// Не показываем компонент, если пользователь не аутентифицирован
	if (!isAuthenticated) {
		return null;
	}

	// Load reminder stats
	useEffect(() => {
		loadStats();
	}, []);

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
			const response = await api.post("/admin/reminders/send-custom", {
				message: customMessage.trim(),
				userIds: null, // null = send to all users
				showOpenGameButton,
				showCommunityButton,
			});

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
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-white">Dashboard</h1>
				<p className="mt-1 text-sm text-gray-400">
					Welcome to the admin panel
				</p>
			</div>

			{/* Reminder Management Card */}
			<div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
				<h2 className="text-lg font-medium text-white mb-4">
					📬 Reminder Notifications
				</h2>

				{/* Stats */}
				{loading ? (
					<p className="text-gray-400 mb-4">Loading stats...</p>
				) : reminderStats ? (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
						<div className="bg-gray-700 p-4 rounded">
							<div className="text-gray-400 text-sm">Enabled</div>
							<div className="text-2xl font-bold text-green-400">
								{reminderStats.enabled}
							</div>
						</div>
						<div className="bg-gray-700 p-4 rounded">
							<div className="text-gray-400 text-sm">Disabled</div>
							<div className="text-2xl font-bold text-gray-400">
								{reminderStats.disabled}
							</div>
						</div>
						<div className="bg-gray-700 p-4 rounded">
							<div className="text-gray-400 text-sm">Sent (24h)</div>
							<div className="text-2xl font-bold text-blue-400">
								{reminderStats.recentlyNotified}
							</div>
						</div>
						<div className="bg-gray-700 p-4 rounded">
							<div className="text-gray-400 text-sm">Never Sent</div>
							<div className="text-2xl font-bold text-yellow-400">
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
			<div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
				<h2 className="text-lg font-medium text-white mb-4">
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
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Message Text
					</label>
					<textarea
						value={customMessage}
						onChange={(e) => setCustomMessage(e.target.value)}
						placeholder="Enter your message here... You can use line breaks and emojis 🚀"
						className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows={6}
					/>
					<p className="text-xs text-gray-400 mt-1">
						💡 Just write your text with line breaks and emojis - no HTML
						needed!
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

			{/* Info Card */}
			<div className="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
				<h2 className="text-lg font-medium text-white mb-4">
					Welcome to Admin Panel
				</h2>
				<p className="text-gray-400">
					Use the menu on the left to navigate through different sections.
				</p>
			</div>
		</div>
	);
}
