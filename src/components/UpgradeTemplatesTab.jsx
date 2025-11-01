import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import {
	Plus,
	Edit,
	Trash2,
	Download,
	Upload,
	X,
	Zap,
	AlertCircle,
	FileText,
	FolderOpen,
	Eye,
	EyeOff,
} from "lucide-react";

export default function UpgradeTemplatesTab({ className = "" }) {
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
		description: { en: "", ru: "" },
		maxLevel: 1,
		basePrice: 0,
		effectPerLevel: 0,
		priceMultiplier: 1.0,
		currency: "stardust",
		category: "production",
		icon: "",
		stability: 0,
		instability: 0,
		modifiers: {},
		active: true,
		conditions: {},
		delayedUntil: "",
		children: [],
		weight: 1,
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	// Debug: Log templates state changes

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await api.get("/upgrade-templates");

			// Ensure we have proper data structure
			let templatesData;
			if (Array.isArray(response.data)) {
				templatesData = response.data;
			} else if (response.data?.data && Array.isArray(response.data.data)) {
				templatesData = response.data.data;
			} else if (
				response.data?.templates &&
				Array.isArray(response.data.templates)
			) {
				templatesData = response.data.templates;
			} else {
				templatesData = [];
			}

			setTemplates(templatesData);
		} catch (error) {
			console.error("Error fetching upgrade templates:", error);
			showMessage("Failed to fetch upgrade templates", "error");
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
			description: { en: "", ru: "" },
			maxLevel: 1,
			basePrice: 0,
			effectPerLevel: 0,
			priceMultiplier: 1.0,
			currency: "stardust",
			category: "production",
			icon: "",
			stability: 0,
			instability: 0,
			modifiers: {},
			active: true,
			conditions: {},
			delayedUntil: "",
			children: [],
			weight: 1,
		});
	};

	const handleCreateFromJson = async () => {
		try {
			setJsonError("");
			const parsedData = JSON.parse(jsonInput);

			if (!Array.isArray(parsedData)) {
				setJsonError("JSON must be an array of upgrade templates");
				return;
			}

			// Remove id field from each template to avoid database constraint violation
			const cleanedData = parsedData.map((template) => {
				const { id, createdAt, updatedAt, ...cleanTemplate } = template;
				// Clean up delayedUntil - remove empty strings
				if (
					cleanTemplate.delayedUntil &&
					cleanTemplate.delayedUntil.trim() === ""
				) {
					delete cleanTemplate.delayedUntil;
				}
				return cleanTemplate;
			});

			const response = await api.post("/upgrade-templates", cleanedData);
			showMessage("Upgrade templates created successfully", "success");
			setShowJsonModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			if (error.name === "SyntaxError") {
				setJsonError("Invalid JSON format");
			} else {
				console.error("Error creating upgrade templates:", error);
				setJsonError(
					error.response?.data?.message ||
						"Failed to create upgrade templates"
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
						"JSON file must contain an array of upgrade templates"
					);
					return;
				}

				// Clean the data by removing id, createdAt, updatedAt fields
				const cleanedData = parsedData.map((template) => {
					const { id, createdAt, updatedAt, ...cleanTemplate } = template;
					// Clean up delayedUntil - remove empty strings
					if (
						cleanTemplate.delayedUntil &&
						cleanTemplate.delayedUntil.trim() === ""
					) {
						delete cleanTemplate.delayedUntil;
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

			// Convert name and description to JSON strings
			const nameString = JSON.stringify(formData.name || { en: "", ru: "" });
			const descriptionString = JSON.stringify(
				formData.description || { en: "", ru: "" }
			);

			// Clean up formData - remove empty delayedUntil
			const cleanedData = {
				...formData,
				name: nameString,
				description: descriptionString,
				delayedUntil:
					formData.delayedUntil && formData.delayedUntil.trim() !== ""
						? formData.delayedUntil
						: undefined,
			};

			const response = await api.post("/upgrade-templates", [cleanedData]);
			showMessage("Upgrade template created successfully", "success");
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error creating upgrade template:", error);
			showMessage(
				error.response?.data?.message || "Failed to create upgrade template",
				"error"
			);
		}
	};

	const handleUpdateTemplate = async () => {
		try {
			if (!editingTemplate?.slug) return;

			// Convert name and description to JSON strings
			const nameString = JSON.stringify(formData.name || { en: "", ru: "" });
			const descriptionString = JSON.stringify(
				formData.description || { en: "", ru: "" }
			);

			// Clean up formData - remove empty delayedUntil
			const cleanedData = {
				...formData,
				name: nameString,
				description: descriptionString,
				delayedUntil:
					formData.delayedUntil && formData.delayedUntil.trim() !== ""
						? formData.delayedUntil
						: undefined,
			};

			const response = await api.put(
				`/upgrade-templates/${encodeURIComponent(editingTemplate.slug)}`,
				cleanedData
			);
			showMessage("Upgrade template updated successfully", "success");
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error updating upgrade template:", error);
			showMessage(
				error.response?.data?.message || "Failed to update upgrade template",
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
			const response = await api.delete(
				`/upgrade-templates/${encodeURIComponent(templateToDelete.slug)}`
			);
			showMessage("Upgrade template deleted successfully", "success");
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error) {
			console.error("❌ Error deleting upgrade template:", error);
			console.error("❌ Error details:", {
				status: error.response?.status,
				data: error.response?.data,
				message: error.message,
			});
			showMessage(
				error.response?.data?.message || "Failed to delete upgrade template",
				"error"
			);
		}
	};

	const handleToggleStatus = async (slug) => {
		try {
			const response = await api.post(
				`/upgrade-templates/${encodeURIComponent(slug)}/activate`
			);
			showMessage("Upgrade template status toggled successfully", "success");
			fetchTemplates();
		} catch (error) {
			console.error("❌ Error toggling upgrade template status:", error);
			console.error("❌ Error details:", {
				status: error.response?.status,
				data: error.response?.data,
				message: error.message,
			});
			showMessage(
				error.response?.data?.message ||
					"Failed to toggle upgrade template status",
				"error"
			);
		}
	};

	const openEditModal = (template) => {
		setEditingTemplate(template);

		// Parse name and description from JSON strings
		let parsedName = { en: "", ru: "" };
		let parsedDescription = { en: "", ru: "" };

		try {
			if (typeof template.name === "string") {
				parsedName = JSON.parse(template.name);
			} else if (typeof template.name === "object") {
				parsedName = template.name;
			}
		} catch (e) {
			console.error("Failed to parse name:", e);
		}

		try {
			if (typeof template.description === "string") {
				parsedDescription = JSON.parse(template.description);
			} else if (typeof template.description === "object") {
				parsedDescription = template.description;
			}
		} catch (e) {
			console.error("Failed to parse description:", e);
		}

		const formData = {
			slug: template.slug || "",
			name: parsedName,
			description: parsedDescription,
			maxLevel: template.maxLevel || 1,
			basePrice: template.basePrice || 0,
			effectPerLevel: template.effectPerLevel || 0,
			priceMultiplier: template.priceMultiplier || 1.0,
			currency: template.currency || "stardust",
			category: template.category || "production",
			icon: template.icon || "",
			stability: template.stability || 0,
			instability: template.instability || 0,
			modifiers: template.modifiers || {},
			active: template.active ?? true,
			conditions: template.conditions || {},
			delayedUntil: template.delayedUntil || "",
			children: template.children || [],
			weight: template.weight || 1,
		};
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
		const exportFileDefaultName = "upgrade-templates.json";

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	// Helper functions for visual styling
	const getUpgradeCardColor = (template) => {
		// Определяем цвет на основе валюты
		if (template.currency) {
			switch (template.currency) {
				case "stardust":
					return "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600";
				case "darkmatter":
					return "bg-gradient-to-r from-purple-900 to-purple-800 border-purple-600";
				case "stars":
					return "bg-gradient-to-r from-yellow-900 to-yellow-800 border-yellow-600";
				default:
					return "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600";
			}
		}
		return "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600";
	};

	const getCategoryBadgeColor = (category) => {
		switch (category) {
			case "production":
				return "bg-blue-600 text-white";
			case "economy":
				return "bg-green-600 text-white";
			case "special":
				return "bg-purple-600 text-white";
			case "chance":
				return "bg-orange-600 text-white";
			case "storage":
				return "bg-yellow-600 text-white";
			case "multiplier":
				return "bg-pink-600 text-white";
			default:
				return "bg-gray-600 text-white";
		}
	};

	const getCurrencyIcon = (currency) => {
		switch (currency) {
			case "stardust":
				return "✨";
			case "darkmatter":
				return "🌑";
			case "stars":
				return "⭐";
			default:
				return "💎";
		}
	};

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
				{loading ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p className="text-gray-400">Loading upgrade templates...</p>
					</div>
				) : templates.length === 0 ? (
					<div className="text-center py-8">
						<Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-400">No upgrade templates found</p>
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
						{templates.map((template) => {
							// Parse name from JSON string
							let displayName = template.name;
							try {
								if (
									typeof template.name === "string" &&
									template.name.startsWith("{")
								) {
									const parsedName = JSON.parse(template.name);
									displayName = parsedName.en || template.name;
								} else if (typeof template.name === "object") {
									displayName = template.name.en || template.name;
								}
							} catch (e) {
								// Keep original name if parsing fails
							}

							return (
								<div
									key={template.slug}
									className={`${getUpgradeCardColor(
										template
									)} rounded-lg p-6 border-2 shadow-lg transition-all duration-200 hover:shadow-xl`}
								>
									{/* Header Section */}
									<div className="flex items-center space-x-3 mb-4">
										<div className="text-4xl">
											{template.icon || "⚡"}
										</div>
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-1">
												<h3 className="text-xl font-bold text-white">
													{displayName}
												</h3>
												<span
													className={`px-2 py-0.5 text-xs font-semibold rounded ${getCategoryBadgeColor(
														template.category
													)}`}
												>
													{template.category}
												</span>
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
												Max Level
											</div>
											<div className="text-lg font-bold text-white">
												{template.maxLevel}
											</div>
										</div>
										<div className="bg-black bg-opacity-30 rounded-lg p-3">
											<div className="text-xs text-gray-300 mb-1">
												Base Price
											</div>
											<div className="text-lg font-bold text-white flex items-center space-x-1">
												<span>
													{getCurrencyIcon(
														template.currency
													)}
												</span>
												<span>{template.basePrice}</span>
											</div>
										</div>
										<div className="bg-black bg-opacity-30 rounded-lg p-3">
											<div className="text-xs text-gray-300 mb-1">
												Effect/Level
											</div>
											<div className="text-lg font-bold text-white">
												{template.effectPerLevel}
											</div>
										</div>
										<div className="bg-black bg-opacity-30 rounded-lg p-3">
											<div className="text-xs text-gray-300 mb-1">
												Price Multiplier
											</div>
											<div className="text-lg font-bold text-white">
												×{template.priceMultiplier}
											</div>
										</div>
									</div>

									{/* Additional Info */}
									<div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
										<div className="flex items-center space-x-2">
											<span className="text-gray-300">
												Currency:
											</span>
											<span className="text-white font-semibold">
												{getCurrencyIcon(template.currency)}{" "}
												{template.currency}
											</span>
										</div>
										<div className="flex items-center space-x-2">
											<span className="text-gray-300">
												Weight:
											</span>
											<span className="text-white font-semibold">
												{template.weight || 1}
											</span>
										</div>
										<div className="flex items-center space-x-2">
											<span className="text-gray-300">
												Stability:
											</span>
											<span className="text-white font-semibold">
												{template.stability || 0}
											</span>
										</div>
									</div>

									{/* Modifiers & Conditions */}
									{(Object.keys(template.modifiers || {}).length >
										0 ||
										Object.keys(template.conditions || {})
											.length > 0) && (
										<div className="mt-4 pt-4 border-t border-white border-opacity-20">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{Object.keys(
													template.modifiers || {}
												).length > 0 && (
													<div>
														<div className="text-xs text-gray-300 mb-2 font-semibold">
															Modifiers:
														</div>
														<div className="bg-black bg-opacity-30 rounded p-2 text-xs font-mono text-gray-200">
															{JSON.stringify(
																template.modifiers,
																null,
																2
															)}
														</div>
													</div>
												)}
												{Object.keys(
													template.conditions || {}
												).length > 0 && (
													<div>
														<div className="text-xs text-gray-300 mb-2 font-semibold">
															Conditions:
														</div>
														<div className="bg-black bg-opacity-30 rounded p-2 text-xs font-mono text-gray-200">
															{JSON.stringify(
																template.conditions,
																null,
																2
															)}
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Action Buttons */}
									<div className="mt-4 pt-4 border-t border-white border-opacity-20 flex justify-end space-x-2">
										<button
											onClick={() =>
												downloadTemplate(template)
											}
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
												template.active
													? "Disable"
													: "Enable"
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
							);
						})}
					</div>
				)}
			</div>

			{/* Create Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Create Upgrade Template
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

						<UpgradeTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleCreateTemplate}
							submitText="Create Template"
						/>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Edit Upgrade Template
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

						<UpgradeTemplateForm
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
								Import Upgrade Templates from JSON
							</h3>
							<button
								onClick={() => {
									setShowJsonModal(false);
									setJsonInput("");
									setJsonError("");
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
										href="/examples/upgrade-templates-example.json"
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
    "slug": "production-boost",
    "name": "Production Boost",
    "description": {
      "en": "Increases production rate",
      "ru": "Увеличивает скорость производства"
    },
    "maxLevel": 5,
    "basePrice": 100,
    "effectPerLevel": 0.1,
    "priceMultiplier": 1.5,
    "currency": "stardust",
    "category": "production",
    "icon": "⚡",
    "stability": 0.8,
    "instability": 0.1,
    "modifiers": {
      "productionBonus": 0.1,
      "energyCost": 0.05
    },
    "conditions": {
      "level": 3,
      "resources": {
        "stardust": 500
      }
    },
    "children": ["advanced-production", "efficiency-boost"],
    "weight": 1,
    "active": true
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
										setJsonInput("");
										setJsonError("");
									}}
									className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleCreateFromJson}
									className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
								>
									Import Templates
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
						<div className="flex items-center space-x-3 mb-4">
							<AlertCircle className="h-6 w-6 text-red-400" />
							<h3 className="text-xl font-bold text-white">
								Delete Template
							</h3>
						</div>
						<p className="text-gray-300 mb-6">
							Are you sure you want to delete the template "
							{templateToDelete?.name}"? This action cannot be undone.
						</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowDeleteModal(false)}
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

function UpgradeTemplateForm({ formData, setFormData, onSubmit, submitText }) {
	const updateField = (field, value) => {
		setFormData({ ...formData, [field]: value });
	};

	const updateNestedField = (parent, field, value) => {
		setFormData({
			...formData,
			[parent]: {
				...formData[parent],
				[field]: value,
			},
		});
	};

	// Load example templates
	const loadExample = (type) => {
		let exampleData = { ...formData };

		switch (type) {
			case "stardust_production":
				exampleData = {
					slug: "stardust_production",
					name: { en: "Stardust Collector", ru: "Сборщик звездной пыли" },
					description: {
						en: "Increases stardust production rate",
						ru: "Увеличивает скорость производства звездной пыли",
					},
					maxLevel: 20,
					basePrice: 1000,
					priceMultiplier: 1.5,
					effectPerLevel: 0.1,
					icon: "⚡",
					currency: "stardust",
					category: "production",
					active: true,
					modifiers: { stardustRate: 0.1 },
					conditions: {},
					children: [],
					weight: 1,
				};
				break;
			case "star_discount":
				exampleData = {
					slug: "star_discount",
					name: { en: "Star Discount", ru: "Скидка на звезды" },
					description: {
						en: "Reduces the cost of creating stars",
						ru: "Снижает стоимость создания звезд",
					},
					maxLevel: 10,
					basePrice: 2500,
					priceMultiplier: 1.7,
					effectPerLevel: 0.05,
					icon: "💰",
					currency: "stardust",
					category: "economy",
					active: true,
					modifiers: { starCostMultiplier: -0.05 },
					conditions: {},
					children: [],
					weight: 1,
				};
				break;
			case "dark_matter_chance":
				exampleData = {
					slug: "dark_matter_chance",
					name: {
						en: "Dark Matter Extractor",
						ru: "Экстрактор темной материи",
					},
					description: {
						en: "Improve dark matter extraction rate",
						ru: "Улучшает скорость добычи темной материи",
					},
					maxLevel: 5,
					basePrice: 5,
					priceMultiplier: 1.8,
					effectPerLevel: 0.5,
					icon: "🌑",
					currency: "darkmatter",
					category: "chance",
					active: true,
					modifiers: { darkMatterRate: 0.5 },
					conditions: {},
					children: [],
					weight: 1,
				};
				break;
			case "stardust_multiplier":
				exampleData = {
					slug: "stardust_multiplier",
					name: { en: "Quantum Accelerator", ru: "Квантовый ускоритель" },
					description: {
						en: "Multiplier for all stardust gains",
						ru: "Множитель для всего получения звездной пыли",
					},
					maxLevel: 10,
					basePrice: 50,
					priceMultiplier: 1.8,
					effectPerLevel: 0.2,
					icon: "✨",
					currency: "darkmatter",
					category: "multiplier",
					active: true,
					modifiers: { stardustMultiplier: 0.2 },
					conditions: {},
					children: [],
					weight: 1,
				};
				break;
			case "stellar_forge":
				exampleData = {
					slug: "stellar_forge",
					name: { en: "Stellar Forge", ru: "Звездная кузница" },
					description: {
						en: "Automatically creates stars over time using accumulated stardust",
						ru: "Автоматически создает звезды со временем, используя накопленную звездную пыль",
					},
					maxLevel: 5,
					basePrice: 200,
					priceMultiplier: 2.0,
					effectPerLevel: 0.05,
					icon: "🔨",
					currency: "darkmatter",
					category: "special",
					active: true,
					modifiers: { autoCreateStars: 0.05 },
					conditions: {},
					children: [],
					weight: 1,
				};
				break;
			case "custom":
				exampleData = {
					slug: "custom_upgrade",
					name: { en: "Custom Upgrade", ru: "Пользовательское улучшение" },
					description: {
						en: "Create your own upgrade",
						ru: "Создайте свое улучшение",
					},
					maxLevel: 10,
					basePrice: 1000,
					priceMultiplier: 1.5,
					effectPerLevel: 0.1,
					icon: "⚙️",
					currency: "stardust",
					category: "production",
					active: true,
					modifiers: {},
					conditions: {},
					children: [],
					weight: 1,
				};
				break;
		}
		setFormData(exampleData);
	};

	return (
		<div className="space-y-4">
			{/* Upgrade Structure Guide */}
			<div className="mb-4 p-3 bg-purple-900 bg-opacity-30 border border-purple-600 rounded-md">
				<h4 className="text-sm font-medium text-purple-300 mb-2">
					⚡ Upgrade Structure Guide
				</h4>
				<div className="text-xs text-purple-200 space-y-1">
					<p>
						<strong>Categories:</strong> production (resource
						generation), economy (costs/discounts), special (unique
						effects), multiplier (boosts), chance (probability), storage
						(capacity)
					</p>
					<p>
						<strong>Currency:</strong> stardust (basic upgrades),
						darkmatter (premium upgrades), stars (special purchases)
					</p>
					<p>
						<strong>Modifiers:</strong> Define gameplay effects in JSON
						format (e.g., stardustRate, darkMatterChance)
					</p>
					<p>
						<strong>Children:</strong> Upgrades unlocked after completing
						this one
					</p>
				</div>
			</div>

			{/* Basic Information Section */}
			<div className="border-t border-gray-600 pt-4">
				<h4 className="text-md font-semibold text-gray-200 mb-3">
					📋 Basic Information
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Slug *
						</label>
						<input
							type="text"
							value={formData.slug || ""}
							onChange={(e) =>
								updateField(
									"slug",
									e.target.value.replace(/\s+/g, "_")
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="stardust_production"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Use snake_case (e.g., stardust_production)
						</p>
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
							placeholder="⚡"
						/>
						<p className="text-xs text-gray-400 mt-1">
							🎨 Enter an emoji (e.g., ⚡, 💎, 🔥, ⭐)
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Weight
						</label>
						<input
							type="number"
							value={formData.weight || 1}
							onChange={(e) =>
								updateField("weight", parseInt(e.target.value) || 1)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="1"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Priority/importance for sorting
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Name (English) *
						</label>
						<input
							type="text"
							value={formData.name?.en || ""}
							onChange={(e) =>
								updateNestedField("name", "en", e.target.value)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="e.g., Stardust Collector"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Name (Russian) *
						</label>
						<input
							type="text"
							value={formData.name?.ru || ""}
							onChange={(e) =>
								updateNestedField("name", "ru", e.target.value)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="например, Сборщик звездной пыли"
						/>
					</div>
				</div>
			</div>

			{/* Descriptions Section */}
			<div className="border-t border-gray-600 pt-4">
				<h4 className="text-md font-semibold text-gray-200 mb-3">
					📝 Descriptions
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Description (English)
						</label>
						<textarea
							value={formData.description?.en || ""}
							onChange={(e) =>
								updateNestedField(
									"description",
									"en",
									e.target.value
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							rows={3}
							placeholder="e.g., Increases stardust production rate"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Description (Russian)
						</label>
						<textarea
							value={formData.description?.ru || ""}
							onChange={(e) =>
								updateNestedField(
									"description",
									"ru",
									e.target.value
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							rows={3}
							placeholder="например, Увеличивает скорость производства звездной пыли"
						/>
					</div>
				</div>
			</div>

			{/* Category & Currency Section */}
			<div className="border-t border-gray-600 pt-4">
				<h4 className="text-md font-semibold text-gray-200 mb-3">
					🏷️ Category & Currency
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Category *
						</label>
						<select
							value={formData.category || "production"}
							onChange={(e) => updateField("category", e.target.value)}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							title="Select upgrade category"
						>
							<option value="production">Production</option>
							<option value="economy">Economy</option>
							<option value="special">Special</option>
							<option value="chance">Chance</option>
							<option value="storage">Storage</option>
							<option value="multiplier">Multiplier</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Currency *
						</label>
						<select
							value={formData.currency || "stardust"}
							onChange={(e) => updateField("currency", e.target.value)}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							title="Select currency type"
						>
							<option value="stardust">✨ Stardust</option>
							<option value="darkmatter">🌑 Dark Matter</option>
							<option value="stars">⭐ Stars</option>
						</select>
					</div>
				</div>
			</div>

			{/* Levels & Pricing Section */}
			<div className="border-t border-gray-600 pt-4">
				<h4 className="text-md font-semibold text-gray-200 mb-3">
					💰 Levels & Pricing
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Max Level *
						</label>
						<input
							type="number"
							value={formData.maxLevel || 1}
							onChange={(e) =>
								updateField(
									"maxLevel",
									parseInt(e.target.value) || 1
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="20"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Maximum level players can reach
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Base Price *
						</label>
						<input
							type="number"
							value={formData.basePrice || 0}
							onChange={(e) =>
								updateField(
									"basePrice",
									parseInt(e.target.value) || 0
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="1000"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Starting price for level 1
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Effect Per Level
						</label>
						<input
							type="number"
							step="0.01"
							value={formData.effectPerLevel || 0}
							onChange={(e) =>
								updateField(
									"effectPerLevel",
									parseFloat(e.target.value) || 0
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="0.1"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Effect increase per level (e.g., 0.1 = 10%)
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Price Multiplier
						</label>
						<input
							type="number"
							step="0.01"
							value={formData.priceMultiplier || 1.0}
							onChange={(e) =>
								updateField(
									"priceMultiplier",
									parseFloat(e.target.value) || 1.0
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="1.5"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Price increase per level (e.g., 1.5 = +50%)
						</p>
					</div>
				</div>
			</div>

			{/* Advanced Settings Section */}
			<div className="border-t border-gray-600 pt-4">
				<h4 className="text-md font-semibold text-gray-200 mb-3">
					⚙️ Advanced Settings
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Stability
						</label>
						<input
							type="number"
							step="0.01"
							value={formData.stability || 0}
							onChange={(e) =>
								updateField(
									"stability",
									parseFloat(e.target.value) || 0
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="0.8"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Reliability factor (0-1, higher is more stable)
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Instability
						</label>
						<input
							type="number"
							step="0.01"
							value={formData.instability || 0}
							onChange={(e) =>
								updateField(
									"instability",
									parseFloat(e.target.value) || 0
								)
							}
							className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
							placeholder="0.1"
						/>
						<p className="text-xs text-gray-400 mt-1">
							Chaos/randomness factor (0-1, higher is more chaotic)
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<div>
					<div className="flex items-center justify-between mb-1">
						<label className="block text-sm font-medium text-gray-300">
							Modifiers (JSON)
						</label>
						<div className="flex space-x-2">
							<button
								type="button"
								onClick={() => updateField("modifiers", {})}
								className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
								title="Clear modifiers"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() =>
									updateField("modifiers", {
										productionBonus: 0.1,
										energyCost: 0.05,
									})
								}
								className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
								title="Set example modifiers"
							>
								Example
							</button>
						</div>
					</div>
					<textarea
						value={JSON.stringify(formData.modifiers || {}, null, 2)}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								updateField("modifiers", parsed);
							} catch (error) {
								// Keep the raw value if JSON is invalid
								updateField("modifiers", e.target.value);
							}
						}}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
						rows={4}
						placeholder='{"bonus": 0.1, "multiplier": 1.2}'
					/>
					<p className="text-xs text-gray-400 mt-1">
						Enter valid JSON for additional modifiers and effects
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<div>
					<div className="flex items-center justify-between mb-1">
						<label className="block text-sm font-medium text-gray-300">
							Conditions (JSON)
						</label>
						<div className="flex space-x-2">
							<button
								type="button"
								onClick={() => updateField("conditions", {})}
								className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
								title="Clear conditions"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() =>
									updateField("conditions", {
										level: 3,
										resources: { stardust: 500 },
									})
								}
								className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
								title="Set example conditions"
							>
								Example
							</button>
						</div>
					</div>
					<textarea
						value={JSON.stringify(formData.conditions || {}, null, 2)}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								updateField("conditions", parsed);
							} catch (error) {
								// Keep the raw value if JSON is invalid
								updateField("conditions", e.target.value);
							}
						}}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
						rows={4}
						placeholder='{"level": 5, "resources": {"stardust": 1000}}'
					/>
					<p className="text-xs text-gray-400 mt-1">
						Enter valid JSON for conditions required to unlock this
						upgrade
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Children (Array of slugs)
					</label>
					<div className="space-y-2">
						{Array.isArray(formData.children) &&
							formData.children.map((child, index) => (
								<div
									key={index}
									className="flex items-center space-x-2"
								>
									<input
										type="text"
										value={child}
										onChange={(e) => {
											const newChildren = [
												...(formData.children || []),
											];
											newChildren[index] = e.target.value;
											updateField("children", newChildren);
										}}
										className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
										placeholder="upgrade-slug"
									/>
									<button
										type="button"
										onClick={() => {
											const newChildren = [
												...(formData.children || []),
											];
											newChildren.splice(index, 1);
											updateField("children", newChildren);
										}}
										className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
										title="Remove child"
									>
										×
									</button>
								</div>
							))}
						<button
							type="button"
							onClick={() => {
								const newChildren = [
									...(formData.children || []),
									"",
								];
								updateField("children", newChildren);
							}}
							className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors border border-dashed border-gray-500"
						>
							+ Add Child Upgrade
						</button>
					</div>
					<p className="text-xs text-gray-400 mt-1">
						Add child upgrade slugs that will be unlocked by this upgrade
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-1">
						Delayed Until
					</label>
					<input
						type="datetime-local"
						value={formData.delayedUntil || ""}
						onChange={(e) => updateField("delayedUntil", e.target.value)}
						className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="Select date and time"
					/>
				</div>
			</div>

			<div className="flex items-center space-x-4">
				<label className="flex items-center">
					<input
						type="checkbox"
						checked={formData.active ?? true}
						onChange={(e) => updateField("active", e.target.checked)}
						className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
					/>
					<span className="ml-2 text-gray-300">Active</span>
				</label>
			</div>

			{/* Quick Examples Section */}
			<div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-md">
				<h4 className="text-sm font-medium text-gray-300 mb-3">
					🚀 Quick Examples - Click to load template
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					<button
						type="button"
						onClick={() => loadExample("stardust_production")}
						className="p-2 text-xs bg-blue-900 hover:bg-blue-800 border border-blue-600 rounded text-blue-200 hover:text-white transition-colors"
						title="Production upgrade: Increases stardust production rate"
					>
						⚡ Stardust Production
					</button>
					<button
						type="button"
						onClick={() => loadExample("star_discount")}
						className="p-2 text-xs bg-green-900 hover:bg-green-800 border border-green-600 rounded text-green-200 hover:text-white transition-colors"
						title="Economy upgrade: Reduces star creation costs"
					>
						💰 Star Discount
					</button>
					<button
						type="button"
						onClick={() => loadExample("dark_matter_chance")}
						className="p-2 text-xs bg-purple-900 hover:bg-purple-800 border border-purple-600 rounded text-purple-200 hover:text-white transition-colors"
						title="Chance upgrade: Improve dark matter extraction"
					>
						🌑 Dark Matter
					</button>
					<button
						type="button"
						onClick={() => loadExample("stardust_multiplier")}
						className="p-2 text-xs bg-yellow-900 hover:bg-yellow-800 border border-yellow-600 rounded text-yellow-200 hover:text-white transition-colors"
						title="Multiplier upgrade: Boosts all stardust gains"
					>
						✨ Multiplier
					</button>
					<button
						type="button"
						onClick={() => loadExample("stellar_forge")}
						className="p-2 text-xs bg-red-900 hover:bg-red-800 border border-red-600 rounded text-red-200 hover:text-white transition-colors"
						title="Special upgrade: Auto creates stars over time"
					>
						🔨 Special Effect
					</button>
					<button
						type="button"
						onClick={() => loadExample("custom")}
						className="p-2 text-xs bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded text-gray-300 hover:text-white transition-colors"
						title="Custom upgrade: template for creating your own upgrade"
					>
						⚙️ Custom Upgrade
					</button>
				</div>
				<p className="text-xs text-gray-400 mt-3">
					💡 <strong>Tip:</strong> Use these examples as starting points,
					then customize the values, names, and descriptions to match your
					needs!
				</p>
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
