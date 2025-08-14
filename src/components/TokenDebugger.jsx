import { useState, useEffect } from "react";

export function TokenDebugger() {
	const [tokenInfo, setTokenInfo] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split(".")[1]));
				const currentTime = Math.floor(Date.now() / 1000);
				const isExpired = payload.exp && payload.exp < currentTime;

				setTokenInfo({
					token: token.substring(0, 50) + "...",
					payload,
					isExpired,
					expiresIn: payload.exp ? payload.exp - currentTime : "unknown",
					currentTime: new Date(currentTime * 1000).toISOString(),
					expiresAt: payload.exp
						? new Date(payload.exp * 1000).toISOString()
						: "unknown",
				});
			} catch (error) {
				setTokenInfo({ error: "Failed to parse token" });
			}
		} else {
			setTokenInfo({ error: "No token found" });
		}
	}, []);

	if (!tokenInfo) return <div>Loading token info...</div>;

	return (
		<div className="fixed top-4 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white text-sm max-w-md z-50">
			<h3 className="font-bold mb-2">Token Debug Info</h3>
			{tokenInfo.error ? (
				<div className="text-red-400">{tokenInfo.error}</div>
			) : (
				<div className="space-y-1">
					<div>
						<strong>Token:</strong> {tokenInfo.token}
					</div>
					<div>
						<strong>Expired:</strong>{" "}
						{tokenInfo.isExpired ? "Yes" : "No"}
					</div>
					<div>
						<strong>Expires in:</strong> {tokenInfo.expiresIn} seconds
					</div>
					<div>
						<strong>Current time:</strong> {tokenInfo.currentTime}
					</div>
					<div>
						<strong>Expires at:</strong> {tokenInfo.expiresAt}
					</div>
					<div>
						<strong>User ID:</strong> {tokenInfo.payload?.id}
					</div>
					<div>
						<strong>Email:</strong> {tokenInfo.payload?.email}
					</div>
					<div>
						<strong>Role:</strong> {tokenInfo.payload?.role}
					</div>
				</div>
			)}
		</div>
	);
}
