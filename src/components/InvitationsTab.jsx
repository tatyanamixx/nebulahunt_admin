import { useState } from "react";
import { api } from "../lib/api.js";
import { UserPlus, Mail, Clock, CheckCircle, XCircle, Plus, X } from "lucide-react";

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
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchInvites = async () => {
		try {
			setLoading(true);
			const response = await api.get("/admin/invites");
			setInvites(response.data);
		} catch (error) {
			console.error("Error fetching invites:", error);
			showMessage("Failed to fetch invites", true);
		} finally {
			setLoading(false);
		}
	};

	const handleSendInvite = async (e) => {
		e.preventDefault();

		if (!inviteEmail.trim() || !inviteName.trim()) {
			showMessage("Please fill in all fields", true);
			return;
		}

		try {
			setIsSubmitting(true);
			await api.post("/admin/invite", {
				email: inviteEmail.trim(),
				name: inviteName.trim(),
				role: inviteRole,
			});

			showMessage("Invitation sent successfully!");
			setInviteEmail("");
			setInviteName("");
			setInviteRole("ADMIN");
			setShowInviteForm(false);
			await fetchInvites(); // Refresh the list
		} catch (error) {
			console.error("Error sending invite:", error);
			showMessage(
				error.response?.data?.message || "Failed to send invitation",
				true
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "PENDING":
				return <Clock className="h-4 w-4 text-yellow-500" />;
			case "ACCEPTED":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "EXPIRED":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Clock className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case "PENDING":
				return "Pending";
			case "ACCEPTED":
				return "Accepted";
			case "EXPIRED":
				return "Expired";
			default:
				return "Unknown";
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "PENDING":
				return "text-yellow-500 bg-yellow-500/10";
			case "ACCEPTED":
				return "text-green-500 bg-green-500/10";
			case "EXPIRED":
				return "text-red-500 bg-red-500/10";
			default:
				return "text-gray-500 bg-gray-500/10";
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getRoleColor = (role) => {
		switch (role) {
			case "ADMIN":
				return "text-blue-500 bg-blue-500/10";
			case "SUPERVISOR":
				return "text-purple-500 bg-purple-500/10";
			default:
				return "text-gray-500 bg-gray-500/10";
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h3 className="text-base sm:text-lg font-medium text-white">
						Admin Invitations
					</h3>
					<p className="text-xs sm:text-sm text-gray-400">
						Manage invitations for new administrators and supervisors
					</p>
				</div>
				<button
					onClick={() => setShowInviteForm(!showInviteForm)}
					className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
				>
					<Plus className="h-4 w-4 mr-2" />
					{showInviteForm ? "Cancel" : "Send Invite"}
				</button>
			</div>

			{/* Invite Form */}
			{showInviteForm && (
				<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
					<h4 className="text-sm sm:text-md font-medium text-white mb-3 sm:mb-4">
						Send New Invitation
					</h4>
					<form onSubmit={handleSendInvite} className="space-y-3 sm:space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							<div>
								<label
									htmlFor="inviteEmail"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Email Address
								</label>
								<input
									type="email"
									id="inviteEmail"
									value={inviteEmail}
									onChange={(e) => setInviteEmail(e.target.value)}
									className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="admin@example.com"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="inviteName"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Full Name
								</label>
								<input
									type="text"
									id="inviteName"
									value={inviteName}
									onChange={(e) => setInviteName(e.target.value)}
									className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="John Doe"
									required
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="inviteRole"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Role
							</label>
							<select
								id="inviteRole"
								value={inviteRole}
								onChange={(e) => setInviteRole(e.target.value)}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="ADMIN">Administrator</option>
								<option value="SUPERVISOR">Supervisor</option>
							</select>
						</div>
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:space-x-3">
							<button
								type="button"
								onClick={() => setShowInviteForm(false)}
								className="w-full sm:w-auto px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting || loading}
								className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
							>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Sending...
									</>
								) : (
									<>
										<Mail className="h-4 w-4 mr-2" />
										Send Invitation
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Invites List */}
			<div className="bg-gray-800 border border-gray-700 rounded-lg">
				<div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
					<h4 className="text-sm sm:text-md font-medium text-white">
						Invitations ({invites.length})
					</h4>
				</div>
				<div className="divide-y divide-gray-700">
					{loading ? (
						<div className="p-4 sm:p-6 text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
							<p className="text-gray-400 mt-2 text-sm">
								Loading invitations...
							</p>
						</div>
					) : invites.length === 0 ? (
						<div className="p-4 sm:p-6 text-center">
							<UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
							<p className="text-gray-400 text-sm">No invitations found</p>
							<p className="text-xs sm:text-sm text-gray-500 mt-1">
								Send your first invitation to get started
							</p>
						</div>
					) : (
						invites.map((invite) => (
							<div key={invite.id} className="p-4 sm:p-6">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div className="flex-1 min-w-0">
										<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
											<h5 className="text-sm sm:text-base text-white font-medium break-words">
												{invite.name}
											</h5>
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
													invite.role
												)}`}
											>
												{invite.role}
											</span>
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
													invite.status
												)}`}
											>
												{getStatusIcon(invite.status)}
												<span className="ml-1">
													{getStatusText(invite.status)}
												</span>
											</span>
										</div>
										<p className="text-gray-400 text-xs sm:text-sm mb-1 break-words">
											{invite.email}
										</p>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:space-x-4 text-xs text-gray-500">
											<span>
												Created:{" "}
												{formatDate(invite.createdAt)}
											</span>
											{invite.expiresAt && (
												<span>
													Expires:{" "}
													{formatDate(invite.expiresAt)}
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
