import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { isDevelopment } from "../lib/env.js";
import { safeFetch, checkServerStatus } from "../lib/server-status.js";
import ServerErrorAlert from "../components/ServerErrorAlert.jsx";

export default function AdminLogin() {
	const navigate = useNavigate();
	const {
		loginWithGoogle,
		verify2FA,
		login,
		clearTokens,
		loading,
		isAuthenticated,
	} = useAuth();
	const [step, setStep] = useState("oauth");

	// Debug authentication state on component mount
	useEffect(() => {
		console.log("🔐 AdminLogin component mount - Auth state:", {
			isAuthenticated,
			accessToken: localStorage.getItem("accessToken") ? "present" : "missing",
			refreshToken: localStorage.getItem("refreshToken")
				? "present"
				: "missing",
			tempOAuthData: localStorage.getItem("tempOAuthData")
				? "present"
				: "missing",
		});

		// Check server status on mount
		const checkServer = async () => {
			try {
				const status = await checkServerStatus();
				if (!status.isAvailable) {
					setServerError(status.message || "Server unavailable");
				}
			} catch (error) {
				console.error("Server status check failed:", error);
				setServerError(
					"Server unavailable. Please check your internet connection and try again."
				);
			}
		};

		checkServer();

		// If already authenticated, redirect to dashboard
		if (isAuthenticated) {
			console.log("🔐 Already authenticated, redirecting to dashboard");
			navigate("/dashboard");
		}

		// If we're on 2FA step but no tempOAuthData, go back to OAuth step
		if (step === "2fa" && !localStorage.getItem("tempOAuthData")) {
			console.log(
				"🔐 No tempOAuthData found on 2FA step, returning to OAuth step"
			);
			setStep("oauth");
			showMessage("Please complete Google OAuth first", true);
		}
	}, [isAuthenticated, navigate, step]);

	const [otp, setOtp] = useState("");
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [qrCode, setQrCode] = useState("");
	const [google2faSecret, setGoogle2faSecret] = useState("");
	const [showQRCode, setShowQRCode] = useState(false);
	const [serverError, setServerError] = useState(null);

	// State for email/password form
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [debugInfo, setDebugInfo] = useState({
		clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "not_set",
		googleOAuthAvailable: false,
		scriptLoaded: false,
	});

	const showMessage = (text, isError = false) => {
		setMessage(text);
		setServerError(null); // Clear server error when showing new message
		if (!isError) {
			setTimeout(() => setMessage(""), 5000);
		}
	};

	// Debug information
	useEffect(() => {
		const checkGoogleOAuth = () => {
			const scriptLoaded = !!document.querySelector(
				'script[src*="accounts.google.com"]'
			);
			const oauthAvailable = !!window.google?.accounts?.oauth2;

			setDebugInfo({
				clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "not_set",
				googleOAuthAvailable: oauthAvailable,
				scriptLoaded,
			});
		};

		checkGoogleOAuth();
		const interval = setInterval(checkGoogleOAuth, 2000);
		return () => clearInterval(interval);
	}, []);

	// Reset QR code when step changes to 2FA
	useEffect(() => {
		if (step === "2fa") {
			// Reset QR code state when entering 2FA step
			setShowQRCode(false);
			setQrCode("");
			setGoogle2faSecret("");
		}
	}, [step]);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await loginWithGoogle(() => {
				// This callback is called when 2FA is required
				setStep("2fa");
				showMessage(
					"Google authentication successful. Please enter 2FA code"
				);
			});

			// Check if user was authenticated without 2FA
			const tempData = localStorage.getItem("tempOAuthData");
			if (!tempData) {
				// No 2FA required, user should be authenticated
				showMessage("Login successful");
				navigate("/dashboard");
			}
		} catch (error) {
			console.error("Google login error:", error);
			let message =
				error.response?.data?.message ||
				error.message ||
				"Google login error";

			// Show more understandable message for setup error
			if (message.includes("Google OAuth Client ID not configured")) {
				message =
					"Google OAuth not configured. Follow instructions in GOOGLE_OAUTH_SETUP_CLIENT.md";
			}

			// Handle server unavailability specifically
			if (
				error.response?.status === 0 ||
				error.response?.data?.error === "NETWORK_ERROR" ||
				error.response?.data?.error === "JSON_PARSE_ERROR"
			) {
				setServerError(
					"Server unavailable. Please check your internet connection and try again."
				);
				return;
			}

			showMessage(message, true);
		} finally {
			setIsLoading(false);
		}
	};

	const handle2FAVerification = async (e) => {
		e.preventDefault();

		console.log("🔐 handle2FAVerification called with OTP:", otp);

		// Debug localStorage state
		const accessToken = localStorage.getItem("accessToken");
		const refreshToken = localStorage.getItem("refreshToken");
		const tempOAuthData = localStorage.getItem("tempOAuthData");

		console.log("🔐 localStorage debug:", {
			accessToken: accessToken ? "present" : "missing",
			refreshToken: refreshToken ? "present" : "missing",
			tempOAuthData: tempOAuthData ? "present" : "missing",
			tempOAuthDataContent: tempOAuthData,
		});

		if (!otp) {
			showMessage("Please enter 2FA code", true);
			return;
		}

		setIsLoading(true);
		try {
			console.log("🔐 Calling verify2FA...");
			await verify2FA(otp);
			console.log("🔐 verify2FA successful");
			showMessage("Login successful");
			navigate("/dashboard");
		} catch (error) {
			console.error("🔐 handle2FAVerification error:", error);

			// Handle server unavailability specifically
			if (
				error.response?.status === 0 ||
				error.response?.data?.error === "NETWORK_ERROR" ||
				error.response?.data?.error === "JSON_PARSE_ERROR" ||
				error.message?.includes("HTTP 500") ||
				error.message?.includes("Internal Server Error")
			) {
				setServerError(
					"Server unavailable. Please check your internet connection and try again."
				);
				return;
			}

			// Show the actual error message from the server or a generic one
			const message =
				error.message || "2FA verification failed. Please try again.";
			showMessage(message, true);
		} finally {
			setIsLoading(false);
		}
	};

	// Function for email and password login
	const handlePasswordLogin = async (e) => {
		console.log("🔐 handlePasswordLogin called");
		e.preventDefault();
		console.log("🔐 preventDefault executed");
		setPasswordLoading(true);
		setMessage("");
		console.log("🔐 State updated");

		try {
			console.log("🔐 Отправляем запрос:", {
				email,
				hasPassword: !!password,
			});

			const result = await safeFetch("/api/admin/login/password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!result.ok) {
				throw new Error(result.error || "Login error");
			}

			const data = result.data;
			console.log("🔐 Данные ответа:", data);

			// Проверяем, требуется ли 2FA
			if (data.requires2FA) {
				console.log("🔐 2FA required for password login");
				// Сохраняем данные пользователя для 2FA
				localStorage.setItem(
					"tempPasswordData",
					JSON.stringify({
						email: data.userData.email,
						provider: "password",
					})
				);
				setStep("password2fa");
				return;
			}

			// Сохраняем токены
			localStorage.setItem("accessToken", data.accessToken);
			localStorage.setItem("refreshToken", data.refreshToken);

			// Обновляем контекст аутентификации
			await login();

			// Show password warning if exists
			if (data.passwordWarning) {
				alert(`Warning: ${data.passwordMessage}`);
			}

			// Перенаправляем на дашборд
			navigate("/dashboard");
		} catch (err) {
			console.log("🔐 Ошибка:", err);

			// Handle server unavailability specifically
			if (
				err.response?.status === 0 ||
				err.response?.data?.error === "NETWORK_ERROR" ||
				err.response?.data?.error === "JSON_PARSE_ERROR" ||
				err.message?.includes("Failed to fetch") ||
				err.message?.includes("Network Error") ||
				err.message?.includes("HTTP 500") ||
				err.message?.includes("Internal Server Error")
			) {
				setServerError(
					"Server unavailable. Please check your internet connection and try again."
				);
				return;
			}

			// For other errors, show a generic message
			setMessage("Login failed. Please try again.");
		} finally {
			console.log("🔐 Завершение handlePasswordLogin");
			setPasswordLoading(false);
		}
	};

	const handlePassword2FAVerification = async (e) => {
		e.preventDefault();

		if (!otp || otp.length !== 6) {
			showMessage("Please enter a valid 6-digit 2FA code", true);
			return;
		}

		setIsLoading(true);
		try {
			const tempPasswordData = localStorage.getItem("tempPasswordData");
			if (!tempPasswordData) {
				throw new Error("No password data found");
			}

			const passwordData = JSON.parse(tempPasswordData);

			const result = await safeFetch("/api/admin/login/password/2fa/verify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: passwordData.email,
					otp,
				}),
			});

			if (!result.ok) {
				throw new Error(result.error || "2FA verification error");
			}

			const data = result.data;

			// Сохраняем токены
			localStorage.setItem("accessToken", data.accessToken);
			localStorage.setItem("refreshToken", data.refreshToken);

			// Обновляем контекст аутентификации
			await login();

			// Clear temporary data
			localStorage.removeItem("tempPasswordData");

			showMessage("Login successful! Redirecting...");
			setTimeout(() => navigate("/dashboard"), 1000);
		} catch (error) {
			let message =
				error.response?.data?.message ||
				error.message ||
				"2FA verification failed";

			// Handle server unavailability specifically
			if (
				error.response?.status === 0 ||
				error.response?.data?.error === "NETWORK_ERROR" ||
				error.response?.data?.error === "JSON_PARSE_ERROR" ||
				error.message?.includes("Failed to fetch") ||
				error.message?.includes("Network Error")
			) {
				setServerError(
					"Server unavailable. Please check your internet connection and try again."
				);
				return;
			}

			showMessage(message, true);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 text-blue-400">🔐</div>
					<h2 className="mt-6 text-3xl font-bold text-white">
						Admin Login
					</h2>
					<p className="mt-2 text-sm text-gray-400">
						Sign in with email and password
					</p>
					{isDevelopment() && (
						<div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-md">
							<p className="text-sm text-yellow-200">
								🧪 Development mode: Testing вход
							</p>
							<div className="mt-2 text-xs text-yellow-300 space-y-1">
								<div>
									Client ID: {debugInfo.clientId.substring(0, 20)}
									...
								</div>
								<div>
									Script Loaded:{" "}
									{debugInfo.scriptLoaded ? "✅" : "❌"}
								</div>
								<div>
									OAuth Available:{" "}
									{debugInfo.googleOAuthAvailable ? "✅" : "❌"}
								</div>
							</div>
							<button
								onClick={clearTokens}
								className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
							>
								Clear Tokens
							</button>
						</div>
					)}
				</div>

				{serverError && (
					<ServerErrorAlert
						message={serverError}
						onRetry={() => setServerError(null)}
						className="mb-4"
					/>
				)}

				{message && !serverError && (
					<div
						className={`p-4 rounded-md ${
							message.includes("error") || message.includes("Error")
								? "bg-red-900 text-red-200 border border-red-700"
								: "bg-green-900 text-green-200 border border-green-700"
						}`}
					>
						{message}
					</div>
				)}

				{/* Email/Password Login */}
				{step === "oauth" && (
					<div className="space-y-6">
						{/* Форма email/пароль */}
						<form onSubmit={handlePasswordLogin} className="space-y-4">
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-300"
								>
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="Enter email"
								/>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-300"
								>
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="Enter password"
								/>
							</div>
							<button
								type="submit"
								disabled={passwordLoading}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{passwordLoading
									? "Signing in..."
									: "Sign in with email and password"}
							</button>
						</form>
					</div>
				)}

				{/* 2FA форма */}
				{step === "2fa" && (
					<div className="space-y-6">
						{/* QR Code Section */}
						{showQRCode && qrCode ? (
							<div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
								<h3 className="text-lg font-medium text-white mb-4">
									Google Authenticator Setup
								</h3>

								<div className="space-y-4">
									{showQRCode ? (
										<div>
											<div className="flex justify-between items-center mb-2">
												<label className="block text-sm font-medium text-gray-300">
													QR Code for scanning:
												</label>
												<button
													type="button"
													onClick={() =>
														setShowQRCode(false)
													}
													className="text-sm text-gray-400 hover:text-gray-300"
												>
													Hide QR Code
												</button>
											</div>
											<div className="flex justify-center">
												<img
													src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
														qrCode
													)}`}
													alt="QR Code"
													className="border border-gray-600 rounded"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-300 mb-2">
													Secret for manual entry:
												</label>
												<div className="flex items-center space-x-2">
													<input
														type="text"
														value={google2faSecret}
														readOnly
														aria-label="Google 2FA secret key"
														className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white text-sm font-mono rounded-md"
													/>
													<button
														onClick={() =>
															navigator.clipboard.writeText(
																google2faSecret
															)
														}
														className="px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
														aria-label="Copy secret to clipboard"
													>
														Copy
													</button>
												</div>
											</div>
										</div>
									) : (
										<div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
											<div className="text-center">
												<p className="text-gray-300 mb-3">
													Need to scan QR code in Google
													Authenticator?
												</p>
												<button
													type="button"
													onClick={async () => {
														try {
															const tempData =
																localStorage.getItem(
																	"tempOAuthData"
																);
															if (tempData) {
																const { userData } =
																	JSON.parse(
																		tempData
																	);
																const result =
																	await safeFetch(
																		`/api/admin/2fa/qr/${userData.email}`
																	);
																if (
																	result.ok &&
																	result.data
																) {
																	setQrCode(
																		result.data
																			.otpAuthUrl
																	);
																	setGoogle2faSecret(
																		result.data
																			.google2faSecret
																	);
																	setShowQRCode(
																		true
																	);
																}
															}
														} catch (error) {
															console.error(
																"Failed to get QR code:",
																error
															);
														}
													}}
													className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
												>
													Show QR Code
												</button>
											</div>
										</div>
									)}

									<div className="bg-blue-900 p-4 rounded-md border border-blue-700">
										<h4 className="text-sm font-medium text-blue-200 mb-2">
											Instructions:
										</h4>
										<ol className="text-sm text-blue-300 space-y-1">
											<li>1. Open Google Authenticator app</li>
											<li>2. Tap "+" to add account</li>
											<li>
												3. Choose "Scan QR code" or enter
												secret manually
											</li>
											<li>4. Enter the received code below</li>
										</ol>
									</div>
								</div>
							</div>
						) : (
							<div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
								<div className="text-center">
									<p className="text-gray-300 mb-3">
										Need to scan QR code in Google Authenticator?
									</p>
									<button
										type="button"
										onClick={async () => {
											try {
												const tempData =
													localStorage.getItem(
														"tempOAuthData"
													);
												if (tempData) {
													const { userData } =
														JSON.parse(tempData);
													const result = await safeFetch(
														`/api/admin/2fa/qr/${userData.email}`
													);
													if (result.ok) {
														const qrData = result.data;
														setQrCode(qrData.otpAuthUrl);
														setGoogle2faSecret(
															qrData.google2faSecret
														);
														setShowQRCode(true);
													}
												}
											} catch (error) {
												console.error(
													"Failed to get QR code:",
													error
												);
											}
										}}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Show QR Code
									</button>
								</div>
							</div>
						)}

						{/* 2FA Code Form */}
						<form onSubmit={handle2FAVerification} className="space-y-6">
							<div>
								<label
									htmlFor="otp"
									className="block text-sm font-medium text-gray-300"
								>
									2FA Code
								</label>
								<input
									id="otp"
									name="otp"
									type="text"
									required
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
									placeholder="000000"
									maxLength={6}
									pattern="[0-9]{6}"
								/>
							</div>

							<div>
								<button
									type="submit"
									disabled={isLoading || loading}
									className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading || loading
										? "Verifying..."
										: "Verify"}
								</button>
							</div>

							<div className="text-center">
								<button
									type="button"
									onClick={() => setStep("oauth")}
									className="text-sm text-blue-400 hover:text-blue-300"
								>
									← Back to login options
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Password 2FA Step */}
				{step === "password2fa" && (
					<div className="space-y-6">
						<div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
							<h3 className="text-lg font-medium text-white mb-4">
								Google Authenticator Setup
							</h3>

							<div className="space-y-4">
								{showQRCode ? (
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											QR Code for scanning:
										</label>
										<div className="flex justify-center">
											<img
												src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
													qrCode
												)}`}
												alt="QR Code"
												className="border border-gray-600 rounded"
											/>
										</div>
									</div>
								) : (
									<div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
										<div className="text-center">
											<p className="text-gray-300 mb-3">
												Need to scan QR code in Google
												Authenticator?
											</p>
											<button
												type="button"
												onClick={async () => {
													try {
														const tempData =
															localStorage.getItem(
																"tempPasswordData"
															);
														if (tempData) {
															const { email } =
																JSON.parse(tempData);
															const result =
																await safeFetch(
																	`/api/admin/2fa/qr/${email}`
																);
															if (result.ok) {
																const qrData =
																	result.data;
																setQrCode(
																	qrData.otpAuthUrl
																);
																setGoogle2faSecret(
																	qrData.google2faSecret
																);
																setShowQRCode(true);
															}
														}
													} catch (error) {
														console.error(
															"Failed to get QR code:",
															error
														);
													}
												}}
												className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
											>
												Show QR Code
											</button>
										</div>
									</div>
								)}

								{showQRCode && (
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Secret for manual entry:
										</label>
										<div className="flex items-center space-x-2">
											<input
												type="text"
												value={google2faSecret}
												readOnly
												aria-label="Google 2FA secret key"
												className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white text-sm font-mono rounded-md"
											/>
											<button
												onClick={() =>
													navigator.clipboard.writeText(
														google2faSecret
													)
												}
												className="px-3 py-2 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
												aria-label="Copy secret to clipboard"
											>
												Copy
											</button>
										</div>
									</div>
								)}

								<div className="bg-blue-900 p-4 rounded-md border border-blue-700">
									<h4 className="text-sm font-medium text-blue-200 mb-2">
										Instructions:
									</h4>
									<ol className="text-sm text-blue-300 space-y-1">
										<li>1. Open Google Authenticator app</li>
										<li>2. Tap "+" to add account</li>
										<li>
											3. Choose "Scan QR code" or enter secret
											manually
										</li>
										<li>4. Enter the received code below</li>
									</ol>
								</div>
							</div>
						</div>

						{/* Password 2FA Code Form */}
						<form
							onSubmit={handlePassword2FAVerification}
							className="space-y-6"
						>
							<div>
								<label
									htmlFor="otp"
									className="block text-sm font-medium text-gray-300"
								>
									2FA Code
								</label>
								<input
									id="otp"
									name="otp"
									type="text"
									required
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
									placeholder="000000"
									maxLength={6}
									pattern="[0-9]{6}"
								/>
							</div>

							<div>
								<button
									type="submit"
									disabled={isLoading || loading}
									className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading || loading
										? "Verifying..."
										: "Verify"}
								</button>
							</div>

							<div className="text-center">
								<button
									type="button"
									onClick={() => setStep("oauth")}
									className="text-sm text-blue-400 hover:text-blue-300"
								>
									← Back to login options
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
