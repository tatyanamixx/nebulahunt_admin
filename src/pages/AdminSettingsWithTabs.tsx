import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { AccountInfoTab } from '../components/AccountInfoTab';
import { TwoFactorTab } from '../components/TwoFactorTab';
import { PasswordTab } from '../components/PasswordTab';
import { InvitationsTab } from '../components/InvitationsTab';
import { UserManagerTab } from '../components/UserManagerTab';

interface Invite {
	id: string;
	email: string;
	name: string;
	role: 'ADMIN' | 'SUPERVISOR';
	status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
	createdAt: string;
	expiresAt: string;
}

type TabType = 'account' | '2fa' | 'password' | 'invitations' | 'users';

export default function AdminSettingsWithTabs() {
	const { user, isAuthenticated } = useAuth();
	const [activeTab, setActiveTab] = useState<TabType>('account');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

	// 2FA states
	const [qrCode, setQrCode] = useState('');
	const [google2faSecret, setGoogle2faSecret] = useState('');
	const [otp, setOtp] = useState('');
	const [show2FASetup, setShow2FASetup] = useState(false);
	const [show2FAInfo, setShow2FAInfo] = useState(false);
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);

	// Password states
	const [showPasswordChange, setShowPasswordChange] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordInfo, setPasswordInfo] = useState<any>(null);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordMismatch, setPasswordMismatch] = useState(false);
	const [hasCyrillic, setHasCyrillic] = useState(false);

	// Invitation states
	const [showInviteForm, setShowInviteForm] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteName, setInviteName] = useState('');
	const [inviteRole, setInviteRole] = useState('ADMIN');
	const [invites, setInvites] = useState<Invite[]>([]);

	// User management states
	const [users, setUsers] = useState<any[]>([]);

	// Check 2FA status on component mount
	useEffect(() => {
		const check2FAStatus = async () => {
			try {
				const response = await api.get('/admin/2fa/info');
				setIs2FAEnabled(response.data.is2FAEnabled);
			} catch (error: any) {
				setIs2FAEnabled(false);
			}
		};

		if (isAuthenticated && user) {
			check2FAStatus();
			fetchPasswordInfo();
			fetchInvites();
		}
	}, [isAuthenticated, user]);

	// Fetch invites when switching to invitations tab
	useEffect(() => {
		if (activeTab === 'invitations' && isAuthenticated && user) {
			fetchInvites();
		}
	}, [activeTab, isAuthenticated, user]);

	// Fetch users when switching to users tab
	useEffect(() => {
		if (activeTab === 'users' && isAuthenticated && user) {
			fetchUsers();
		}
	}, [activeTab, isAuthenticated, user]);

	// Don't show component if user is not authenticated
	if (!isAuthenticated) {
		return null;
	}

	const showMessage = (text: string, isError = false) => {
		setMessage(text);
		setTimeout(() => setMessage(''), 10000);
	};

	const fetchPasswordInfo = async () => {
		try {
			const response = await api.get('/admin/password/info');
			setPasswordInfo(response.data);
		} catch (error: any) {
			console.error('Failed to fetch password info:', error);
		}
	};

	const fetchInvites = async () => {
		try {
			const response = await api.get('/admin/invites');
			setInvites(response.data || []);
		} catch (error: any) {
			console.error('Failed to fetch invites:', error);
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await api.get('/admin/users');
			setUsers(response.data || []);
		} catch (error: any) {
			console.error('Failed to fetch users:', error);
		}
	};

	// Tab configuration
	const tabs = [
		{ id: 'account', label: 'Account Info', icon: '👤' },
		{ id: '2fa', label: '2FA Security', icon: '🔐' },
		{ id: 'password', label: 'Password', icon: '🔑' },
		{ id: 'invitations', label: 'Invitations', icon: '👥' },
	] as const;

	return (
		<div className='min-h-screen bg-gray-900 text-white p-6'>
			<div className='max-w-4xl mx-auto space-y-6'>
				{/* Header */}
				<div className='bg-gray-800 shadow rounded-lg border border-gray-700 p-6'>
					<h1 className='text-2xl font-bold text-white mb-2'>
						⚙️ Admin Settings
					</h1>
					<p className='text-gray-400'>
						Manage your account settings, security, and admin
						invitations
					</p>
				</div>

				{/* Message Display */}
				{message && (
					<div
						className={cn(
							'p-4 rounded-md border',
							message.includes('Error') ||
								message.includes('Failed')
								? 'bg-red-900 border-red-700 text-red-200'
								: 'bg-green-900 border-green-700 text-green-200'
						)}>
						{message}
					</div>
				)}

				{/* Tabs Navigation */}
				<div className='bg-gray-800 shadow rounded-lg border border-gray-700'>
					<div className='border-b border-gray-700'>
						<nav className='flex space-x-8 px-6' aria-label='Tabs'>
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
										activeTab === tab.id
											? 'border-blue-500 text-blue-400'
											: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
									)}>
									<span className='mr-2'>{tab.icon}</span>
									{tab.label}
								</button>
							))}
						</nav>
					</div>

					{/* Tab Content */}
					<div className='p-6'>
						{activeTab === 'account' && (
							<AccountInfoTab
								user={user}
								is2FAEnabled={is2FAEnabled}
							/>
						)}
						{activeTab === '2fa' && (
							<TwoFactorTab
								user={user}
								loading={loading}
								setLoading={setLoading}
								showMessage={showMessage}
								qrCode={qrCode}
								setQrCode={setQrCode}
								google2faSecret={google2faSecret}
								setGoogle2faSecret={setGoogle2faSecret}
								otp={otp}
								setOtp={setOtp}
								show2FASetup={show2FASetup}
								setShow2FASetup={setShow2FASetup}
								show2FAInfo={show2FAInfo}
								setShow2FAInfo={setShow2FAInfo}
								is2FAEnabled={is2FAEnabled}
								setIs2FAEnabled={setIs2FAEnabled}
							/>
						)}
						{activeTab === 'password' && (
							<PasswordTab
								loading={loading}
								setLoading={setLoading}
								showMessage={showMessage}
								showPasswordChange={showPasswordChange}
								setShowPasswordChange={setShowPasswordChange}
								currentPassword={currentPassword}
								setCurrentPassword={setCurrentPassword}
								newPassword={newPassword}
								setNewPassword={setNewPassword}
								confirmPassword={confirmPassword}
								setConfirmPassword={setConfirmPassword}
								passwordInfo={passwordInfo}
								setPasswordInfo={setPasswordInfo}
								showCurrentPassword={showCurrentPassword}
								setShowCurrentPassword={setShowCurrentPassword}
								showNewPassword={showNewPassword}
								setShowNewPassword={setShowNewPassword}
								showConfirmPassword={showConfirmPassword}
								setShowConfirmPassword={setShowConfirmPassword}
								passwordMismatch={passwordMismatch}
								setPasswordMismatch={setPasswordMismatch}
								hasCyrillic={hasCyrillic}
								setHasCyrillic={setHasCyrillic}
							/>
						)}
						{activeTab === 'invitations' && (
							<InvitationsTab
								loading={loading}
								setLoading={setLoading}
								showMessage={showMessage}
								showInviteForm={showInviteForm}
								setShowInviteForm={setShowInviteForm}
								inviteEmail={inviteEmail}
								setInviteEmail={setInviteEmail}
								inviteName={inviteName}
								setInviteName={setInviteName}
								inviteRole={inviteRole}
								setInviteRole={setInviteRole}
								invites={invites}
								setInvites={setInvites}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
