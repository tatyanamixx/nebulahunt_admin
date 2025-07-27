import { api } from '../lib/api';

interface Invite {
	id: string;
	email: string;
	name: string;
	role: 'ADMIN' | 'SUPERVISOR';
	status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
	createdAt: string;
	expiresAt: string;
}

interface InvitationsTabProps {
	loading: boolean;
	setLoading: (loading: boolean) => void;
	showMessage: (text: string, isError?: boolean) => void;
	showInviteForm: boolean;
	setShowInviteForm: (show: boolean) => void;
	inviteEmail: string;
	setInviteEmail: (email: string) => void;
	inviteName: string;
	setInviteName: (name: string) => void;
	inviteRole: string;
	setInviteRole: (role: string) => void;
	invites: Invite[];
	setInvites: (invites: Invite[]) => void;
}

export function InvitationsTab({
	loading,
	setLoading,
	showMessage,
	showInviteForm,
	setShowInviteForm,
	inviteEmail,
	setInviteEmail,
	inviteName,
	setInviteName,
	inviteRole,
	setInviteRole,
	invites,
	setInvites,
}: InvitationsTabProps) {
	const handleSendInvite = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading(true);
		try {
			await api.post('/admin/invite', {
				email: inviteEmail,
				name: inviteName,
				role: inviteRole,
			});

			setInviteEmail('');
			setInviteName('');
			setInviteRole('ADMIN');
			setShowInviteForm(false);
			showMessage('Invitation sent successfully!');

			// Refresh invites list
			const response = await api.get('/admin/invites');
			setInvites(response.data || []);
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Failed to send invitation';
			showMessage(message, true);
		} finally {
			setLoading(false);
		}
	};

	const fetchInvites = async () => {
		try {
			console.log('🔄 InvitationsTab: Fetching invites...');
			const response = await api.get('/admin/invites');
			console.log('📧 InvitationsTab: Response:', response.data);
			setInvites(response.data || []);
		} catch (error: any) {
			console.error('❌ InvitationsTab: Failed to fetch invites:', error);
		}
	};

	return (
		<div className='space-y-6'>
			{/* Invite Form */}
			{!showInviteForm && (
				<div className='bg-gray-700 shadow rounded-lg border border-gray-600 p-6'>
					<h2 className='text-lg font-medium text-white mb-4'>
						👥 Admin Invitations
					</h2>
					<div className='flex space-x-3'>
						<button
							onClick={() => setShowInviteForm(true)}
							className='px-4 py-2 bg-green-600 border border-transparent rounded-md text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800'>
							📧 Send New Invitation
						</button>
						<button
							onClick={fetchInvites}
							disabled={loading}
							className='px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'>
							🔄 Refresh List
						</button>
					</div>
				</div>
			)}

			{showInviteForm && (
				<div className='space-y-6'>
					<div className='bg-gray-700 p-6 rounded-lg border border-gray-600'>
						<h3 className='text-lg font-medium text-white mb-4'>
							📧 Send New Invitation
						</h3>
						<form onSubmit={handleSendInvite} className='space-y-4'>
							<div>
								<label
									htmlFor='inviteEmail'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Email Address
								</label>
								<input
									type='email'
									id='inviteEmail'
									value={inviteEmail}
									onChange={(e) =>
										setInviteEmail(e.target.value)
									}
									required
									className='w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Enter email address'
								/>
							</div>

							<div>
								<label
									htmlFor='inviteName'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Full Name
								</label>
								<input
									type='text'
									id='inviteName'
									value={inviteName}
									onChange={(e) =>
										setInviteName(e.target.value)
									}
									required
									className='w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Enter full name'
								/>
							</div>

							<div>
								<label
									htmlFor='inviteRole'
									className='block text-sm font-medium text-gray-300 mb-2'>
									Role
								</label>
								<select
									id='inviteRole'
									value={inviteRole}
									onChange={(e) =>
										setInviteRole(e.target.value)
									}
									required
									className='w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
									<option value='ADMIN'>Admin</option>
									<option value='SUPERVISOR'>
										Supervisor
									</option>
								</select>
							</div>

							<div className='flex space-x-3'>
								<button
									type='submit'
									disabled={loading}
									className='flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'>
									{loading ? 'Sending...' : 'Send Invitation'}
								</button>
								<button
									type='button'
									onClick={() => {
										setShowInviteForm(false);
										setInviteEmail('');
										setInviteName('');
										setInviteRole('ADMIN');
									}}
									className='flex-1 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Invites List */}
			{invites.length > 0 ? (
				<div className='bg-gray-700 shadow rounded-lg border border-gray-600 p-6'>
					<h3 className='text-md font-medium text-white mb-3'>
						Recent Invitations
					</h3>
					<div className='space-y-2'>
						{invites.map((invite: any, index: number) => (
							<div
								key={index}
								className='p-3 bg-gray-600 rounded-lg border border-gray-500'>
								<div className='flex justify-between items-start'>
									<div>
										<p className='text-white font-medium'>
											{invite.name}
										</p>
										<p className='text-gray-400 text-sm'>
											{invite.email}
										</p>
										<p className='text-gray-500 text-xs'>
											Role: {invite.role}
										</p>
										<p
											className={`text-xs ${
												invite.expiresAt &&
												new Date(invite.expiresAt) <
													new Date()
													? 'text-red-400'
													: 'text-gray-500'
											}`}>
											Expires:{' '}
											{invite.expiresAt
												? (() => {
														const date = new Date(
															invite.expiresAt
														);
														return isNaN(
															date.getTime()
														)
															? 'Invalid Date'
															: date.toLocaleString();
												  })()
												: 'N/A'}
										</p>
									</div>
									<div className='text-right'>
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												invite.status === 'PENDING'
													? 'bg-yellow-900 text-yellow-200'
													: invite.status ===
													  'ACCEPTED'
													? 'bg-green-900 text-green-200'
													: 'bg-red-900 text-red-200'
											}`}>
											{invite.status}
										</span>
										<p className='text-gray-500 text-xs mt-1'>
											Created:{' '}
											{(() => {
												const date = new Date(
													invite.createdAt
												);
												return isNaN(date.getTime())
													? 'Invalid Date'
													: date.toLocaleDateString();
											})()}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className='bg-gray-700 p-4 rounded-lg border border-gray-600'>
					<p className='text-gray-400 text-center'>
						No invitations sent yet
					</p>
				</div>
			)}
		</div>
	);
}
