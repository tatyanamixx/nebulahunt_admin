import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import { Activity, ArrowLeft, User, Search } from 'lucide-react';

export default function Transactions() {
	const navigate = useNavigate();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [total, setTotal] = useState(0);
	const [searchUserId, setSearchUserId] = useState('');
	const [filterUserId, setFilterUserId] = useState(null);

	const TRANSACTIONS_PER_PAGE = 100;

	useEffect(() => {
		if (isAuthenticated) {
			fetchTransactions();
		}
	}, [isAuthenticated, page, filterUserId]);

	const fetchTransactions = async () => {
		try {
			setLoading(true);
			const url = filterUserId
				? `/admin-users/users/${filterUserId}/transactions?limit=${TRANSACTIONS_PER_PAGE}&offset=${
						page * TRANSACTIONS_PER_PAGE
				  }`
				: `/admin-users/transactions?limit=${TRANSACTIONS_PER_PAGE}&offset=${
						page * TRANSACTIONS_PER_PAGE
				  }`;
			const response = await api.get(url);
			setTransactions(response.data.data.transactions);
			setTotal(response.data.data.total);
		} catch (error) {
			console.error('Error fetching transactions:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchUserId.trim()) {
			setFilterUserId(searchUserId.trim());
			setPage(0);
		} else {
			setFilterUserId(null);
			setPage(0);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		try {
			return new Date(dateString).toLocaleString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return 'Invalid Date';
		}
	};

	const getTransactionTypeLabel = (txType) => {
		const labels = {
			RESOURCE_TRANSFER: 'Resource Transfer',
			ADMIN_GRANT: 'Admin Grant',
			UPGRADE_REWARD: 'Upgrade Reward',
			TASK_REWARD: 'Task Reward',
			DAILY_REWARD: 'Daily Reward',
			FARMING_REWARD: 'Farming Reward',
			GALAXY_RESOURCE: 'Galaxy Resource',
			GALAXY_CAPTURE: 'Galaxy Capture', // ✅ Захват галактики
			GALAXY_UPGRADE: 'Galaxy Upgrade', // ✅ Улучшение галактики
			PACKAGE_REWARD: 'Package Reward',
			PACKAGE_PURCHASE: 'Package Purchase', // ✅ Покупка пакета
			STARDUST_PURCHASE: 'Stardust Purchase', // ✅ Покупка звездной пыли
			DARK_MATTER_PURCHASE: 'Dark Matter Purchase', // ✅ Покупка черной материи
			REFERRER_REWARD: 'Referrer Reward',
			REFEREE_REWARD: 'Referee Reward',
			REGISTRATION_BONUS: 'Registration Bonus',
			BUYER_TO_CONTRACT: 'Buyer to Contract',
			CONTRACT_TO_SELLER: 'Contract to Seller',
			FEE: 'Fee',
			STARS_TRANSFER: 'Stars Transfer',
			STARDUST_TRANSFER: 'Stardust Transfer',
			DARK_MATTER_TRANSFER: 'Dark Matter Transfer',
		};
		return labels[txType] || txType;
	};

	const isSystemAccount = (accountId) => {
		return accountId === 1000000000000000 || accountId === '1000000000000000';
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

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate('/dashboard')}
					className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Dashboard
				</button>
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-white">
						All Transactions
					</h1>
					<p className="text-xs sm:text-sm text-gray-400">
						Systematic view of all transactions
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="bg-gray-800 rounded-lg p-4">
				<form onSubmit={handleSearch} className="flex gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							type="text"
							placeholder="Filter by User ID..."
							value={searchUserId}
							onChange={(e) => setSearchUserId(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						type="submit"
						className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
						Search
					</button>
					{filterUserId && (
						<button
							type="button"
							onClick={() => {
								setFilterUserId(null);
								setSearchUserId('');
								setPage(0);
							}}
							className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors">
							Clear Filter
						</button>
					)}
				</form>
				{filterUserId && (
					<div className="mt-2 text-sm text-gray-400">
						Filtering by User ID: {filterUserId}
					</div>
				)}
			</div>

			{/* Transactions Table */}
			<div className="bg-gray-800 rounded-lg p-4 sm:p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium text-white">Transactions</h2>
					<div className="text-gray-400">
						Total: {total.toLocaleString()}
					</div>
				</div>
				{loading ? (
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
											className="border-b border-gray-700 hover:bg-gray-700">
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
													<span className="text-purple-400">System</span>
												) : (
													<button
														onClick={() => navigate(`/users/${tx.fromAccount}`)}
														className="text-blue-400 hover:text-blue-300 underline">
														{tx.fromAccount}
													</button>
												)}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{isSystemAccount(tx.toAccount) ? (
													<span className="text-purple-400">System</span>
												) : (
													<button
														onClick={() => navigate(`/users/${tx.toAccount}`)}
														className="text-blue-400 hover:text-blue-300 underline">
														{tx.toAccount}
													</button>
												)}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm text-right">
												{/* Показываем положительную сумму для транзакций от системы к пользователю */}
												{(() => {
													const rawAmount = parseFloat(tx.priceOrAmount);
													const fromSystem = isSystemAccount(tx.fromAccount);
													const toUser = !isSystemAccount(tx.toAccount);
													
													// Если транзакция от системы к пользователю - всегда показываем положительную сумму
													if (fromSystem && toUser) {
														return Math.abs(rawAmount).toLocaleString();
													}
													// Если транзакция от пользователя к системе - показываем отрицательную
													if (!fromSystem && isSystemAccount(tx.toAccount)) {
														return `-${Math.abs(rawAmount).toLocaleString()}`;
													}
													// Остальные случаи - показываем абсолютное значение
													return Math.abs(rawAmount).toLocaleString();
												})()}
											</td>
											<td className="py-2 px-4 text-gray-300 text-sm">
												{tx.currencyOrResource}
											</td>
											<td className="py-2 px-4">
												<span
													className={`px-2 py-1 rounded text-xs ${
														tx.status === 'CONFIRMED'
															? 'bg-green-600 text-white'
															: tx.status === 'PENDING'
															? 'bg-yellow-600 text-white'
															: 'bg-red-600 text-white'
													}`}>
													{tx.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						{total > TRANSACTIONS_PER_PAGE && (
							<div className="flex items-center justify-between mt-4">
								<button
									onClick={() => setPage(Math.max(0, page - 1))}
									disabled={page === 0}
									className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-md transition-colors">
									Previous
								</button>
								<span className="text-gray-400">
									Page {page + 1} of {Math.ceil(total / TRANSACTIONS_PER_PAGE)}
								</span>
								<button
									onClick={() =>
										setPage(
											Math.min(
												Math.ceil(total / TRANSACTIONS_PER_PAGE) - 1,
												page + 1
											)
										)
									}
									disabled={page >= Math.ceil(total / TRANSACTIONS_PER_PAGE) - 1}
									className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-md transition-colors">
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

