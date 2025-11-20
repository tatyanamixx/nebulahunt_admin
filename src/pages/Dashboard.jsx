import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../lib/api.js";

export default function Dashboard() {
	const { isAuthenticated } = useAuth();
	const [reminderStats, setReminderStats] = useState(null);
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [message, setMessage] = useState(null);

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
		if (!confirm("Send reminder notifications to all inactive users?")) {
			return;
		}

		try {
			setSending(true);
			setMessage(null);
			const response = await api.post("/admin/reminders/trigger", {});

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
