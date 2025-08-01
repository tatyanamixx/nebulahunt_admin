/**
 * Utility functions for checking server status and handling server unavailability
 */

export interface ServerStatus {
	isAvailable: boolean;
	message?: string;
	error?: string;
}

/**
 * Check if the server is available by making a simple health check request
 */
export async function checkServerStatus(): Promise<ServerStatus> {
	try {
		const response = await fetch('/health', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			// Short timeout to avoid hanging
			signal: AbortSignal.timeout(5000),
		});

		if (response.ok) {
			return {
				isAvailable: true,
				message: 'Server is available',
			};
		} else {
			return {
				isAvailable: false,
				message:
					'Server unavailable. Please check your internet connection and try again.',
				error: `HTTP ${response.status}`,
			};
		}
	} catch (error: any) {
		console.error('Server status check failed:', error);

		// Handle different types of network errors
		if (error.name === 'AbortError') {
			return {
				isAvailable: false,
				message: 'Server not responding (timeout)',
				error: 'TIMEOUT',
			};
		}

		if (error.name === 'TypeError' && error.message.includes('fetch')) {
			return {
				isAvailable: false,
				message: 'Server unavailable. Check your internet connection.',
				error: 'NETWORK_ERROR',
			};
		}

		return {
			isAvailable: false,
			message: 'Error connecting to server',
			error: error.message || 'UNKNOWN_ERROR',
		};
	}
}

/**
 * Safe JSON parsing with error handling
 */
export function safeJsonParse(text: string, fallback: any = null): any {
	try {
		return JSON.parse(text);
	} catch (error) {
		console.error('JSON parsing failed:', error);
		return fallback;
	}
}

/**
 * Safe fetch with JSON parsing and error handling
 */
export async function safeFetch(
	url: string,
	options: RequestInit = {}
): Promise<{ ok: boolean; data?: any; error?: string }> {
	try {
		const response = await fetch(url, {
			...options,
			signal: AbortSignal.timeout(10000), // 10 second timeout
		});

		if (!response.ok) {
			// Try to parse error response
			try {
				const errorData = await response.json();
				return {
					ok: false,
					error:
						errorData.message ||
						'Server unavailable. Please try again later.',
				};
			} catch (jsonError) {
				return {
					ok: false,
					error: 'Server unavailable. Please try again later.',
				};
			}
		}

		// Try to parse successful response
		try {
			const data = await response.json();
			return {
				ok: true,
				data,
			};
		} catch (jsonError) {
			return {
				ok: false,
				error: 'Error processing server response',
			};
		}
	} catch (error: any) {
		console.error('Fetch request failed:', error);

		if (error.name === 'AbortError') {
			return {
				ok: false,
				error: 'Server not responding (timeout)',
			};
		}

		if (error.name === 'TypeError' && error.message.includes('fetch')) {
			return {
				ok: false,
				error: 'Server unavailable. Check your internet connection.',
			};
		}

		return {
			ok: false,
			error: error.message || 'Unknown error',
		};
	}
}
