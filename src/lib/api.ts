import axios from "axios";
import { isDevelopment, isMockApiEnabled } from "./env";

// Debug: Log the API URL being used
console.log(
	"🔍 Debug: VITE_API_URL from import.meta.env:",
	import.meta.env.VITE_API_URL
);
console.log("🔍 Debug: Using baseURL:", import.meta.env.VITE_API_URL || "/api");

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "/api",
	timeout: 10000,
});

// Add request interceptor for debugging and JWT token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");

		// Add JWT token to Authorization header if present
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		console.log("🔐 API Request:", {
			method: config.method?.toUpperCase(),
			url: config.url,
			baseURL: config.baseURL,
			fullURL: `${config.baseURL}${config.url}`,
			data: config.data,
			hasToken: !!token,
			tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
			authorizationHeader: config.headers.Authorization
				? "present"
				: "missing",
		});
		return config;
	},
	(error) => {
		console.error("🔐 API Request Error:", error);
		return Promise.reject(error);
	}
);

// Add response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log("🔐 API Response:", {
			status: response.status,
			url: response.config.url,
			data: response.data,
		});
		return response;
	},
	(error) => {
		// Handle network errors and server unavailability
		if (!error.response) {
			// Network error - server is not reachable
			console.error("🔐 Network Error - Server unavailable:", {
				message: error.message,
				url: error.config?.url,
				code: error.code,
			});

			// Create a standardized error response
			const networkError = {
				response: {
					status: 0,
					statusText: "Network Error",
					data: {
						message:
							"Server unavailable. Please check your internet connection and try again.",
						error: "NETWORK_ERROR",
						details: error.message,
					},
				},
				config: error.config,
				message: "Network Error - Server unavailable",
			};

			return Promise.reject(networkError);
		}

		// Handle JSON parsing errors
		if (
			error.message &&
			error.message.includes("Unexpected end of JSON input")
		) {
			console.error("🔐 JSON Parsing Error:", {
				status: error.response?.status,
				url: error.config?.url,
				message: error.message,
			});

			const jsonError = {
				response: {
					status: error.response?.status || 500,
					statusText: error.response?.statusText || "JSON Parse Error",
					data: {
						message:
							"Server unavailable. Please check your internet connection and try again.",
						error: "JSON_PARSE_ERROR",
						details: error.message,
					},
				},
				config: error.config,
				message: "JSON parsing failed",
			};

			return Promise.reject(jsonError);
		}

		console.error("🔐 API Response Error:", {
			status: error.response?.status,
			url: error.config?.url,
			data: error.response?.data,
			message: error.message,
		});
		return Promise.reject(error);
	}
);

// Mock for development mode (disabled for connecting to real server)
const enableMockApi = false; // isMockApiEnabled();

if (false) {
	// isDevelopment() && enableMockApi) {
	// Intercept requests in development mode
	api.interceptors.request.use(async (config) => {
		// Mock responses for testing
		if (config.url === "/admin/login" && config.method === "post") {
			// Simulate successful admin login
			return Promise.reject({
				response: {
					data: {
						message: "Admin login successful",
						email: config.data?.email || "admin@test.com",
						id: 123456789,
						role: "ADMIN",
					},
				},
			});
		}

		if (config.url === "/admin/2fa/verify" && config.method === "post") {
			// Simulate successful 2FA verification
			return Promise.reject({
				response: {
					data: {
						message: "2FA verification successful",
						accessToken: "mock_access_token_2fa",
						refreshToken: "mock_refresh_token_2fa",
						id: 123456789,
						email: config.data?.email || "admin@test.com",
						role: "ADMIN",
					},
				},
			});
		}

		if (config.url === "/admin/invite" && config.method === "post") {
			// Simulate successful invitation sending
			return Promise.reject({
				response: {
					data: {
						message: "Invitation sent successfully",
						email: config.data?.email || "admin@test.com",
					},
				},
			});
		}

		if (config.url === "/admin/invite/validate" && config.method === "get") {
			// Simulate invitation token validation
			return Promise.reject({
				response: {
					data: {
						email: "admin@test.com",
						name: "Test Admin",
						role: "ADMIN",
					},
				},
			});
		}

		if (config.url === "/admin/register" && config.method === "post") {
			// Simulate successful administrator registration
			return Promise.reject({
				response: {
					data: {
						message: "Admin registered successfully",
						google2faSecret: "JBSWY3DPEHPK3PXP",
						otpAuthUrl:
							"otpauth://totp/Nebulahunt%20Admin%20(admin@test.com)?secret=JBSWY3DPEHPK3PXP&issuer=Nebulahunt",
					},
				},
			});
		}

		if (config.url === "/admin/2fa/complete" && config.method === "post") {
			// Simulate successful 2FA completion
			return Promise.reject({
				response: {
					data: {
						message: "2FA setup completed successfully",
					},
				},
			});
		}

		if (config.url === "/admin/stats" && config.method === "get") {
			// Simulate dashboard statistics
			return Promise.reject({
				response: {
					data: {
						totalUsers: 1250,
						activeUsers: 847,
						totalStardust: 15420,
						totalDarkMatter: 1250,
						totalGalaxies: 89,
						totalArtifacts: 234,
					},
				},
			});
		}

		if (config.url === "/admin/users" && config.method === "get") {
			// Simulate user list
			return Promise.reject({
				response: {
					data: [
						{
							id: 1,
							username: "user1",
							role: "USER",
							blocked: false,
							referral: "ref123",
							createdAt: new Date(
								Date.now() - 30 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: 2,
							username: "user2",
							role: "USER",
							blocked: true,
							referral: "ref456",
							createdAt: new Date(
								Date.now() - 15 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: 3,
							username: "admin_user",
							role: "ADMIN",
							blocked: false,
							createdAt: new Date(
								Date.now() - 60 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: 4,
							username: "premium_user",
							role: "PREMIUM",
							blocked: false,
							referral: "ref789",
							createdAt: new Date(
								Date.now() - 7 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
					],
				},
			});
		}

		if (
			config.url &&
			config.url.includes("/admin/users/") &&
			config.url.includes("/block") &&
			config.method === "post"
		) {
			// Simulate user blocking
			return Promise.reject({
				response: {
					data: {
						message: "User blocked successfully",
					},
				},
			});
		}

		if (
			config.url &&
			config.url.includes("/admin/users/") &&
			config.url.includes("/unblock") &&
			config.method === "post"
		) {
			// Simulate user unblocking
			return Promise.reject({
				response: {
					data: {
						message: "User unblocked successfully",
					},
				},
			});
		}

		if (config.url === "/admin/invites" && config.method === "get") {
			// Simulate invitation list
			return Promise.reject({
				response: {
					data: [
						{
							id: "1",
							email: "admin1@test.com",
							name: "Иван Иванов",
							role: "ADMIN",
							status: "PENDING",
							createdAt: new Date().toISOString(),
							expiresAt: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: "2",
							email: "supervisor@test.com",
							name: "Петр Петров",
							role: "SUPERVISOR",
							status: "ACCEPTED",
							createdAt: new Date(
								Date.now() - 2 * 24 * 60 * 60 * 1000
							).toISOString(),
							expiresAt: new Date(
								Date.now() + 5 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
						{
							id: "3",
							email: "admin2@test.com",
							name: "Анна Сидорова",
							role: "ADMIN",
							status: "EXPIRED",
							createdAt: new Date(
								Date.now() - 10 * 24 * 60 * 60 * 1000
							).toISOString(),
							expiresAt: new Date(
								Date.now() - 3 * 24 * 60 * 60 * 1000
							).toISOString(),
						},
					],
				},
			});
		}

		if (config.url === "/admin/init" && config.method === "post") {
			// Simulate successful administrator initialization
			return Promise.reject({
				response: {
					data: {
						message: "Admin initialized",
						email: config.data?.email || "admin@test.com",
						id: 123456789,
						google2faSecret: "JBSWY3DPEHPK3PXP",
						otpAuthUrl:
							"otpauth://totp/Nebulahunt%20Admin%20(admin@test.com)?secret=JBSWY3DPEHPK3PXP&issuer=Nebulahunt",
					},
				},
			});
		}

		if (config.url === "/admin/supervisor/init" && config.method === "post") {
			// Simulate successful supervisor initialization
			return Promise.reject({
				response: {
					data: {
						message: "Supervisor initialized",
						email: "supervisor@test.com",
						id: 999999999,
						google2faSecret: "JBSWY3DPEHPK3PXP",
						otpAuthUrl:
							"otpauth://totp/Nebulahunt%20Supervisor%20(supervisor@test.com)?secret=JBSWY3DPEHPK3PXP&issuer=Nebulahunt",
					},
				},
			});
		}

		if (config.url === "/admin/settings" && config.method === "get") {
			// Return test settings
			return Promise.reject({
				response: {
					data: {
						DAILY_BONUS_STARDUST: 50,
						DAILY_BONUS_DARK_MATTER: 5,
						GALAXY_BASE_PRICE: 100,
						ARTIFACT_DROP_RATE: 0.1,
						LEADERBOARD_LIMIT: 100,
					},
				},
			});
		}

		if (config.url === "/admin/settings" && config.method === "put") {
			// Simulate successful settings save
			return Promise.reject({
				response: {
					data: {
						message: "Settings updated successfully",
						settings: config.data,
					},
				},
			});
		}

		return config;
	});
}

// Request interceptor for adding token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// In development mode, handle mock responses
		if (isDevelopment() && enableMockApi && error.response?.data) {
			// Если это мок-ответ, обрабатываем его как успешный
			if (error.response.data.message || error.response.data.settings) {
				return Promise.resolve(error.response);
			}
		}

		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const refreshToken = localStorage.getItem("refreshToken");
			if (refreshToken) {
				try {
					// Пытаемся обновить токен через админский endpoint
					const response = await axios.post("/api/admin/refresh", {
						refreshToken,
					});

					const { accessToken } = response.data;
					localStorage.setItem("accessToken", accessToken);

					originalRequest.headers.Authorization = `Bearer ${accessToken}`;
					return api(originalRequest);
				} catch (refreshError) {
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					window.location.href = "/login";
					return Promise.reject(refreshError);
				}
			}
		}

		return Promise.reject(error);
	}
);

// Artifact Template API functions
export const artifactTemplateApi = {
	// Get all artifact templates
	getAll: () => api.get("/artifact-templates"),

	// Get artifact template by slug
	getBySlug: (slug: string) => api.get(`/artifact-templates/${slug}`),

	// Create artifact templates
	create: (artifacts: any[]) => api.post("/artifact-templates", artifacts),

	// Update artifact template
	update: (artifact: any) =>
		api.put(`/artifact-templates/${artifact.slug}`, artifact),

	// Delete artifact template
	delete: (slug: string) => api.delete(`/artifact-templates/${slug}`),
};

export { api };
