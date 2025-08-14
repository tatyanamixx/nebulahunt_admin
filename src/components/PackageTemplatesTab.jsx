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
		amount: 0,
		resource: "stardust",
		price: 0,
		currency: "stardust",
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
			amount: 0,
			resource: "stardust",
			price: 0,
			currency: "stardust",
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
			if (!formData.slug || !formData.name) {
				showMessage("Please fill in all required fields", "error");
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
			amount: template.amount || 0,
			resource: template.resource || "stardust",
			price: template.price || 0,
			currency: template.currency || "stardust",
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
		const exportFileDefaultName = "package-templates.json";

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
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
								className="bg-gray-700 rounded-lg p-4 border border-gray-600"
							>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<h3 className="text-lg font-semibold text-white">
												{template.name}
											</h3>
											<span className="text-sm text-gray-400">
												({template.slug})
											</span>
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
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
											<div>
												<span className="text-gray-400">
													Amount:
												</span>
												<span className="text-white ml-2">
													{template.amount}{" "}
													{template.resource}
												</span>
											</div>
											<div>
												<span className="text-gray-400">
													Price:
												</span>
												<span className="text-white ml-2">
													{template.price}{" "}
													{template.currency}
												</span>
											</div>
											<div className="col-span-2">
												<span className="text-gray-400">
													Label Key:
												</span>
												<span className="text-white ml-2 break-all max-w-md">
													{template.labelKey || "N/A"}
												</span>
											</div>
											<div>
												<span className="text-gray-400">
													Sort Order:
												</span>
												<span className="text-white ml-2">
													{template.sortOrder || 0}
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
    "slug": "basic-stardust-pack",
    "name": "Basic Stardust Pack",
    "description": "1000 stardust for basic needs",
    "amount": 1000,
    "resource": "stardust",
    "price": 99,
    "currency": "tgStars",
    "status": true,
    "icon": "📦",
    "sortOrder": 1,
    "labelKey": "store.basicPack",
    "isPromoted": false,
    "validUntil": ""
  },
  {
    "slug": "premium-dark-matter",
    "name": "Premium Dark Matter",
    "description": "500 dark matter for advanced players",
    "amount": 500,
    "resource": "darkMatter",
    "price": 299,
    "currency": "tonToken",
    "status": true,
    "icon": "💎",
    "sortOrder": 2,
    "labelKey": "store.premium.darkMatter",
    "isPromoted": true,
    "validUntil": ""
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
		setFormData({ ...formData, [field]: value });
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

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Resource *
					</label>
					<select
						value={formData.resource || "stardust"}
						onChange={(e) => updateField("resource", e.target.value)}
						aria-label="Select resource type"
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="stardust">Stardust</option>
						<option value="darkMatter">Dark Matter</option>
						<option value="stars">Stars</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Amount *
					</label>
					<input
						type="number"
						value={formData.amount || 0}
						onChange={(e) =>
							updateField("amount", parseInt(e.target.value) || 0)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="0"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Price *
					</label>
					<input
						type="number"
						step="0.00000001"
						value={formData.price || 0}
						onChange={(e) =>
							updateField("price", parseFloat(e.target.value) || 0)
						}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="0"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Currency *
					</label>
					<select
						value={formData.currency || "stardust"}
						onChange={(e) => updateField("currency", e.target.value)}
						aria-label="Select currency type"
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="tgStars">TG Stars</option>
						<option value="tonToken">TON Token</option>
						<option value="stars">Stars</option>
						<option value="stardust">Stardust</option>
						<option value="darkMatter">Dark Matter</option>
					</select>
				</div>
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
