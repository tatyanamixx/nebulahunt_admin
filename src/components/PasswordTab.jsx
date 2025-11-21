import { api } from "../lib/api.js";
import { useEffect } from "react";

export function PasswordTab({
	loading,
	setLoading,
	showMessage,
	showPasswordChange,
	setShowPasswordChange,
	currentPassword,
	setCurrentPassword,
	newPassword,
	setNewPassword,
	confirmPassword,
	setConfirmPassword,
	passwordInfo,
	setPasswordInfo,
	showCurrentPassword,
	setShowCurrentPassword,
	showNewPassword,
	setShowNewPassword,
	showConfirmPassword,
	setShowConfirmPassword,
	passwordMismatch,
	setPasswordMismatch,
	hasCyrillic,
	setHasCyrillic,
}) {
	// Auto-update passwordMismatch when passwords change
	useEffect(() => {
		const shouldShowError = Boolean(
			newPassword && confirmPassword && newPassword !== confirmPassword
		);
		setPasswordMismatch(shouldShowError);
	}, [newPassword, confirmPassword, setPasswordMismatch]);

	const checkPasswordMatch = () => {
		// This function is now simplified since useEffect handles the state update
		return newPassword === confirmPassword;
	};

	const checkCyrillic = (text) => {
		return /[а-яё]/i.test(text);
	};

	const handlePasswordChange = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			showMessage("New passwords do not match", true);
			return;
		}

		if (checkCyrillic(newPassword)) {
			showMessage("Password must contain only Latin letters", true);
			return;
		}

		setLoading(true);
		try {
			await api.post("/admin/password/change", {
				currentPassword,
				newPassword,
			});

			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setShowPasswordChange(false);
			setShowCurrentPassword(false);
			setShowNewPassword(false);
			setShowConfirmPassword(false);
			setPasswordMismatch(false);
			setHasCyrillic(false);
			showMessage("Password changed successfully!");
		} catch (error) {
			const message =
				error.response?.data?.message || "Failed to change password";
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Password Info */}
			{passwordInfo && (
				<div className="bg-gray-700 p-3 sm:p-4 rounded-lg border border-gray-600">
					<h4 className="text-xs sm:text-sm font-medium text-gray-200 mb-2 sm:mb-3">
						Password Information
					</h4>
					<div className="space-y-2 text-xs sm:text-sm">
						<p className="text-gray-300">
							<strong>Password set:</strong>{" "}
							{passwordInfo.hasPassword ? "✅ Yes" : "❌ No"}
						</p>
						{passwordInfo.passwordChangedAt && (
							<p className="text-gray-300">
								<strong>Last changed:</strong>{" "}
								{new Date(
									passwordInfo.passwordChangedAt
								).toLocaleDateString()}
							</p>
						)}
						{passwordInfo.passwordExpiresAt && (
							<p className="text-gray-300">
								<strong>Expires:</strong>{" "}
								{new Date(
									passwordInfo.passwordExpiresAt
								).toLocaleDateString()}
							</p>
						)}
						{passwordInfo.lastLoginAt && (
							<p className="text-gray-300">
								<strong>Last login:</strong>{" "}
								{new Date(
									passwordInfo.lastLoginAt
								).toLocaleDateString()}
							</p>
						)}
						{passwordInfo.passwordWarning && (
							<p className="text-yellow-400">
								<strong>Warning:</strong>{" "}
								{passwordInfo.passwordMessage}
							</p>
						)}
						{passwordInfo.isLocked && (
							<p className="text-red-400">
								<strong>Account locked:</strong>{" "}
								{passwordInfo.lockMinutesLeft} min.
							</p>
						)}
					</div>
				</div>
			)}

			{/* Password Change Section */}
			<div className="bg-gray-700 shadow rounded-lg border border-gray-600 p-4 sm:p-6">
				<h2 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
					🔑 Password Management
				</h2>

				{/* Password Change Button */}
				<button
					onClick={() => setShowPasswordChange(!showPasswordChange)}
					className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
				>
					{showPasswordChange ? "❌ Cancel" : "🔑 Change Password"}
				</button>
			</div>

			{/* Password Change Form */}
			{showPasswordChange && (
				<div className="space-y-4 sm:space-y-6">
					<div className="bg-gray-700 p-4 sm:p-6 rounded-lg border border-gray-600">
						<h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
							🔑 Change Password
						</h3>
						<form onSubmit={handlePasswordChange} className="space-y-4">
							<div>
								<label
									htmlFor="currentPassword"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Current Password
								</label>
								<div className="relative">
									<input
										type={
											showCurrentPassword ? "text" : "password"
										}
										id="currentPassword"
										value={currentPassword}
										onChange={(e) =>
											setCurrentPassword(e.target.value)
										}
										required
										className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<button
										type="button"
										onClick={() =>
											setShowCurrentPassword(
												!showCurrentPassword
											)
										}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
									>
										{showCurrentPassword ? (
											<svg
												className="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
												/>
											</svg>
										) : (
											<svg
												className="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										)}
									</button>
								</div>
							</div>

							<div>
								<label
									htmlFor="newPassword"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									New Password
								</label>
								<div className="relative">
									<input
										type={showNewPassword ? "text" : "password"}
										id="newPassword"
										value={newPassword}
										onChange={(e) => {
											const value = e.target.value;
											setNewPassword(value);
											setHasCyrillic(checkCyrillic(value));
											checkPasswordMatch();
										}}
										required
										className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<button
										type="button"
										onClick={() =>
											setShowNewPassword(!showNewPassword)
										}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
									>
										{showNewPassword ? (
											<svg
												className="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
												/>
											</svg>
										) : (
											<svg
												className="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										)}
									</button>
								</div>
								{hasCyrillic && (
									<p className="text-red-400 text-xs mt-1">
										❌ Password cannot contain Cyrillic
										characters
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Confirm New Password
								</label>
								<div className="relative">
									<input
										type={
											showConfirmPassword ? "text" : "password"
										}
										id="confirmPassword"
										value={confirmPassword}
										onChange={(e) => {
											setConfirmPassword(e.target.value);
											checkPasswordMatch();
										}}
										required
										className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<button
										type="button"
										onClick={() =>
											setShowConfirmPassword(
												!showConfirmPassword
											)
										}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
									>
										{showConfirmPassword ? (
											<svg
												className="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
												/>
											</svg>
										) : (
											<svg
												className="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										)}
									</button>
								</div>
								{passwordMismatch && confirmPassword && (
									<p className="text-red-400 text-xs mt-1">
										❌ Passwords do not match
									</p>
								)}
							</div>

							<div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
								<button
									type="submit"
									disabled={
										loading ||
										!currentPassword ||
										!newPassword ||
										!confirmPassword ||
										passwordMismatch ||
										hasCyrillic
									}
									className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
											Changing...
										</div>
									) : (
										"Change Password"
									)}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowPasswordChange(false);
										setCurrentPassword("");
										setNewPassword("");
										setConfirmPassword("");
										setPasswordMismatch(false);
										setHasCyrillic(false);
									}}
									className="flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
