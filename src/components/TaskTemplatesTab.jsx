import { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import {
	Plus,
	Edit,
	Trash2,
	Eye,
	EyeOff,
	Upload,
	Download,
	Save,
	X,
	Check,
	AlertCircle,
	FileText,
	Settings,
	FolderOpen,
} from "lucide-react";

export default function TaskTemplatesTab({ className = "" }) {
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
		title: { en: "", ru: "" },
		description: { en: "", ru: "" },
		reward: { type: "stardust", amount: 0 },
		condition: {},
		icon: "🎯",
		active: true,
		isDaily: false,
		sortOrder: 0, // Будет установлен автоматически
		category: "stardust",
		checkType: "stardust_count",
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await api.get("/task-templates");
			console.log("Templates response:", response.data);
			// Ensure we have proper data structure
			const templatesData = response.data?.data || response.data || [];
			console.log("Processed templates data:", templatesData);
			setTemplates(templatesData);
		} catch (error) {
			console.error("Error fetching templates:", error);
			showMessage("Failed to fetch task templates", "error");
		} finally {
			setLoading(false);
		}
	};

	const showMessage = (text, type) => {
		setMessage(text);
		setMessageType(type);
		setTimeout(() => setMessage(""), 5000);
	};

	const getTaskCardColor = (template) => {
		// Определяем цвет на основе типа награды
		if (template.reward && template.reward.type) {
			switch (template.reward.type) {
				case "stardust":
					return "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600";
				case "darkMatter":
					return "bg-gradient-to-r from-purple-900 to-purple-800 border-purple-600";
				case "stars":
					return "bg-gradient-to-r from-yellow-900 to-yellow-800 border-yellow-600";
				case "tonToken":
					return "bg-gradient-to-r from-green-900 to-green-800 border-green-600";
				default:
					return "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600";
			}
		}

		// Если нет награды, определяем по категории
		if (template.category) {
			switch (template.category) {
				case "daily":
					return "bg-gradient-to-r from-orange-900 to-orange-800 border-orange-600";
				case "stardust":
					return "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600";
				case "darkMatter":
					return "bg-gradient-to-r from-purple-900 to-purple-800 border-purple-600";
				default:
					return "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600";
			}
		}

		// По умолчанию
		return "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600";
	};

	const getRewardIcon = (template) => {
		if (template.reward && template.reward.type) {
			switch (template.reward.type) {
				case "stardust":
					return "💫";
				case "darkMatter":
					return "🌌";
				case "stars":
					return "⭐";
				case "tonToken":
					return "💰";
				default:
					return "🎁";
			}
		}
		return template.icon || "🎯";
	};

	const getCategoryIcon = (template) => {
		if (template.category) {
			switch (template.category) {
				case "daily":
					return "📅";
				case "stardust":
					return "💫";
				case "darkMatter":
					return "🌌";
				default:
					return "🎯";
			}
		}
		return "🎯";
	};

	const getCategoryBadgeColor = (category) => {
		switch (category) {
			case "daily":
				return "bg-orange-600 text-white";
			case "stardust":
				return "bg-blue-600 text-white";
			case "darkMatter":
				return "bg-purple-600 text-white";
			case "stars":
				return "bg-yellow-600 text-white";
			case "tonToken":
				return "bg-green-600 text-white";
			default:
				return "bg-gray-600 text-white";
		}
	};

	const sortTemplates = (templates) => {
		return [...templates].sort((a, b) => {
			// Сначала по sortOrder
			const sortOrderA = a.sortOrder || getNextSortOrder();
			const sortOrderB = b.sortOrder || getNextSortOrder();

			if (sortOrderA !== sortOrderB) {
				return sortOrderA - sortOrderB;
			}

			// Затем по категории
			const categoryA = a.category || "";
			const categoryB = b.category || "";

			if (categoryA !== categoryB) {
				return categoryA.localeCompare(categoryB);
			}

			// Наконец по имени
			const nameA = a.name || a.slug || "";
			const nameB = b.name || b.slug || "";

			return nameA.localeCompare(nameB);
		});
	};

	const getNextSortOrder = () => {
		if (templates.length === 0) return 1;
		const maxSortOrder = Math.max(...templates.map((t) => t.sortOrder || 0));
		return maxSortOrder + 1;
	};

	const resetForm = () => {
		setFormData({
			slug: "",
			title: { en: "", ru: "" },
			description: { en: "", ru: "" },
			reward: { type: "stardust", amount: 0 },
			condition: {},
			icon: "🎯",
			active: true,
			isDaily: false,
			sortOrder: getNextSortOrder(),
			category: "stardust",
			checkType: "stardust_count",
		});
		setJsonInput("");
		setJsonError("");
	};

	const handleCreateFromJson = async () => {
		try {
			setJsonError("");
			const parsedData = JSON.parse(jsonInput);

			if (!Array.isArray(parsedData)) {
				setJsonError("JSON must be an array of task templates");
				return;
			}

			// Remove id field from each template to avoid database constraint violation
			const cleanedData = parsedData.map((template) => {
				const { id, createdAt, updatedAt, ...cleanTemplate } = template;
				return cleanTemplate;
			});

			const response = await api.post("/task-templates", cleanedData);
			showMessage("Task templates created successfully", "success");
			setShowJsonModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			if (error.name === "SyntaxError") {
				setJsonError("Invalid JSON format");
			} else {
				console.error("Error creating templates:", error);
				setJsonError(
					error.response?.data?.message || "Failed to create templates"
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
						"JSON file must contain an array of task templates"
					);
					return;
				}

				// Clean the data by removing id, createdAt, updatedAt fields
				const cleanedData = parsedData.map((template) => {
					const { id, createdAt, updatedAt, ...cleanTemplate } = template;
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
			if (!formData.slug || !formData.title.en || !formData.description.en) {
				showMessage(
					"Please fill in all required fields (slug, English title, English description)",
					"error"
				);
				return;
			}

			const response = await api.post("/task-templates", [formData]);
			showMessage("Task template created successfully", "success");
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error creating template:", error);
			showMessage(
				error.response?.data?.message || "Failed to create template",
				"error"
			);
		}
	};

	const handleUpdateTemplate = async () => {
		try {
			if (!editingTemplate?.slug) return;

			const response = await api.put(
				`/task-templates/${encodeURIComponent(editingTemplate.slug)}`,
				formData
			);
			showMessage("Task template updated successfully", "success");
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error updating template:", error);
			showMessage(
				error.response?.data?.message || "Failed to update template",
				"error"
			);
		}
	};

	const handleDeleteTemplate = (template) => {
		setTemplateToDelete(template);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!templateToDelete) return;

		try {
			await api.delete(
				`/task-templates/${encodeURIComponent(templateToDelete.slug)}`
			);
			showMessage("Task template deleted successfully", "success");
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error) {
			console.error("Error deleting template:", error);
			showMessage(
				error.response?.data?.message || "Failed to delete template",
				"error"
			);
		}
	};

	const handleToggleStatus = async (slug) => {
		try {
			await api.put(`/task-templates/${encodeURIComponent(slug)}/toggle`);
			showMessage("Template status toggled successfully", "success");
			fetchTemplates();
		} catch (error) {
			console.error("Error toggling template status:", error);
			showMessage(
				error.response?.data?.message || "Failed to toggle template status",
				"error"
			);
		}
	};

	const openEditModal = (template) => {
		console.log("Opening edit modal with template:", template);
		setEditingTemplate(template);
		const formData = {
			slug: template.slug || "",
			title: template.title || { en: "", ru: "" },
			description: template.description || { en: "", ru: "" },
			reward: template.reward || { type: "stardust", amount: 0 },
			condition: template.condition || {},
			icon: template.icon || "",
			active: template.active ?? true,
			isDaily: template.isDaily ?? false,
			sortOrder: template.sortOrder || getNextSortOrder(),
			category: template.category || "stardust",
			checkType: template.checkType || "always_available",
		};
		console.log("Setting form data:", formData);
		setFormData(formData);
		setShowEditModal(true);
	};

	const downloadTemplate = (template) => {
		const dataStr = JSON.stringify(template, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
		const exportFileDefaultName = `${template.slug}.json`;

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	const downloadAllTemplates = () => {
		const dataStr = JSON.stringify(templates, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
		const exportFileDefaultName = "task-templates.json";

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	if (loading) {
		return (
			<div className={`flex items-center justify-center p-8 ${className}`}>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				<span className="ml-2 text-white">Loading task templates...</span>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div></div>
				<div className="flex items-center space-x-2">
					<button
						onClick={() => setShowJsonModal(true)}
						className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
					>
						<Upload className="h-4 w-4 mr-2" />
						Import JSON
					</button>
					<button
						onClick={downloadAllTemplates}
						className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
					>
						<Download className="h-4 w-4 mr-2" />
						Export All
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
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
					className={`p-4 rounded-md ${
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
						<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-400">No task templates found</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
						>
							<Plus className="h-4 w-4 mr-2" />
							Create First Template
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4">
						{sortTemplates(templates).map((template) => (
							<div
								key={template.slug}
								className={`${getTaskCardColor(
									template
								)} rounded-lg p-6 border-2 shadow-lg transition-all duration-200 hover:shadow-xl`}
							>
								{/* Header Section */}
								<div className="flex items-center space-x-3 mb-4">
									<div className="text-4xl">
										{getRewardIcon(template)}
									</div>
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-1">
											<h3 className="text-xl font-bold text-white">
												{template.title?.en || template.slug}
											</h3>
											<span
												className={`px-2 py-0.5 text-xs font-semibold rounded ${getCategoryBadgeColor(
													template.category
												)}`}
											>
												{template.category}
											</span>
											{template.isDaily && (
												<span className="px-2 py-0.5 text-xs font-semibold bg-orange-600 text-white rounded">
													Daily
												</span>
											)}
											{!template.active && (
												<span className="px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded">
													Disabled
												</span>
											)}
										</div>
										<p className="text-sm text-gray-400 font-mono">
											{template.slug}
										</p>
									</div>
								</div>

								{/* Description */}
								{template.description?.en && (
									<p className="text-white mb-4 text-sm leading-relaxed">
										{template.description.en}
									</p>
								)}

								{/* Main Info Grid */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
									<div className="bg-black bg-opacity-30 rounded-lg p-3">
										<div className="text-xs text-gray-300 mb-1">
											Reward
										</div>
										<div className="text-lg font-bold text-white flex items-center space-x-1">
											<span>{getRewardIcon(template)}</span>
											<span>
												{template.reward?.amount || 0}
											</span>
										</div>
										<div className="text-xs text-gray-300 mt-1">
											{template.reward?.type || "N/A"}
										</div>
									</div>
									<div className="bg-black bg-opacity-30 rounded-lg p-3">
										<div className="text-xs text-gray-300 mb-1">
											Category
										</div>
										<div className="text-lg font-bold text-white flex items-center space-x-1">
											<span>{getCategoryIcon(template)}</span>
											<span>{template.category || "N/A"}</span>
										</div>
									</div>
									<div className="bg-black bg-opacity-30 rounded-lg p-3">
										<div className="text-xs text-gray-300 mb-1">
											Condition
										</div>
										<div className="text-sm font-bold text-white">
											{template.condition?.type || "N/A"}
										</div>
										{template.condition?.threshold && (
											<div className="text-xs text-gray-300 mt-1">
												Threshold:{" "}
												{template.condition.threshold}
											</div>
										)}
									</div>
									<div className="bg-black bg-opacity-30 rounded-lg p-3">
										<div className="text-xs text-gray-300 mb-1">
											Sort Order
										</div>
										<div className="text-lg font-bold text-white">
											{template.sortOrder ||
												getNextSortOrder()}
										</div>
									</div>
								</div>

								{/* Check Type */}
								{template.checkType && (
									<div className="mb-4">
										<div className="bg-black bg-opacity-30 rounded-lg p-3">
											<div className="text-xs text-gray-300 mb-1">
												Check Type
											</div>
											<div className="text-sm font-semibold text-white">
												{template.checkType}
											</div>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="mt-4 pt-4 border-t border-white border-opacity-20 flex justify-end space-x-2">
									<button
										onClick={() => downloadTemplate(template)}
										title="Export"
										className="inline-flex items-center px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
									>
										<Download className="h-4 w-4 mr-1" />
										Export
									</button>
									<button
										onClick={() => openEditModal(template)}
										title="Edit"
										className="inline-flex items-center px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
									>
										<Edit className="h-4 w-4 mr-1" />
										Edit
									</button>
									<button
										onClick={() =>
											handleToggleStatus(template.slug)
										}
										title={
											template.active ? "Disable" : "Enable"
										}
										className={`inline-flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
											template.active
												? "bg-yellow-600 hover:bg-yellow-700"
												: "bg-green-600 hover:bg-green-700"
										} text-white`}
									>
										{template.active ? (
											<>
												<EyeOff className="h-4 w-4 mr-1" />
												Disable
											</>
										) : (
											<>
												<Eye className="h-4 w-4 mr-1" />
												Enable
											</>
										)}
									</button>
									<button
										onClick={() =>
											handleDeleteTemplate(template)
										}
										title="Delete"
										className="inline-flex items-center px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
									>
										<Trash2 className="h-4 w-4 mr-1" />
										Delete
									</button>
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
								Create Task Template
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

						<TaskTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleCreateTemplate}
							submitText="Create Template"
							getNextSortOrder={getNextSortOrder}
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
								Edit Task Template
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

						<TaskTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleUpdateTemplate}
							submitText="Update Template"
							getNextSortOrder={getNextSortOrder}
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
								Import Task Templates from JSON
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
							{/* File Upload Section */}
							<div className="border border-gray-600 rounded-lg p-4 bg-gray-750">
								<div className="flex items-center justify-between mb-3">
									<label className="block text-sm font-medium text-gray-300">
										Upload JSON File
									</label>
									<a
										href="/examples/task-templates-example.json"
										download
										className="text-sm text-blue-400 hover:text-blue-300 underline"
									>
										Download Example
									</a>
								</div>
								<div className="flex items-center space-x-3">
									<input
										type="file"
										accept=".json"
										onChange={handleFileUpload}
										className="hidden"
										aria-label="Upload JSON file"
										ref={(el) => setFileInputRef(el)}
									/>
									<button
										onClick={() => fileInputRef?.click()}
										className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
									>
										<FolderOpen className="h-4 w-4 mr-2" />
										Choose File
									</button>
									<span className="text-sm text-gray-400">
										Select a JSON file to upload
									</span>
								</div>
							</div>

							{/* Manual JSON Input Section */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="block text-sm font-medium text-gray-300">
										Or paste JSON data manually
									</label>
								</div>
								<textarea
									value={jsonInput}
									onChange={(e) => setJsonInput(e.target.value)}
									className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
									placeholder={`[
  {
    "slug": "daily_login",
    "name": "Daily Login",
    "labelKey": "task.daily_login.title",
    "description": "Login to the game daily",
    "reward": {
      "type": "stardust",
      "amount": 100
    },
    "condition": {
      "type": "daily_login"
    },
    "icon": "🌟",
    "active": true,
    "isDaily": true,
    "sortOrder": ${getNextSortOrder()},
    "category": "daily"
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
								Are you sure you want to delete this task template?
							</p>
							<div className="bg-gray-700 p-3 rounded-md">
								<p className="text-white font-medium">
									{templateToDelete.name || templateToDelete.slug}
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

// Task Template Form Component
function TaskTemplateForm({
	formData,
	setFormData,
	onSubmit,
	submitText,
	getNextSortOrder,
}) {
	const updateField = (field, value) => {
		setFormData({ ...formData, [field]: value });
	};

	const updateNestedField = (parent, field, value) => {
		setFormData({
			...formData,
			[parent]: {
				...(formData[parent] || {}),
				[field]: value,
			},
		});
	};

	// Load example templates
	const loadExample = (type) => {
		let exampleData = { ...formData };

		switch (type) {
			case "daily_login":
				exampleData = {
					...formData,
					slug: "daily_login",
					title: { en: "Daily Explorer", ru: "Ежедневный исследователь" },
					description: {
						en: "Login daily to receive rewards",
						ru: "Входите ежедневно для получения наград",
					},
					reward: { type: "stardust", amount: 100 },
					condition: { type: "daily_login" },
					icon: "📆",
					category: "daily",
					isDaily: true,
					sortOrder: getNextSortOrder(),
				};
				break;
			case "stardust_collect":
				exampleData = {
					...formData,
					slug: "collect_stardust_5000",
					title: { en: "Dust Collector", ru: "Собиратель пыли" },
					description: {
						en: "Collect 5,000 stardust",
						ru: "Соберите 5,000 звездной пыли",
					},
					reward: { type: "stardust", amount: 1000 },
					condition: { type: "stardust_count", threshold: 5000 },
					icon: "✨",
					category: "stardust",
					isDaily: false,
					sortOrder: getNextSortOrder(),
				};
				break;
			case "galaxy_own":
				exampleData = {
					...formData,
					slug: "own_galaxies_2",
					title: { en: "Galactic Pioneer", ru: "Галактический пионер" },
					description: {
						en: "Own 2 galaxies",
						ru: "Владейте 2 галактиками",
					},
					reward: { type: "stardust", amount: 3000 },
					condition: { type: "owned_galaxies", threshold: 2 },
					icon: "🌌",
					category: "stardust",
					isDaily: false,
					sortOrder: getNextSortOrder(),
				};
				break;
			case "stars_create":
				exampleData = {
					...formData,
					slug: "create_stars_1000",
					title: { en: "Star Crafter", ru: "Создатель звезд" },
					description: {
						en: "Create 1,000 stars",
						ru: "Создайте 1,000 звезд",
					},
					reward: { type: "stardust", amount: 2000 },
					condition: { type: "total_stars", threshold: 1000 },
					icon: "⭐",
					category: "stardust",
					isDaily: false,
					sortOrder: getNextSortOrder(),
				};
				break;
			case "artifact_collect":
				exampleData = {
					...formData,
					slug: "scan_galaxy_10",
					name: "Cosmic Researcher",
					labelKey: "task.scan_galaxy_10.title",
					description: "Scan 10 galaxies",
					reward: { type: "stardust", amount: 2000 },
					condition: { type: "scan_count", threshold: 10 },
					icon: "🔭",
					category: "stardust",
					isDaily: false,
					sortOrder: getNextSortOrder(),
				};
				break;
			case "custom":
				exampleData = {
					...formData,
					slug: "custom_task",
					name: "Custom Task",
					labelKey: "task.custom.title",
					description: "Complete this custom task",
					reward: { type: "stardust", amount: 0 },
					condition: { type: "custom", threshold: 1 },
					icon: "🎯",
					category: "stardust",
					isDaily: false,
					sortOrder: getNextSortOrder(),
				};
				break;
		}
		setFormData(exampleData);
	};

	return (
		<div className="space-y-4">
			{/* Task Structure Guide */}
			<div className="mb-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-600 rounded-md">
				<h4 className="text-sm font-medium text-blue-300 mb-2">
					🎯 Task Structure Guide
				</h4>
				<div className="text-xs text-blue-200 space-y-1">
					<p>
						<strong>Daily Tasks:</strong> Reset every day, perfect for
						login rewards and daily activities
					</p>
					<p>
						<strong>Progress Tasks:</strong> Track player progress like
						collecting resources, owning galaxies
					</p>
					<p>
						<strong>Condition Types:</strong> daily_login,
						stardust_count, total_stars, owned_galaxies, scan_count,
						login_streak
					</p>
					<p>
						<strong>Reward Types:</strong> stardust, darkMatter - choose
						based on task difficulty
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Slug *
					</label>
					<input
						type="text"
						value={formData.slug || ""}
						onChange={(e) =>
							updateField("slug", e.target.value.replace(/\s+/g, "_"))
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="daily_login"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Icon *
					</label>
					<input
						type="text"
						value={formData.icon || ""}
						onChange={(e) => updateField("icon", e.target.value)}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="🌟"
					/>
					<p className="text-xs text-gray-400 mt-1">
						🎨 Enter an emoji or icon for this task (e.g., 🌟, ⭐, 🎯,
						💫)
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Title (English) *
					</label>
					<input
						type="text"
						value={formData.title?.en || ""}
						onChange={(e) =>
							updateNestedField("title", "en", e.target.value)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="Daily Explorer"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Title (Russian) *
					</label>
					<input
						type="text"
						value={formData.title?.ru || ""}
						onChange={(e) =>
							updateNestedField("title", "ru", e.target.value)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="Ежедневный исследователь"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Description (English) *
					</label>
					<textarea
						value={formData.description?.en || ""}
						onChange={(e) =>
							updateNestedField("description", "en", e.target.value)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						rows={3}
						placeholder="Login to the game daily to get rewards"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Description (Russian) *
					</label>
					<textarea
						value={formData.description?.ru || ""}
						onChange={(e) =>
							updateNestedField("description", "ru", e.target.value)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						rows={3}
						placeholder="Входите в игру ежедневно для получения наград"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Category *
					</label>
					<select
						value={formData.category || "stardust"}
						onChange={(e) => updateField("category", e.target.value)}
						aria-label="Select category"
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="daily">Daily</option>
						<option value="stardust">Stardust</option>
						<option value="darkMatter">Dark Matter</option>
					</select>
					<p className="text-xs text-gray-400 mt-1">
						{formData.category === "daily"
							? "🌟 Daily tasks that reset every day - perfect for login rewards"
							: formData.category === "stardust"
							? "💫 Tasks related to stardust collection and management"
							: "🌌 Tasks involving dark matter and advanced resources"}
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Sort Order
					</label>
					<input
						type="number"
						value={formData.sortOrder || getNextSortOrder()}
						onChange={(e) =>
							updateField(
								"sortOrder",
								parseInt(e.target.value) || getNextSortOrder()
							)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder={getNextSortOrder().toString()}
					/>
					<p className="text-xs text-gray-400 mt-1">
						📊 Order for displaying tasks (lower numbers appear first)
					</p>
				</div>
			</div>

			{/* Reward Configuration */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Reward Type *
					</label>
					<select
						value={formData.reward?.type || "stardust"}
						onChange={(e) =>
							updateNestedField("reward", "type", e.target.value)
						}
						aria-label="Select reward type"
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="stardust">Stardust</option>
						<option value="darkMatter">Dark Matter</option>
					</select>
					<p className="text-xs text-gray-400 mt-1">
						{formData.reward?.type === "stardust"
							? "💫 Basic currency - good for easy tasks"
							: "🌌 Premium currency - use for difficult tasks"}
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Reward Amount *
					</label>
					<input
						type="number"
						value={formData.reward?.amount || 0}
						onChange={(e) =>
							updateNestedField(
								"reward",
								"amount",
								parseInt(e.target.value) || 0
							)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						min="0"
						placeholder="100"
					/>
					<p className="text-xs text-gray-400 mt-1">
						💎 Amount of reward to give - balance difficulty with reward
						value
					</p>
				</div>
			</div>

			{/* Condition Configuration */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Condition (JSON) *
				</label>
				<textarea
					value={JSON.stringify(formData.condition || {}, null, 2)}
					onChange={(e) => {
						try {
							const parsed = JSON.parse(e.target.value);
							updateField("condition", parsed);
						} catch (error) {
							// Allow invalid JSON while typing
						}
					}}
					className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
					rows={4}
					placeholder='{"type": "daily_login"}'
				/>
				<p className="text-xs text-gray-400 mt-1">
					{formData.category === "daily"
						? '📆 Daily Task: {"type": "daily_login"} - resets every day'
						: formData.category === "stardust"
						? '✨ Stardust Task: {"type": "stardust_count", "threshold": 5000} - collect stardust'
						: '🌑 Dark Matter Task: {"type": "dark_matter_count", "threshold": 1} - collect dark matter'}
				</p>
			</div>

			{/* Check Type Configuration */}
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Check Type
				</label>
				<select
					value={formData.checkType || "stardust_count"}
					onChange={(e) => updateField("checkType", e.target.value)}
					className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="stardust_count">Stardust Count</option>
					<option value="dark_matter_count">Dark Matter Count</option>
					<option value="stars_count">Stars Count</option>
					<option value="galaxies_count">Galaxies Count</option>
					<option value="scans_count">Scans Count</option>
					<option value="streak_count">Streak Count</option>
					<option value="daily_reset">Daily Reset</option>
					<option value="galaxy_upgraded">Galaxy Upgraded</option>
					<option value="galaxy_shared">Galaxy Shared</option>
				</select>
				<p className="text-xs text-gray-400 mt-1">
					Select the type of condition check for this task
				</p>
			</div>

			{/* Quick Examples Section */}
			<div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-md">
				<h4 className="text-sm font-medium text-gray-300 mb-3">
					🚀 Quick Examples - Click to load template
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					<button
						type="button"
						onClick={() => loadExample("daily_login")}
						className="p-2 text-xs bg-blue-900 hover:bg-blue-800 border border-blue-600 rounded text-blue-200 hover:text-white transition-colors"
						title="Daily login task: 100 stardust for logging in daily"
					>
						📆 Daily Login
					</button>
					<button
						type="button"
						onClick={() => loadExample("stardust_collect")}
						className="p-2 text-xs bg-green-900 hover:bg-green-800 border border-green-600 rounded text-green-200 hover:text-white transition-colors"
						title="Collect stardust task: 1000 stardust for collecting 5,000 stardust"
					>
						✨ Collect Stardust
					</button>
					<button
						type="button"
						onClick={() => loadExample("galaxy_own")}
						className="p-2 text-xs bg-purple-900 hover:bg-purple-800 border border-purple-600 rounded text-purple-200 hover:text-white transition-colors"
						title="Own galaxies task: 3000 stardust for owning 2 galaxies"
					>
						🌌 Own Galaxies
					</button>
					<button
						type="button"
						onClick={() => loadExample("stars_create")}
						className="p-2 text-xs bg-yellow-900 hover:bg-yellow-800 border border-yellow-600 rounded text-yellow-200 hover:text-white transition-colors"
						title="Create stars task: 2000 stardust for creating 1,000 stars"
					>
						⭐ Create Stars
					</button>
					<button
						type="button"
						onClick={() => loadExample("artifact_collect")}
						className="p-2 text-xs bg-red-900 hover:bg-red-800 border border-red-600 rounded text-red-200 hover:text-white transition-colors"
						title="Scan galaxies task: 2000 stardust for scanning 10 galaxies"
					>
						🔭 Scan Galaxies
					</button>
					<button
						type="button"
						onClick={() => loadExample("custom")}
						className="p-2 text-xs bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded text-gray-300 hover:text-white transition-colors"
						title="Custom task: template for creating your own task type"
					>
						🎯 Custom Task
					</button>
				</div>
				<p className="text-xs text-gray-400 mt-3">
					💡 <strong>Tip:</strong> Use these examples as starting points,
					then customize the values, names, and descriptions to match your
					needs!
				</p>
			</div>

			<div className="flex items-center space-x-4">
				<label className="flex items-center">
					<input
						type="checkbox"
						checked={formData.active ?? true}
						onChange={(e) => updateField("active", e.target.checked)}
						aria-label="Set template as active"
						className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
					/>
					<span className="ml-2 text-gray-300">Active</span>
				</label>

				<label className="flex items-center">
					<input
						type="checkbox"
						checked={formData.isDaily ?? false}
						onChange={(e) => updateField("isDaily", e.target.checked)}
						aria-label="Set template as daily task"
						className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
					/>
					<span className="ml-2 text-gray-300">Daily Task</span>
				</label>
			</div>

			<div className="flex justify-end space-x-2">
				<button
					onClick={onSubmit}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
				>
					<Save className="h-4 w-4 mr-2 inline" />
					{submitText}
				</button>
			</div>
		</div>
	);
}
