import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
	Settings,
	Gamepad2,
	Package,
	Star,
	Target,
	Zap,
	Shield,
	DollarSign,
} from 'lucide-react';

type TabType =
	| 'artifacts'
	| 'events'
	| 'packages'
	| 'upgrades'
	| 'tasks'
	| 'galaxies'
	| 'commissions';

export default function GameSettings() {
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [activeTab, setActiveTab] = useState<TabType>('artifacts');

	// Tab configuration
	const tabs = [
		{
			id: 'artifacts',
			label: 'Artifacts',
			icon: '🏺',
			description: 'Manage artifact templates',
		},
		{
			id: 'events',
			label: 'Events',
			icon: '🎉',
			description: 'Configure game events',
		},
		{
			id: 'packages',
			label: 'Packages',
			icon: '📦',
			description: 'Manage package templates',
		},
		{
			id: 'upgrades',
			label: 'Upgrades',
			icon: '⚡',
			description: 'Configure upgrades',
		},
		{
			id: 'tasks',
			label: 'Tasks',
			icon: '📋',
			description: 'Manage task templates',
		},
		{
			id: 'galaxies',
			label: 'Galaxies',
			icon: '🌌',
			description: 'Configure galaxies',
		},
		{
			id: 'commissions',
			label: 'Commissions',
			icon: '💰',
			description: 'Configure commission rates',
		},
	] as const;

	// Show loading while authentication is being checked
	if (authLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				<span className='ml-2 text-white'>Loading...</span>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-white'>
						Game Settings
					</h1>
					<p className='text-gray-400'>
						Configure game templates and settings
					</p>
				</div>
				<div className='flex items-center space-x-2 text-gray-400'>
					<Gamepad2 className='h-5 w-5' />
					<span className='text-sm'>Template Management</span>
				</div>
			</div>

			{/* Tabs */}
			<div className='bg-gray-800 rounded-lg'>
				<div className='border-b border-gray-700'>
					<nav className='flex space-x-8 px-6' aria-label='Tabs'>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
									activeTab === tab.id
										? 'border-blue-500 text-blue-400'
										: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
								}`}>
								<div className='flex items-center space-x-2'>
									<span className='text-lg'>{tab.icon}</span>
									<span>{tab.label}</span>
								</div>
							</button>
						))}
					</nav>
				</div>

				{/* Tab Content */}
				<div className='p-6'>
					{/* Tab Description */}
					<div className='mb-6'>
						<h2 className='text-xl font-semibold text-white mb-2'>
							{tabs.find((tab) => tab.id === activeTab)?.label}{' '}
							Templates
						</h2>
						<p className='text-gray-400'>
							{
								tabs.find((tab) => tab.id === activeTab)
									?.description
							}
						</p>
					</div>

					{/* Tab Components */}
					<div className='min-h-[400px]'>
						{activeTab === 'artifacts' && (
							<div className='bg-gray-750 rounded-lg p-6 border border-gray-700'>
								<div className='flex items-center space-x-3 mb-4'>
									<Package className='h-6 w-6 text-blue-400' />
									<h3 className='text-lg font-medium text-white'>
										Artifact Templates
									</h3>
								</div>
								<p className='text-gray-400 mb-4'>
									Manage artifact templates that players can
									discover and collect in the game.
								</p>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Create Template
										</h4>
										<p className='text-sm text-gray-400'>
											Add new artifact template
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											List Templates
										</h4>
										<p className='text-sm text-gray-400'>
											View all artifact templates
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Edit Template
										</h4>
										<p className='text-sm text-gray-400'>
											Modify existing templates
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'events' && (
							<div className='bg-gray-750 rounded-lg p-6 border border-gray-700'>
								<div className='flex items-center space-x-3 mb-4'>
									<Star className='h-6 w-6 text-yellow-400' />
									<h3 className='text-lg font-medium text-white'>
										Event Templates
									</h3>
								</div>
								<p className='text-gray-400 mb-4'>
									Configure special events that can occur
									during gameplay.
								</p>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Create Event
										</h4>
										<p className='text-sm text-gray-400'>
											Add new event template
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											List Events
										</h4>
										<p className='text-sm text-gray-400'>
											View all event templates
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Schedule Events
										</h4>
										<p className='text-sm text-gray-400'>
											Set event timing
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'packages' && (
							<div className='bg-gray-750 rounded-lg p-6 border border-gray-700'>
								<div className='flex items-center space-x-3 mb-4'>
									<Package className='h-6 w-6 text-green-400' />
									<h3 className='text-lg font-medium text-white'>
										Package Templates
									</h3>
								</div>
								<p className='text-gray-400 mb-4'>
									Manage package templates for the in-game
									store.
								</p>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Create Package
										</h4>
										<p className='text-sm text-gray-400'>
											Add new package template
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											List Packages
										</h4>
										<p className='text-sm text-gray-400'>
											View all package templates
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Pricing
										</h4>
										<p className='text-sm text-gray-400'>
											Manage package prices
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'upgrades' && (
							<div className='bg-gray-750 rounded-lg p-6 border border-gray-700'>
								<div className='flex items-center space-x-3 mb-4'>
									<Zap className='h-6 w-6 text-purple-400' />
									<h3 className='text-lg font-medium text-white'>
										Upgrade Templates
									</h3>
								</div>
								<p className='text-gray-400 mb-4'>
									Configure player upgrades and progression
									systems.
								</p>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Create Upgrade
										</h4>
										<p className='text-sm text-gray-400'>
											Add new upgrade template
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											List Upgrades
										</h4>
										<p className='text-sm text-gray-400'>
											View all upgrade templates
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Requirements
										</h4>
										<p className='text-sm text-gray-400'>
											Set upgrade requirements
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'tasks' && (
							<div className='bg-gray-750 rounded-lg p-6 border border-gray-700'>
								<div className='flex items-center space-x-3 mb-4'>
									<Target className='h-6 w-6 text-red-400' />
									<h3 className='text-lg font-medium text-white'>
										Task Templates
									</h3>
								</div>
								<p className='text-gray-400 mb-4'>
									Manage quest and task templates for players.
								</p>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Create Task
										</h4>
										<p className='text-sm text-gray-400'>
											Add new task template
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											List Tasks
										</h4>
										<p className='text-sm text-gray-400'>
											View all task templates
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Rewards
										</h4>
										<p className='text-sm text-gray-400'>
											Configure task rewards
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'galaxies' && (
							<div className='bg-gray-750 rounded-lg p-6 border border-gray-700'>
								<div className='flex items-center space-x-3 mb-4'>
									<Shield className='h-6 w-6 text-indigo-400' />
									<h3 className='text-lg font-medium text-white'>
										Galaxy Templates
									</h3>
								</div>
								<p className='text-gray-400 mb-4'>
									Configure galaxy settings and exploration
									areas.
								</p>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Create Galaxy
										</h4>
										<p className='text-sm text-gray-400'>
											Add new galaxy template
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											List Galaxies
										</h4>
										<p className='text-sm text-gray-400'>
											View all galaxy templates
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Exploration
										</h4>
										<p className='text-sm text-gray-400'>
											Configure exploration settings
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'commissions' && (
							<div className='bg-gray-750 rounded-lg p-6 border border-gray-700'>
								<div className='flex items-center space-x-3 mb-4'>
									<DollarSign className='h-6 w-6 text-green-400' />
									<h3 className='text-lg font-medium text-white'>
										Commission Settings
									</h3>
								</div>
								<p className='text-gray-400 mb-4'>
									Configure commission rates and fee
									structures for the game economy.
								</p>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Transaction Fees
										</h4>
										<p className='text-sm text-gray-400'>
											Set commission rates for
											transactions
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Market Fees
										</h4>
										<p className='text-sm text-gray-400'>
											Configure marketplace commission
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Referral Rewards
										</h4>
										<p className='text-sm text-gray-400'>
											Set referral commission rates
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Withdrawal Fees
										</h4>
										<p className='text-sm text-gray-400'>
											Configure withdrawal commission
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Premium Features
										</h4>
										<p className='text-sm text-gray-400'>
											Set fees for premium features
										</p>
									</div>
									<div className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
										<h4 className='font-medium text-white mb-2'>
											Fee History
										</h4>
										<p className='text-sm text-gray-400'>
											View commission change history
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
