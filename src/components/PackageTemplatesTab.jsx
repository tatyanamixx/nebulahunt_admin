import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import {
	Plus,
	Edit,
	Trash2,
	Download,
	Upload,
	X,
	Package,
	AlertCircle,
	FolderOpen,
} from "lucide-react";

export default function PackageTemplatesTab({ className = "" }) {
	const [templates, setTemplates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState("success");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showJsonModal, setShowJsonModal] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState(null);
	const [jsonInput, setJsonInput] = useState("");
	const [jsonError, setJsonError] = useState("");
	const [fileInputRef, setFileInputRef] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState(null);

	// Form states
	const [formData, setFormData] = useState({
		slug: "",
		name: "",
		description: "",
		// New structure fields
		category: "resourcePurchase",
		actionType: "fixedAmount",
		actionTarget: "reward",
		actionData: {},
		costData: {},
		status: true,
		icon: "",
		sortOrder: 0,
		labelKey: "",
		isPromoted: false,
		validUntil: "",
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await api.get("/package-templates");
			console.log("Package templates response:", response.data);
			// Ensure we have proper data structure
			const templatesData = response.data?.data || response.data || [];
			console.log("Processed package templates data:", templatesData);
			setTemplates(templatesData);
		} catch (error) {
			console.error("Error fetching package templates:", error);
			showMessage("Failed to fetch package templates", "error");
		} finally {
			setLoading(false);
		}
	};

	const showMessage = (text, type) => {
		setMessage(text);
		setMessageType(type);
		setTimeout(() => setMessage(""), 5000);
	};

	const resetForm = () => {
		setFormData({
			slug: "",
			name: "",
			description: "",
			category: "resourcePurchase",
			actionType: "fixedAmount",
			actionTarget: "reward",
			actionData: { resource: "stardust", amount: 1000 },
			costData: { price: 99, currency: "tgStars" },
			status: true,
			icon: "",
			sortOrder: 0,
			labelKey: "",
			isPromoted: false,
			validUntil: "",
		});
		setJsonInput("");
		setJsonError("");
	};

	const handleCreateFromJson = async () => {
		try {
			setJsonError("");
			const parsedData = JSON.parse(jsonInput);

			if (!Array.isArray(parsedData)) {
				setJsonError("JSON must be an array of package templates");
				return;
			}

			// Remove id field from each template to avoid database constraint violation
			const cleanedData = parsedData.map((template) => {
				const { id, createdAt, updatedAt, ...cleanTemplate } = template;
				// Clean up validUntil - remove empty strings
				if (
					cleanTemplate.validUntil &&
					cleanTemplate.validUntil.trim() === ""
				) {
					delete cleanTemplate.validUntil;
				}
				return cleanTemplate;
			});

			const response = await api.post("/package-templates", cleanedData);
			showMessage("Package templates created successfully", "success");
			setShowJsonModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			if (error.name === "SyntaxError") {
				setJsonError("Invalid JSON format");
			} else {
				console.error("Error creating package templates:", error);
				setJsonError(
					error.response?.data?.message ||
						"Failed to create package templates"
				);
			}
		}
	};

	const handleFileUpload = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result;
				const parsedData = JSON.parse(content);

				if (!Array.isArray(parsedData)) {
					setJsonError(
						"JSON file must contain an array of package templates"
					);
					return;
				}

				// Clean the data by removing id, createdAt, updatedAt fields
				const cleanedData = parsedData.map((template) => {
					const { id, createdAt, updatedAt, ...cleanTemplate } = template;
					// Clean up validUntil - remove empty strings
					if (
						cleanTemplate.validUntil &&
						cleanTemplate.validUntil.trim() === ""
					) {
						delete cleanTemplate.validUntil;
					}
					return cleanTemplate;
				});

				setJsonInput(JSON.stringify(cleanedData, null, 2));
				setJsonError("");
			} catch (error) {
				setJsonError("Invalid JSON file format");
			}
		};
		reader.readAsText(file);
	};

	const handleCreateTemplate = async () => {
		try {
			if (
				!formData.slug ||
				!formData.name ||
				!formData.category ||
				!formData.actionType ||
				!formData.actionTarget
			) {
				showMessage(
					"Please fill in all required fields (slug, name, category, action type, action target)",
					"error"
				);
				return;
			}

			// Validate actionData and costData are valid JSON objects
			if (
				typeof formData.actionData !== "object" ||
				formData.actionData === null
			) {
				showMessage("Action Data must be a valid JSON object", "error");
				return;
			}

			if (
				typeof formData.costData !== "object" ||
				formData.costData === null
			) {
				showMessage("Cost Data must be a valid JSON object", "error");
				return;
			}

			// Clean up formData - remove empty validUntil
			const cleanedData = {
				...formData,
				validUntil:
					formData.validUntil && formData.validUntil.trim() !== ""
						? formData.validUntil
						: undefined,
			};

			const response = await api.post("/package-templates", [cleanedData]);
			showMessage("Package template created successfully", "success");
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error creating package template:", error);
			showMessage(
				error.response?.data?.message || "Failed to create package template",
				"error"
			);
		}
	};

	const handleUpdateTemplate = async () => {
		try {
			if (!editingTemplate?.slug) return;

			if (
				!formData.slug ||
				!formData.name ||
				!formData.category ||
				!formData.actionType ||
				!formData.actionTarget
			) {
				showMessage(
					"Please fill in all required fields (slug, name, category, action type, action target)",
					"error"
				);
				return;
			}

			// Validate actionData and costData are valid JSON objects
			if (
				typeof formData.actionData !== "object" ||
				formData.actionData === null
			) {
				showMessage("Action Data must be a valid JSON object", "error");
				return;
			}

			if (
				typeof formData.costData !== "object" ||
				formData.costData === null
			) {
				showMessage("Cost Data must be a valid JSON object", "error");
				return;
			}

			// Clean up formData - remove empty validUntil
			const cleanedData = {
				...formData,
				validUntil:
					formData.validUntil && formData.validUntil.trim() !== ""
						? formData.validUntil
						: undefined,
			};

			const response = await api.put(
				`/package-templates/${encodeURIComponent(editingTemplate.slug)}`,
				cleanedData
			);
			showMessage("Package template updated successfully", "success");
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error updating package template:", error);
			showMessage(
				error.response?.data?.message || "Failed to update package template",
				"error"
			);
		}
	};

	const handleDeleteTemplate = async (template) => {
		setTemplateToDelete(template);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!templateToDelete) return;

		try {
			await api.delete(
				`/package-templates/${encodeURIComponent(templateToDelete.slug)}`
			);
			showMessage("Package template deleted successfully", "success");
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error) {
			console.error("Error deleting package template:", error);
			showMessage(
				error.response?.data?.message || "Failed to delete package template",
				"error"
			);
		}
	};

	const handleToggleStatus = async (slug) => {
		try {
			await api.put(`/package-templates/${encodeURIComponent(slug)}/toggle`);
			showMessage("Package template status toggled successfully", "success");
			fetchTemplates();
		} catch (error) {
			console.error("Error toggling package template status:", error);
			showMessage(
				error.response?.data?.message ||
					"Failed to toggle package template status",
				"error"
			);
		}
	};

	const openEditModal = (template) => {
		console.log("Opening edit modal with package template:", template);
		setEditingTemplate(template);
		const formData = {
			slug: template.slug || "",
			name: template.name || "",
			description: template.description || "",
			category: template.category || "resourcePurchase",
			actionType: template.actionType || "fixedAmount",
			actionTarget: template.actionTarget || "reward",
			actionData: template.actionData || {},
			costData: template.costData || {},
			status: template.status ?? true,
			icon: template.icon || "",
			sortOrder: template.sortOrder || 0,
			labelKey: template.labelKey || "",
			isPromoted: template.isPromoted ?? false,
			validUntil: template.validUntil || "",
		};
		console.log("Setting form data:", formData);
		setFormData(formData);
		setShowEditModal(true);
	};

	const downloadTemplate = (template) => {
		// Экспортируем только нужные поля, исключая legacy и служебные
		const cleanTemplate = {
			slug: template.slug,
			name: template.name,
			description: template.description,
			category: template.category,
			actionType: template.actionType,
			actionTarget: template.actionTarget,
			actionData: template.actionData,
			costData: template.costData,
			status: template.status,
			icon: template.icon,
			sortOrder: template.sortOrder,
			labelKey: template.labelKey,
			isPromoted: template.isPromoted,
			validUntil: template.validUntil,
		};

		const dataStr = JSON.stringify(cleanTemplate, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
		const exportFileDefaultName = `${template.slug}.json`;

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	const downloadAllTemplates = () => {
		// Экспортируем только нужные поля для всех шаблонов
		const cleanTemplates = templates.map((template) => ({
			slug: template.slug,
			name: template.name,
			description: template.description,
			category: template.category,
			actionType: template.actionType,
			actionTarget: template.actionTarget,
			actionData: template.actionData,
			costData: template.costData,
			status: template.status,
			icon: template.icon,
			sortOrder: template.sortOrder,
			labelKey: template.labelKey,
			isPromoted: template.isPromoted,
			validUntil: template.validUntil,
		}));

		const dataStr = JSON.stringify(cleanTemplates, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
		const exportFileDefaultName = "package-templates.json";

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	const getPackageCardColor = (template) => {
		// Определяем цвет на основе категории и типа действия
		if (template.category === "resourcePurchase") {
			// Для ресурсов определяем цвет по типу ресурса
			if (template.actionData && template.actionData.resource) {
				switch (template.actionData.resource) {
					case "stardust":
						return "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600";
					case "darkMatter":
						return "bg-gradient-to-r from-purple-900 to-purple-800 border-purple-600";
					case "stars":
						return "bg-gradient-to-r from-yellow-900 to-yellow-800 border-yellow-600";
					default:
						return "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600";
				}
			}
			return "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600";
		} else if (template.category === "gameObject") {
			// Для игровых объектов
			return "bg-gradient-to-r from-green-900 to-green-800 border-green-600";
		}

		// По умолчанию
		return "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600";
	};

	const getResourceIcon = (template) => {
		if (
			template.category === "resourcePurchase" &&
			template.actionData &&
			template.actionData.resource
		) {
			switch (template.actionData.resource) {
				case "stardust":
					return "💫";
				case "darkMatter":
					return "🌌";
				case "stars":
					return "⭐";
				default:
					return "📦";
			}
		} else if (template.category === "gameObject") {
			return "🎮";
		}
		return "📦";
	};

	const getActionTypeIcon = (template) => {
		if (template.actionType === "fixedAmount") return "💎";
		if (template.actionType === "variableAmount") return "🔄";
		if (template.actionType === "updateField") return "⚙️";
		return "📋";
	};

	if (loading) {
		return (
			<div className={`flex items-center justify-center p-8 ${className}`}>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				<span className="ml-2 text-white">Loading package templates...</span>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div></div>
				<div className="flex space-x-2">
					<button
						onClick={() => setShowJsonModal(true)}
						title="Import from JSON"
						className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
					>
						<Upload className="h-4 w-4 mr-2" />
						Import JSON
					</button>
					<button
						onClick={downloadAllTemplates}
						title="Export all templates"
						className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
					>
						<Download className="h-4 w-4 mr-2" />
						Export All
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
						title="Create new template"
						className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
					>
						<Plus className="h-4 w-4 mr-2" />
						Create Template
					</button>
				</div>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`p-3 rounded-md ${
						messageType === "success"
							? "bg-green-600 text-white"
							: "bg-red-600 text-white"
					}`}
				>
					{message}
				</div>
			)}

			{/* Templates List */}
			<div className="bg-gray-800 rounded-lg p-6">
				{templates.length === 0 ? (
					<div className="text-center py-8">
						<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-400">No package templates found</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
						>
							<Plus className="h-4 w-4 mr-2" />
							Create First Template
						</button>
					</div>
				) : (
					<div className="space-y-4">
						{templates.map((template) => (
							<div
								key={template.slug}
								className={`${getPackageCardColor(
									template
								)} rounded-lg p-4 border shadow-lg hover:opacity-90 transition-all duration-200`}
							>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<span className="text-2xl">
												{getResourceIcon(template)}
											</span>
											<div>
												<h3 className="text-lg font-semibold text-white">
													{template.name}
												</h3>
												<span className="text-sm text-gray-300">
													({template.slug})
												</span>
											</div>
											{template.isPromoted && (
												<span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded">
													Promoted
												</span>
											)}
											{!template.status && (
												<span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
													Disabled
												</span>
											)}
										</div>
										{template.description && (
											<p className="text-gray-300 mb-2">
												{template.description}
											</p>
										)}
										<div className="space-y-2 text-sm">
											{/* New structure fields */}
											<div className="flex items-center">
												<span className="text-gray-400 w-24">
													Category:
												</span>
												<span className="text-white font-medium">
													{template.category || "N/A"}
												</span>
											</div>
											<div className="flex items-center">
												<span className="text-gray-400 w-24">
													Action:
												</span>
												<span className="text-white font-medium">
													{template.actionType || "N/A"}
												</span>
											</div>
											<div className="flex items-center">
												<span className="text-gray-400 w-24">
													Target:
												</span>
												<span className="text-white font-medium">
													{template.actionTarget || "N/A"}
												</span>
											</div>
											<div className="flex items-center">
												<span className="text-gray-400 w-24">
													Sort Order:
												</span>
												<span className="text-white font-medium">
													{template.sortOrder || 0}
												</span>
											</div>

											<div className="flex items-start">
												<span className="text-gray-400 w-24">
													Label Key:
												</span>
												<span className="text-white font-medium break-all max-w-md">
													{template.labelKey || "N/A"}
												</span>
											</div>
										</div>
									</div>
									<div className="flex space-x-2 ml-4">
										<button
											onClick={() =>
												downloadTemplate(template)
											}
											title="Export template as JSON"
											className="inline-flex items-center px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
										>
											<Download className="h-3 w-3 mr-1" />
											Export
										</button>
										<button
											onClick={() => openEditModal(template)}
											title="Edit template"
											className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
										>
											<Edit className="h-3 w-3 mr-1" />
											Edit
										</button>
										<button
											onClick={() =>
												handleToggleStatus(template.slug)
											}
											title={
												template.status
													? "Disable template"
													: "Enable template"
											}
											className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
												template.status
													? "bg-yellow-600 hover:bg-yellow-700 text-white"
													: "bg-green-600 hover:bg-green-700 text-white"
											}`}
										>
											{template.status ? "Disable" : "Enable"}
										</button>
										<button
											onClick={() =>
												handleDeleteTemplate(template)
											}
											title="Delete template"
											className="inline-flex items-center px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
										>
											<Trash2 className="h-3 w-3 mr-1" />
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Create Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Create Package Template
							</h3>
							<button
								onClick={() => {
									setShowCreateModal(false);
									resetForm();
								}}
								title="Close modal"
								className="text-gray-400 hover:text-white"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<PackageTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleCreateTemplate}
							submitText="Create Template"
						/>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{showEditModal && editingTemplate && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Edit Package Template
							</h3>
							<button
								onClick={() => {
									setShowEditModal(false);
									setEditingTemplate(null);
									resetForm();
								}}
								title="Close modal"
								className="text-gray-400 hover:text-white"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<PackageTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleUpdateTemplate}
							submitText="Update Template"
						/>
					</div>
				</div>
			)}

			{/* JSON Import Modal */}
			{showJsonModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Import Package Templates from JSON
							</h3>
							<button
								onClick={() => {
									setShowJsonModal(false);
									resetForm();
								}}
								title="Close modal"
								className="text-gray-400 hover:text-white"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<button
									onClick={() => fileInputRef?.click()}
									className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
								>
									<FolderOpen className="h-4 w-4 mr-2" />
									Choose File
								</button>
								<input
									ref={setFileInputRef}
									type="file"
									accept=".json"
									onChange={handleFileUpload}
									className="hidden"
									aria-label="Upload JSON file"
								/>
								<a
									href="/examples/package-templates-example.json"
									download
									className="text-sm text-blue-400 hover:text-blue-300 underline"
								>
									Download Example
								</a>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									JSON Content
								</label>
								<textarea
									value={jsonInput}
									onChange={(e) => setJsonInput(e.target.value)}
									className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
									placeholder={`[
  {
    "slug": "basic-stardust",
    "name": "Basic Stardust Pack",
    "description": "1000 stardust for basic needs",
    "category": "resourcePurchase",
    "actionType": "fixedAmount",
    "actionTarget": "reward",
    "actionData": {"resource": "stardust", "amount": 1000},
    "costData": {"price": 99, "currency": "tgStars"},
    "status": true,
    "icon": "📦",
    "sortOrder": 1,
    "labelKey": "store.basicPack",
    "isPromoted": false
  },
  {
    "slug": "dark-matter-pack",
    "name": "Dark Matter Pack",
    "description": "500 dark matter for advanced needs",
    "category": "resourcePurchase",
    "actionType": "fixedAmount",
    "actionTarget": "reward",
    "actionData": {"resource": "darkMatter", "amount": 500},
    "costData": {"price": 199, "currency": "tgStars"},
    "status": true,
    "icon": "🌌",
    "sortOrder": 2,
    "labelKey": "store.darkMatterPack",
    "isPromoted": false
  },
  {
    "slug": "variable-stardust",
    "name": "Variable Stardust Pack",
    "description": "Variable amount of stardust",
    "category": "resourcePurchase",
    "actionType": "variableAmount",
    "actionTarget": "reward",
    "actionData": {"resource": "stardust", "amount": "{{amount}}"},
    "costData": {"price": 99, "currency": "tgStars"},
    "status": true,
    "icon": "🔄",
    "sortOrder": 3,
    "labelKey": "store.variableStardustPack",
    "isPromoted": false
  },
  {
    "slug": "galaxy-name-update",
    "name": "Update Galaxy Name",
    "description": "Update galaxy name",
    "category": "gameObject",
    "actionType": "updateField",
    "actionTarget": "entity",
    "actionData": {"table": "galaxy", "seed": "{{seed}}", "field": "name", "value": "{{value}}"},
    "costData": {"price": 199, "currency": "tgStars"},
    "status": true,
    "icon": "🌌",
    "sortOrder": 10,
    "labelKey": "store.updateGalaxyName",
    "isPromoted": false
  }
]`}
								/>
							</div>

							{jsonError && (
								<div className="flex items-center p-3 bg-red-600 text-white rounded-md">
									<AlertCircle className="h-4 w-4 mr-2" />
									{jsonError}
								</div>
							)}

							<div className="flex justify-end space-x-2">
								<button
									onClick={() => {
										setShowJsonModal(false);
										resetForm();
									}}
									className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleCreateFromJson}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
								>
									<Upload className="h-4 w-4 mr-2 inline" />
									Import Templates
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && templateToDelete && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Confirm Delete
							</h3>
							<button
								onClick={() => {
									setShowDeleteModal(false);
									setTemplateToDelete(null);
								}}
								title="Close modal"
								className="text-gray-400 hover:text-white"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<div className="mb-6">
							<p className="text-gray-300 mb-2">
								Are you sure you want to delete this package
								template?
							</p>
							<div className="bg-gray-700 p-3 rounded-md">
								<p className="text-white font-medium">
									{templateToDelete.name}
								</p>
								<p className="text-gray-400 text-sm">
									Slug: {templateToDelete.slug}
								</p>
							</div>
						</div>

						<div className="flex justify-end space-x-2">
							<button
								onClick={() => {
									setShowDeleteModal(false);
									setTemplateToDelete(null);
								}}
								className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={confirmDelete}
								className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
							>
								<Trash2 className="h-4 w-4 mr-2 inline" />
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Package Template Form Component
function PackageTemplateForm({ formData, setFormData, onSubmit, submitText }) {
	const updateField = (field, value) => {
		const newFormData = { ...formData, [field]: value };

		// Auto-update actionData and costData based on selections
		if (
			field === "actionType" ||
			field === "actionTarget" ||
			field === "category"
		) {
			// Update actionData based on actionType and actionTarget
			if (
				newFormData.actionType === "fixedAmount" &&
				newFormData.actionTarget === "reward"
			) {
				newFormData.actionData = {
					resource: "stardust",
					amount: 1000,
				};
			} else if (
				newFormData.actionType === "variableAmount" &&
				newFormData.actionTarget === "reward"
			) {
				newFormData.actionData = {
					resource: "stardust",
					amount: "{{amount}}",
				};
			} else if (
				newFormData.actionType === "updateField" &&
				newFormData.actionTarget === "entity"
			) {
				newFormData.actionData = {
					table: "galaxy",
					seed: "{{seed}}",
					field: "{{field}}",
					value: "{{value}}",
				};
			}

			// Update costData based on actionType
			if (
				newFormData.actionType === "fixedAmount" ||
				newFormData.actionType === "variableAmount"
			) {
				newFormData.costData = {
					price: 99,
					currency: "tgStars",
				};
			} else if (newFormData.actionType === "updateField") {
				newFormData.costData = {
					price: 99,
					currency: "tgStars",
				};
			}
		}

		// Handle JSON fields
		if (field === "actionData" || field === "costData") {
			try {
				// Try to parse as JSON if it's a string
				if (typeof value === "string") {
					const parsed = JSON.parse(value);
					newFormData[field] = parsed;
				} else {
					newFormData[field] = value;
				}
			} catch (error) {
				// If parsing fails, store as string (user is still typing)
				newFormData[field] = value;
			}
		}

		setFormData(newFormData);
	};

	const loadExample = (exampleName) => {
		let exampleData = {};
		switch (exampleName) {
			case "stardust_fixed":
				exampleData = {
					slug: "basic-stardust-pack",
					name: "Basic Stardust Pack",
					description: "1000 stardust for basic needs",
					category: "resourcePurchase",
					actionType: "fixedAmount",
					actionTarget: "reward",
					actionData: { resource: "stardust", amount: 1000 },
					costData: { price: 99, currency: "tgStars" },
					status: true,
					icon: "📦",
					sortOrder: 1,
					labelKey: "store.basicPack",
					isPromoted: false,
					validUntil: "",
				};
				break;
			case "darkmatter_fixed":
				exampleData = {
					slug: "dark-matter-pack",
					name: "Dark Matter Pack",
					description: "500 dark matter for advanced needs",
					category: "resourcePurchase",
					actionType: "fixedAmount",
					actionTarget: "reward",
					actionData: { resource: "darkMatter", amount: 500 },
					costData: { price: 199, currency: "tgStars" },
					status: true,
					icon: "🌌",
					sortOrder: 2,
					labelKey: "store.darkMatterPack",
					isPromoted: false,
					validUntil: "",
				};
				break;
			case "stardust_variable":
				exampleData = {
					slug: "variable-stardust-pack",
					name: "Variable Stardust Pack",
					description: "Variable amount of stardust",
					category: "resourcePurchase",
					actionType: "variableAmount",
					actionTarget: "reward",
					actionData: { resource: "stardust", amount: "{{amount}}" },
					costData: { price: 99, currency: "tgStars" },
					status: true,
					icon: "🔄",
					sortOrder: 3,
					labelKey: "store.variableStardustPack",
					isPromoted: false,
					validUntil: "",
				};
				break;
			case "galaxy_name":
				exampleData = {
					slug: "update-galaxy-name",
					name: "Update Galaxy Name",
					description: "Update galaxy name",
					category: "gameObject",
					actionType: "updateField",
					actionTarget: "entity",
					actionData: {
						table: "galaxy",
						seed: "{{seed}}",
						field: "name",
						value: "{{value}}",
					},
					costData: { price: 99, currency: "tgStars" },
					status: true,
					icon: "🌌",
					sortOrder: 10,
					labelKey: "store.updateGalaxyName",
					isPromoted: false,
					validUntil: "",
				};
				break;
			case "galaxy_field":
				exampleData = {
					slug: "update-galaxy-field",
					name: "Update Galaxy Field",
					description: "Update a specific field on the galaxy",
					category: "gameObject",
					actionType: "updateField",
					actionTarget: "entity",
					actionData: {
						table: "galaxy",
						seed: "{{seed}}",
						field: "name",
						value: "{{value}}",
					},
					costData: { price: 99, currency: "tgStars" },
					status: true,
					icon: "⚙️",
					sortOrder: 11,
					labelKey: "store.updateGalaxyField",
					isPromoted: false,
					validUntil: "",
				};
				break;
			case "custom":
				exampleData = {
					slug: "custom-package",
					name: "Custom Package",
					description: "A package with custom action and cost",
					category: "resourcePurchase", // Or gameObject
					actionType: "fixedAmount", // Or variableAmount, updateField
					actionTarget: "reward", // Or entity
					actionData: { resource: "gold", amount: 100 }, // Or table, seed, field, value
					costData: { price: 199, currency: "tgStars" }, // Or price, currency
					status: true,
					icon: "🎨",
					sortOrder: 12,
					labelKey: "store.customPackage",
					isPromoted: false,
					validUntil: "",
				};
				break;
			default:
				break;
		}
		setFormData(exampleData);
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Slug *
					</label>
					<input
						type="text"
						value={formData.slug || ""}
						onChange={(e) =>
							updateField("slug", e.target.value.replace(/\s+/g, "-"))
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="basic-stardust-pack"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Name *
					</label>
					<input
						type="text"
						value={formData.name || ""}
						onChange={(e) => updateField("name", e.target.value)}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="Basic Stardust Pack"
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Description
				</label>
				<textarea
					value={formData.description || ""}
					onChange={(e) => updateField("description", e.target.value)}
					className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					rows={3}
					placeholder="Description of the package..."
				/>
			</div>

			{/* New structure fields */}
			<div className="mb-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-600 rounded-md">
				<h4 className="text-sm font-medium text-blue-300 mb-2">
					🚀 Package Structure Guide
				</h4>
				<div className="text-xs text-blue-200 space-y-1">
					<p>
						<strong>Resource Packages:</strong> Give players stardust,
						dark matter, or other resources
					</p>
					<p>
						<strong>Game Object Packages:</strong> Update galaxy names,
						fields, or other game entities
					</p>
					<p>
						<strong>Variable Packages:</strong> Use placeholders like{" "}
						&#123;&#123;amount&#125;&#125;, &#123;&#123;seed&#125;&#125;,
						&#123;&#123;value&#125;&#125; for dynamic content
					</p>
					<p>
						<strong>All data is stored in JSONB fields:</strong>{" "}
						actionData (what the package does) and costData (how much it
						costs)
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Category *
					</label>
					<select
						value={formData.category || "resourcePurchase"}
						onChange={(e) => updateField("category", e.target.value)}
						aria-label="Select category"
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="resourcePurchase">Resource Purchase</option>
						<option value="gameObject">Game Object</option>
					</select>
					<p className="text-xs text-gray-400 mt-1">
						{formData.category === "resourcePurchase"
							? "💫 For buying resources like stardust, dark matter, stars"
							: "🎮 For game object updates like galaxy names, fields, or other entities"}
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Action Type *
					</label>
					<select
						value={formData.actionType || "fixedAmount"}
						onChange={(e) => updateField("actionType", e.target.value)}
						aria-label="Select action type"
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="fixedAmount">Fixed Amount</option>
						<option value="variableAmount">Variable Amount</option>
						<option value="updateField">Update Field</option>
					</select>
					<p className="text-xs text-gray-400 mt-1">
						{formData.actionType === "fixedAmount"
							? "💫 Fixed resource amount - gives exact amount to player"
							: formData.actionType === "variableAmount"
							? "🔄 Variable amount - use {{amount}} placeholder for dynamic values"
							: "⚙️ Update game object fields - modify galaxy names, properties, etc."}
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Action Target *
					</label>
					<select
						value={formData.actionTarget || "reward"}
						onChange={(e) => updateField("actionTarget", e.target.value)}
						aria-label="Select action target"
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="reward">Reward</option>
						<option value="entity">Entity</option>
					</select>
					<p className="text-xs text-gray-400 mt-1">
						{formData.actionTarget === "reward"
							? "🎁 Give resources to player - stardust, dark matter, etc."
							: "🎯 Update game object - galaxy names, properties, or other entities"}
					</p>
				</div>
			</div>

			{/* Action Data */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Action Data (JSON) *
					</label>
					<textarea
						name="actionData"
						value={
							typeof formData.actionData === "object"
								? JSON.stringify(formData.actionData, null, 2)
								: formData.actionData
						}
						onChange={(e) => updateField("actionData", e.target.value)}
						className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
						rows={4}
						placeholder="Enter JSON data for the package action"
					/>
					<p className="text-xs text-gray-400 mt-1">
						{formData.category === "resourcePurchase" &&
						formData.actionType === "fixedAmount" &&
						formData.actionTarget === "reward"
							? '💫 Fixed Resource: {"resource": "stardust", "amount": 10000}'
							: formData.category === "resourcePurchase" &&
							  formData.actionType === "variableAmount" &&
							  formData.actionTarget === "reward"
							? '🔄 Variable Resource: {"resource": "stardust", "amount": "{{amount}}"}'
							: formData.category === "gameObject" &&
							  formData.actionType === "updateField" &&
							  formData.actionTarget === "entity"
							? '🎯 Update Galaxy: {"table": "galaxy", "seed": "{{seed}}", "field": "name", "value": "{{value}}"}'
							: "📝 Define what the package does when used"}
					</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Cost Data (JSON) *
					</label>
					<textarea
						name="costData"
						value={
							typeof formData.costData === "object"
								? JSON.stringify(formData.costData, null, 2)
								: formData.costData
						}
						onChange={(e) => updateField("costData", e.target.value)}
						className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
						rows={4}
						placeholder="Enter JSON data for the package cost"
					/>
					<p className="text-xs text-gray-400 mt-1">
						{formData.category === "resourcePurchase"
							? '💰 Resource Cost: {"price": 99, "currency": "tgStars"} - Use tgStars for Telegram Stars'
							: formData.category === "gameObject"
							? '🎮 Game Object Cost: {"price": 199, "currency": "tgStars"} - Higher price for special features'
							: "💵 Define the cost of the package - price in numbers, currency as string"}
					</p>
				</div>
			</div>

			{/* Quick Examples Section */}
			<div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-md">
				<h4 className="text-sm font-medium text-gray-300 mb-3">
					🚀 Quick Examples - Click to load template
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					<button
						type="button"
						onClick={() => loadExample("stardust_fixed")}
						className="p-2 text-xs bg-blue-900 hover:bg-blue-800 border border-blue-600 rounded text-blue-200 hover:text-white transition-colors"
						title="Basic stardust pack: 1000 stardust for 99 tgStars"
					>
						💫 Fixed Stardust
					</button>
					<button
						type="button"
						onClick={() => loadExample("darkmatter_fixed")}
						className="p-2 text-xs bg-purple-900 hover:bg-purple-800 border border-purple-600 rounded text-purple-200 hover:text-white transition-colors"
						title="Dark matter pack: 500 dark matter for 199 tgStars"
					>
						🌌 Fixed Dark Matter
					</button>
					<button
						type="button"
						onClick={() => loadExample("stardust_variable")}
						className="p-2 text-xs bg-green-900 hover:bg-green-800 border border-green-600 rounded text-green-200 hover:text-white transition-colors"
						title="Variable stardust: dynamic amount with {{amount}} placeholder"
					>
						🔄 Variable Stardust
					</button>
					<button
						type="button"
						onClick={() => loadExample("galaxy_name")}
						className="p-2 text-xs bg-yellow-900 hover:bg-yellow-800 border border-yellow-600 rounded text-yellow-200 hover:text-white transition-colors"
						title="Update galaxy name: modify galaxy names for 199 tgStars"
					>
						🎯 Galaxy Name Update
					</button>
					<button
						type="button"
						onClick={() => loadExample("galaxy_field")}
						className="p-2 text-xs bg-red-900 hover:bg-red-800 border border-red-600 rounded text-red-200 hover:text-white transition-colors"
						title="Update galaxy field: modify any galaxy property for 199 tgStars"
					>
						⚙️ Galaxy Field Update
					</button>
					<button
						type="button"
						onClick={() => loadExample("custom")}
						className="p-2 text-xs bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded text-gray-300 hover:text-white transition-colors"
						title="Custom package: template for creating your own package type"
					>
						🎨 Custom Package
					</button>
				</div>
				<p className="text-xs text-gray-400 mt-3">
					💡 <strong>Tip:</strong> Use these examples as starting points,
					then customize the values, names, and descriptions to match your
					needs!
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Label Key
					</label>
					<input
						type="text"
						value={formData.labelKey || ""}
						onChange={(e) => updateField("labelKey", e.target.value)}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="store.basicPack or store.premium.package.name"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Sort Order
					</label>
					<input
						type="number"
						value={formData.sortOrder || 0}
						onChange={(e) =>
							updateField("sortOrder", parseInt(e.target.value) || 0)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="0"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Valid Until
					</label>
					<input
						type="datetime-local"
						value={formData.validUntil || ""}
						onChange={(e) => updateField("validUntil", e.target.value)}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Icon
					</label>
					<input
						type="text"
						value={formData.icon || ""}
						onChange={(e) => updateField("icon", e.target.value)}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="📦"
					/>
				</div>
			</div>

			<div className="flex items-center space-x-4">
				<label className="flex items-center">
					<input
						type="checkbox"
						checked={formData.status ?? true}
						onChange={(e) => updateField("status", e.target.checked)}
						aria-label="Set template as active"
						className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
					/>
					<span className="ml-2 text-gray-300">Active</span>
				</label>

				<label className="flex items-center">
					<input
						type="checkbox"
						checked={formData.isPromoted ?? false}
						onChange={(e) => updateField("isPromoted", e.target.checked)}
						aria-label="Set template as promoted"
						className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
					/>
					<span className="ml-2 text-gray-300">Promoted</span>
				</label>
			</div>

			<div className="flex justify-end space-x-2">
				<button
					onClick={onSubmit}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
				>
					{submitText}
				</button>
			</div>
		</div>
	);
}
