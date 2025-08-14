import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ServerErrorAlert({
	message = "Server unavailable. Please check your internet connection and try again.",
	onRetry,
	className = "",
}) {
	return (
		<div
			className={`bg-red-900 border border-red-700 rounded-lg p-4 ${className}`}
		>
			<div className="flex items-start space-x-3">
				<AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
				<div className="flex-1">
					<h3 className="text-sm font-medium text-red-200">
						Server Connection Error
					</h3>
					<p className="mt-1 text-sm text-red-300">{message}</p>
					{onRetry && (
						<button
							onClick={onRetry}
							className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							Try Again
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
