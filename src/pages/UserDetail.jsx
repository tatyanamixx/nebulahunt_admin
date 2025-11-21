import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../lib/api.js";
import {
	ArrowLeft,
	Star,
	Gem,
	Zap,
	Coins,
	TrendingUp,
	Sparkles,
	Activity,
	User,
	Calendar,
	Hash,
	Wallet,
	Users,
} from "lucide-react";

export default function UserDetail() {
	const { userId } = useParams();
	const navigate = useNavigate();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [loading, setLoading] = useState(true);
	const [userDetails, setUserDetails] = useState(null);
	const [transactions, setTransactions] = useState([]);
	const [transactionsLoading, setTransactionsLoading] = useState(false);
	const [transactionsTotal, setTransactionsTotal] = useState(0);
	const [transactionsPage, setTransactionsPage] = useState(0);
	const [currencyForm, setCurrencyForm] = useState({
		currency: "stardust",
		amount: "",
		reason: "",
	});
	const [givingCurrency, setGivingCurrency] = useState(false);
	const [message, setMessage] = useState(null);

	const TRANSACTIONS_PER_PAGE = 50;

	useEffect(() => {
		if (isAuthenticated) {
			fetchUserDetails();
			fetchTransactions();
		}
	}, [isAuthenticated, userId, transactionsPage]);

	const fetchUserDetails = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/admin-users/users/${userId}/details`);
			setUserDetails(response.data.data);
		} catch (error) {
			console.error("Error fetching user details:", error);
			setMessage({
				type: "error",
				text:
					error.response?.data?.message || "Failed to fetch user details",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchTransactions = async () => {
		try {
			setTransactionsLoading(true);
			const response = await api.get(
				`/admin-users/users/${userId}/transactions?limit=${TRANSACTIONS_PER_PAGE}&offset=${
					transactionsPage * TRANSACTIONS_PER_PAGE
				}`
			);
			setTransactions(response.data.data.transactions);
			setTransactionsTotal(response.data.data.total);
		} catch (error) {
			console.error("Error fetching transactions:", error);
		} finally {
			setTransactionsLoading(false);
		}
	};

	const handleGiveCurrency = async (e) => {
		e.preventDefault();

		if (!currencyForm.amount || parseFloat(currencyForm.amount) <= 0) {
			setMessage({
				type: "error",
				text: "Please enter a valid amount",
			});
			return;
		}

		if (
			!confirm(
				`Give ${currencyForm.amount} ${currencyForm.currency} to user ${userId}?`
			)
		) {
			return;
		}

		try {
			setGivingCurrency(true);
			setMessage(null);
			const response = await api.post(
				`/admin-users/users/${userId}/currency`,
				{
					currency: currencyForm.currency,
					amount: parseFloat(currencyForm.amount),
					reason: currencyForm.reason || "Admin grant",
				}
			);

			setMessage({
				type: "success",
				text: response.data.message || "Currency given successfully",
			});

			// Reset form
			setCurrencyForm({
				currency: "stardust",
				amount: "",
				reason: "",
			});

			// Refresh user details
			await fetchUserDetails();
		} catch (error) {
			console.error("Error giving currency:", error);
			setMessage({
				type: "error",
				text: error.response?.data?.message || "Failed to give currency",
			});
		} finally {
			setGivingCurrency(false);
		}
	};

	const formatNumber = (num) => {
		if (!num && num !== 0) return "0";
		return BigInt(num).toLocaleString();
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		try {
			return new Date(dateString).toLocaleString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "Invalid Date";
		}
	};

	const getTransactionTypeLabel = (txType) => {
		const labels = {
			RESOURCE_TRANSFER: "Resource Transfer",
			ADMIN_GRANT: "Admin Grant",
			UPGRADE_REWARD: "Upgrade Reward",
			TASK_REWARD: "Task Reward",
			DAILY_REWARD: "Daily Reward",
			FARMING_REWARD: "Farming Reward",
			GALAXY_RESOURCE: "Galaxy Resource",
			PACKAGE_REWARD: "Package Reward",
			REFERRER_REWARD: "Referrer Reward",
			REFEREE_REWARD: "Referee Reward",
			REGISTRATION_BONUS: "Registration Bonus",
		};
		return labels[txType] || txType;
	};

	if (authLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				<span className="ml-2 text-white">Loading...</span>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				<span className="ml-2 text-white">Loading user details...</span>
			</div>
		);
	}

	if (!userDetails) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-white">User not found</div>
			</div>
		);
	}

	const {
		user,
		galaxies,
		totalStarsFromGalaxies,
		leaderboardPosition,
		referralsCount,
	} = userDetails;
	const userState = user.userState || {};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate("/users")}
					className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Users
				</button>
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-white">
						User Details
					</h1>
					<p className="text-xs sm:text-sm text-gray-400">
						{user.username || `User ${user.id}`}
					</p>
				</div>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`p-4 rounded-md ${
						message.type === "success"
							? "bg-green-600 text-white"
							: "bg-red-600 text-white"
					}`}
				>
					{message.text}
				</div>
			)}

			{/* User Info Card */}
			<div className="bg-gray-800 rounded-lg p-4 sm:p-6">
				<h2 className="text-lg font-medium text-white mb-4">
					User Information
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="flex items-center text-gray-400">
							<Hash className="h-4 w-4 mr-2" />
							<span>ID: {user.id}</span>
						</div>
						<div className="flex items-center text-gray-400">
							<User className="h-4 w-4 mr-2" />
							<span>Username: {user.username || "N/A"}</span>
						</div>
						<div className="flex items-center text-gray-400">
							<span className="mr-2">Role:</span>
							<span
								className={`px-2 py-1 rounded text-xs ${
									user.role === "SYSTEM"
										? "bg-purple-600 text-white"
										: "bg-blue-600 text-white"
								}`}
							>
								{user.role}
							</span>
							{user.blocked && (
								<span className="ml-2 px-2 py-1 rounded text-xs bg-red-600 text-white">
									BLOCKED
								</span>
							)}
						</div>
					</div>
					<div className="space-y-2">
						{user.tonWallet && (
							<div className="flex items-center text-gray-400">
								<Wallet className="h-4 w-4 mr-2" />
								<span>
									Wallet: {user.tonWallet.substring(0, 8)}...
								</span>
							</div>
						)}
						<div className="flex items-center text-gray-400">
							<Users className="h-4 w-4 mr-2" />
							<span>Referrals: {userDetails.referralsCount || 0}</span>
						</div>
						{user.referral && user.referral !== 0 && (
							<div className="flex items-center text-gray-400 text-xs">
								<span>Invited by: {user.referral}</span>
							</div>
						)}
						<div className="flex items-center text-gray-400">
							<Calendar className="h-4 w-4 mr-2" />
							<span>Created: {formatDate(user.createdAt)}</span>
						</div>
						{user.lastLoginAt && (
							<div className="flex items-center text-gray-400">
								<Calendar className="h-4 w-4 mr-2" />
								<span>
									Last Login: {formatDate(user.lastLoginAt)}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Resources Card */}
			<div className="bg-gray-800 rounded-lg p-4 sm:p-6">
				<h2 className="text-lg font-medium text-white mb-4">Resources</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-gray-700 p-4 rounded">
						<div className="flex items-center text-gray-400 mb-2">
							<Star className="h-5 w-5 mr-2" />
							<span>Stars</span>
						</div>
						<div className="text-2xl font-bold text-white">
							{formatNumber(userState.stars || 0)}
						</div>
						{leaderboardPosition && (
							<div className="text-sm text-gray-400 mt-2">
								<TrendingUp className="h-4 w-4 inline mr-1" />
								Rank: #{leaderboardPosition}
							</div>
						)}
					</div>
					<div className="bg-gray-700 p-4 rounded">
						<div className="flex items-center text-gray-400 mb-2">
							<Gem className="h-5 w-5 mr-2" />
							<span>Stardust</span>
						</div>
						<div className="text-2xl font-bold text-white">
							{formatNumber(userState.stardust || 0)}
						</div>
					</div>
					<div className="bg-gray-700 p-4 rounded">
						<div className="flex items-center text-gray-400 mb-2">
							<Zap className="h-5 w-5 mr-2" />
							<span>Dark Matter</span>
						</div>
						<div className="text-2xl font-bold text-white">
							{formatNumber(userState.darkMatter || 0)}
						</div>
					</div>
				</div>
			</div>

			{/* Give Currency Card */}
			<div className="bg-gray-800 rounded-lg p-4 sm:p-6">
				<h2 className="text-lg font-medium text-white mb-4">
					Give Currency
				</h2>
				<form onSubmit={handleGiveCurrency} className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Currency
							</label>
							<select
								value={currencyForm.currency}
								onChange={(e) =>
									setCurrencyForm({
										...currencyForm,
										currency: e.target.value,
									})
								}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="stardust">Stardust</option>
								<option value="darkMatter">Dark Matter</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Amount
							</label>
							<input
								type="number"
								value={currencyForm.amount}
								onChange={(e) =>
									setCurrencyForm({
										...currencyForm,
										amount: e.target.value,
									})
								}
								min="1"
								step="1"
								required
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Reason (optional)
							</label>
							<input
								type="text"
								value={currencyForm.reason}
								onChange={(e) =>
									setCurrencyForm({
										...currencyForm,
										reason: e.target.value,
									})
								}
								placeholder="Admin grant"
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
					<button
						type="submit"
						disabled={givingCurrency}
						className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
					>
						{givingCurrency ? "Giving..." : "Give Currency"}
					</button>
				</form>
			</div>

			{/* Galaxies Card */}
			<div className="bg-gray-800 rounded-lg p-4 sm:p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium text-white">Galaxies</h2>
					<div className="text-gray-400">
						Total Stars: {totalStarsFromGalaxies.toLocaleString()}
					</div>
				</div>
				{galaxies.length === 0 ? (
					<div className="text-gray-400 text-center py-8">
						<Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-500" />
						<p>No galaxies found</p>
					</div>
				) : (
					<div className="space-y-3">
						{galaxies.map((galaxy) => (
							<div
								key={galaxy.id}
								className="bg-gray-700 p-4 rounded flex items-center justify-between"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="text-white font-medium">
											{galaxy.name || `Galaxy ${galaxy.seed}`}
										</h3>
										{galaxy.galaxyType && (
											<span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
												{galaxy.galaxyType}
											</span>
										)}
									</div>
									<div className="flex items-center gap-4 text-sm text-gray-400">
										<div className="flex items-center">
											<Star className="h-4 w-4 mr-1" />
											<span>
												{galaxy.starCurrent.toLocaleString()}{" "}
												/ {galaxy.maxStars.toLocaleString()}
											</span>
										</div>
										{galaxy.birthDate && (
											<div className="flex items-center">
												<Calendar className="h-4 w-4 mr-1" />
												<span>{galaxy.birthDate}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Transactions Card */}
			<div className="bg-gray-800 rounded-lg p-4 sm:p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium text-white">Transactions</h2>
					<div className="text-gray-400">
						Total: {transactionsTotal.toLocaleString()}
					</div>
				</div>
				{transactionsLoading ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
						<span className="ml-2 text-gray-400">Loading...</span>
					</div>
				) : transactions.length === 0 ? (
					<div className="text-gray-400 text-center py-8">
						<Activity className="h-12 w-12 mx-auto mb-4 text-gray-500" />
						<p>No transactions found</p>
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-700">
										<th className="text-left py-2 px-4 text-gray-400 text-sm">
											ID
										</th>
										<th className="text-left py-2 px-4 text-gray-400 text-sm">
											Date
										</th>
										<th className="text-left py-2 px-4 text-gray-400 text-sm">
											Type
										</th>
										<th className="text-left py-2 px-4 text-gray-400 text-sm">
											From
										</th>
										<th className="text-left py-2 px-4 text-gray-400 text-sm">
											To
										</th>
										<th className="text-right py-2 px-4 text-gray-400 text-sm">
											Amount
										</th>
										<th className="text-left py-2 px-4 text-gray-400 text-sm">
											Currency
										</th>
										<th className="text-left py-2 px-4 text-gray-400 text-sm">
											Status
										</th>
									</tr>
								</thead>
								<tbody>
									{transactions.map((tx) => (
										<tr
											key={tx.id}
											className="border-b border-gray-700 hover:bg-gray-700"
										>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{tx.id}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{formatDate(tx.createdAt)}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{getTransactionTypeLabel(tx.txType)}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{isSystemAccount(tx.fromAccount) ? (
													<span className="text-purple-400">
														System
													</span>
												) : (
													<button
														onClick={() =>
															navigate(
																`/users/${tx.fromAccount}`
															)
														}
														className="text-blue-400 hover:text-blue-300 underline"
													>
														{tx.fromAccount}
													</button>
												)}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{isSystemAccount(tx.toAccount) ? (
													<span className="text-purple-400">
														System
													</span>
												) : (
													<button
														onClick={() =>
															navigate(
																`/users/${tx.toAccount}`
															)
														}
														className="text-blue-400 hover:text-blue-300 underline"
													>
														{tx.toAccount}
													</button>
												)}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm text-right">
												{/* Показываем положительную сумму для транзакций от системы к пользователю */}
												{(() => {
													const rawAmount = parseFloat(
														tx.priceOrAmount
													);
													const fromSystem =
														isSystemAccount(
															tx.fromAccount
														);
													const toUser = !isSystemAccount(
														tx.toAccount
													);

													// Если транзакция от системы к пользователю - всегда показываем положительную сумму
													if (fromSystem && toUser) {
														return Math.abs(
															rawAmount
														).toLocaleString();
													}
													// Если транзакция от пользователя к системе - показываем отрицательную
													if (
														!fromSystem &&
														isSystemAccount(tx.toAccount)
													) {
														return `-${Math.abs(
															rawAmount
														).toLocaleString()}`;
													}
													// Остальные случаи - показываем абсолютное значение
													return Math.abs(
														rawAmount
													).toLocaleString();
												})()}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{tx.currencyOrResource}
											</td>
											<td className="py-2 px-4">
												<span
													className={`px-2 py-1 rounded text-xs ${
														tx.status === "CONFIRMED"
															? "bg-green-600 text-white"
															: tx.status === "PENDING"
															? "bg-yellow-600 text-white"
															: "bg-red-600 text-white"
													}`}
												>
													{tx.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						{transactionsTotal > TRANSACTIONS_PER_PAGE && (
							<div className="flex items-center justify-between mt-4">
								<button
									onClick={() =>
										setTransactionsPage(
											Math.max(0, transactionsPage - 1)
										)
									}
									disabled={transactionsPage === 0}
									className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
								>
									Previous
								</button>
								<span className="text-gray-400">
									Page {transactionsPage + 1} of{" "}
									{Math.ceil(
										transactionsTotal / TRANSACTIONS_PER_PAGE
									)}
								</span>
								<button
									onClick={() =>
										setTransactionsPage(
											Math.min(
												Math.ceil(
													transactionsTotal /
														TRANSACTIONS_PER_PAGE
												) - 1,
												transactionsPage + 1
											)
										)
									}
									disabled={
										transactionsPage >=
										Math.ceil(
											transactionsTotal / TRANSACTIONS_PER_PAGE
										) -
											1
									}
									className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
								>
									Next
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
