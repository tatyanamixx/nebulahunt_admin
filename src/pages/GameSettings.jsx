import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
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
import TaskTemplatesTab from '../components/TaskTemplatesTab.jsx';
import PackageTemplatesTab from '../components/PackageTemplatesTab.jsx';
import UpgradeTemplatesTab from '../components/UpgradeTemplatesTab.jsx';
import CommissionTemplatesTab from '../components/CommissionTemplatesTab.jsx';
import ArtifactTemplatesTab from '../components/ArtifactTemplatesTab.jsx';
import EventTemplatesTab from '../components/EventTemplatesTab.jsx';

export default function GameSettings() {
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [activeTab, setActiveTab] = useState('artifacts');

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
	];

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
						{activeTab === 'artifacts' && <ArtifactTemplatesTab />}

						{activeTab === 'events' && <EventTemplatesTab />}

						{activeTab === 'packages' && <PackageTemplatesTab />}

						{activeTab === 'upgrades' && <UpgradeTemplatesTab />}

						{activeTab === 'tasks' && <TaskTemplatesTab />}

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
							<CommissionTemplatesTab />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
