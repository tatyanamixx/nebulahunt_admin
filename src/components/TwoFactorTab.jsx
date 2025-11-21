import { api } from "../lib/api.js";

export function TwoFactorTab({
	user,
	loading,
	setLoading,
	showMessage,
	qrCode,
	setQrCode,
	google2faSecret,
	setGoogle2faSecret,
	otp,
	setOtp,
	show2FASetup,
	setShow2FASetup,
	show2FAInfo,
	setShow2FAInfo,
	is2FAEnabled,
	setIs2FAEnabled,
}) {
	const handleSetup2FA = async () => {
		setLoading(true);
		try {
			const response = await api.post("/admin/2fa/setup", {
				email: user?.email,
			});

			const { google2faSecret, otpAuthUrl } = response.data;
			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			setShow2FASetup(true);
			showMessage("2FA setup initiated. Please scan the QR code.");
		} catch (error) {
			const message = error.response?.data?.message || "Failed to setup 2FA";
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handle2FAVerification = async (e) => {
		e.preventDefault();

		if (!otp || otp.length !== 6) {
			showMessage("Please enter a valid 6-digit 2FA code", true);
			return;
		}

		setLoading(true);
		try {
			const response = await api.post("/admin/2fa/complete", {
				email: user?.email,
				otp: otp,
			});

			setIs2FAEnabled(true);
			setShow2FASetup(false);
			setOtp("");
			setQrCode("");
			setGoogle2faSecret("");
			showMessage("2FA setup completed successfully!");
		} catch (error) {
			const message =
				error.response?.data?.message || "Failed to complete 2FA setup";
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleGet2FAInfo = async () => {
		setLoading(true);
		try {
			const response = await api.get("/admin/2fa/info");
			const { google2faSecret, otpAuthUrl } = response.data;
			setGoogle2faSecret(google2faSecret);
			setQrCode(otpAuthUrl);
			setShow2FAInfo(true);
		} catch (error) {
			const message =
				error.response?.data?.message || "Failed to get 2FA info";
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const handleDisable2FA = async () => {
		if (
			!confirm(
				"Are you sure you want to disable 2FA? This will make your account less secure."
			)
		) {
			return;
		}

		setLoading(true);
		try {
			await api.post("/admin/2fa/disable", {
				email: user?.email,
			});

			setIs2FAEnabled(false);
			showMessage("2FA has been disabled.");
		} catch (error) {
			const message = error.response?.data?.message || "Failed to disable 2FA";
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* 2FA Status */}
			<div className="bg-gray-700 shadow rounded-lg border border-gray-600 p-4 sm:p-6">
				<h2 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
					🔐 Two-Factor Authentication
				</h2>
				<p className="text-xs sm:text-sm text-gray-400 mb-4">
					Two-factor authentication adds an extra layer of security to your
					account by requiring a code from your phone in addition to your
					password.
				</p>

				{is2FAEnabled ? (
					<div className="space-y-4">
						<div className="bg-green-900 p-4 rounded-md border border-green-700">
							<p className="text-green-200 text-sm">
								✅ 2FA is enabled for your account. Your account is
								now more secure.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
							<button
								onClick={handleGet2FAInfo}
								disabled={loading}
								className="w-full sm:w-auto px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 text-sm"
							>
								{loading ? "Loading..." : "📱 Get QR Code"}
							</button>
							<button
								onClick={handleDisable2FA}
								disabled={loading}
								className="w-full sm:w-auto px-4 py-2 border border-red-600 rounded-md text-red-300 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 text-sm"
							>
								{loading ? "Disabling..." : "Disable 2FA"}
							</button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<button
							onClick={handleSetup2FA}
							disabled={loading}
							className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
						>
							{loading ? "Setting up..." : "Setup 2FA"}
						</button>
					</div>
				)}
			</div>

			{/* 2FA Setup Form */}
			{show2FASetup && (
				<div className="space-y-4 sm:space-y-6">
					<div className="bg-gray-700 p-4 sm:p-6 rounded-lg border border-gray-600">
						<h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
							📱 Google Authenticator Setup
						</h3>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									QR Code for scanning:
								</label>
								<div className="flex justify-center">
									{qrCode ? (
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
												qrCode
											)}&margin=10&format=png`}
											alt="QR Code for Google Authenticator"
											className="border-2 border-gray-600 rounded-lg shadow-lg"
											style={{
												maxWidth: "250px",
												height: "auto",
											}}
										/>
									) : (
										<div className="flex items-center justify-center w-64 h-64 border-2 border-gray-600 rounded-lg bg-gray-600">
											<div className="text-gray-400 text-center">
												<div className="text-4xl mb-2">
													📱
												</div>
												<div className="text-sm">
													QR Code loading...
												</div>
											</div>
										</div>
									)}
								</div>
								{qrCode && (
									<div className="text-center mt-2">
										<p className="text-xs text-gray-400">
											Scan this QR code with Google
											Authenticator
										</p>
									</div>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Secret Key (for manual entry):
								</label>
								<div className="flex items-center space-x-2">
									<input
										type="text"
										value={google2faSecret}
										readOnly
										aria-label="Google 2FA secret key"
										className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-600 text-white text-sm font-mono tracking-wider"
									/>
									<button
										onClick={() => {
											navigator.clipboard.writeText(
												google2faSecret
											);
											showMessage(
												"Secret key copied to clipboard!"
											);
										}}
										className="px-3 py-2 text-sm border border-gray-600 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors"
										aria-label="Copy secret to clipboard"
									>
										📋 Copy
									</button>
								</div>
								<p className="text-xs text-gray-400 mt-1">
									Use this secret key if you can't scan the QR code
								</p>
							</div>

							<div className="bg-blue-900 p-4 rounded-md border border-blue-700">
								<h4 className="text-sm font-medium text-blue-200 mb-2">
									📱 Setup Instructions:
								</h4>
								<ol className="text-sm text-blue-300 space-y-2">
									<li className="flex items-start">
										<span className="mr-2">1.</span>
										<span>
											Open{" "}
											<strong>Google Authenticator</strong> app
											on your phone
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">2.</span>
										<span>
											Tap the <strong>"+"</strong> button to
											add a new account
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">3.</span>
										<span>
											Choose <strong>"Scan QR code"</strong>{" "}
											and scan the code above, OR
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">4.</span>
										<span>
											Choose <strong>"Enter setup key"</strong>{" "}
											and paste the secret key
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">5.</span>
										<span>
											Verify the 6-digit code appears in the
											app
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">6.</span>
										<span>
											Enter the code below to complete setup
										</span>
									</li>
								</ol>
							</div>
						</div>
					</div>

					{/* 2FA Verification Form */}
					<div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
						<h3 className="text-lg font-medium text-white mb-4">
							🔐 Complete 2FA Setup
						</h3>
						<form onSubmit={handle2FAVerification} className="space-y-4">
							<div>
								<label
									htmlFor="otp"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									2FA Verification Code:
								</label>
								<input
									type="text"
									id="otp"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									placeholder="Enter 6-digit code from Google Authenticator"
									className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									maxLength={6}
									pattern="[0-9]{6}"
									required
								/>
								<p className="text-xs text-gray-400 mt-1">
									Enter the 6-digit code from your Google
									Authenticator app
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
								<button
									type="submit"
									disabled={loading || !otp || otp.length !== 6}
									className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
											Verifying...
										</div>
									) : (
										"✅ Complete 2FA Setup"
									)}
								</button>
								<button
									type="button"
									onClick={() => {
										setShow2FASetup(false);
										setOtp("");
										setQrCode("");
										setGoogle2faSecret("");
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

			{/* 2FA Info Display */}
			{show2FAInfo && (
				<div className="space-y-6">
					<div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
						<h3 className="text-lg font-medium text-white mb-4">
							📱 Your 2FA QR Code
						</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									QR Code for scanning:
								</label>
								<div className="flex justify-center">
									{qrCode ? (
										<img
											src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
												qrCode
											)}&margin=10&format=png`}
											alt="QR Code for Google Authenticator"
											className="border-2 border-gray-600 rounded-lg shadow-lg"
											style={{
												maxWidth: "250px",
												height: "auto",
											}}
										/>
									) : (
										<div className="flex items-center justify-center w-64 h-64 border-2 border-gray-600 rounded-lg bg-gray-600">
											<div className="text-gray-400 text-center">
												<div className="text-4xl mb-2">
													📱
												</div>
												<div className="text-sm">
													QR Code loading...
												</div>
											</div>
										</div>
									)}
								</div>
								{qrCode && (
									<div className="text-center mt-2">
										<p className="text-xs text-gray-400">
											Scan this QR code with Google
											Authenticator
										</p>
									</div>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Secret Key (for manual entry):
								</label>
								<div className="flex items-center space-x-2">
									<input
										type="text"
										value={google2faSecret}
										readOnly
										aria-label="Google 2FA secret key"
										className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-600 text-white text-sm font-mono tracking-wider"
									/>
									<button
										onClick={() => {
											navigator.clipboard.writeText(
												google2faSecret
											);
											showMessage(
												"Secret key copied to clipboard!"
											);
										}}
										className="px-3 py-2 text-sm border border-gray-600 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors"
										aria-label="Copy secret to clipboard"
									>
										📋 Copy
									</button>
								</div>
								<p className="text-xs text-gray-400 mt-1">
									Use this secret key if you can't scan the QR code
								</p>
							</div>

							<div className="bg-green-900 p-4 rounded-md border border-green-700">
								<h4 className="text-sm font-medium text-green-200 mb-2">
									✅ Setup Instructions:
								</h4>
								<ol className="text-sm text-green-300 space-y-2">
									<li className="flex items-start">
										<span className="mr-2">1.</span>
										<span>
											Open{" "}
											<strong>Google Authenticator</strong> app
											on your phone
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">2.</span>
										<span>
											Tap the <strong>"+"</strong> button to
											add a new account
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">3.</span>
										<span>
											Choose <strong>"Scan QR code"</strong>{" "}
											and scan the code above, OR
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">4.</span>
										<span>
											Choose <strong>"Enter setup key"</strong>{" "}
											and paste the secret key
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">5.</span>
										<span>
											Verify the 6-digit code appears in the
											app
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2">6.</span>
										<span>
											You can now use this code to login to the
											admin panel
										</span>
									</li>
								</ol>
							</div>
						</div>
					</div>

					<div className="flex justify-center">
						<button
							onClick={() => {
								setShow2FAInfo(false);
								setQrCode("");
								setGoogle2faSecret("");
							}}
							className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
