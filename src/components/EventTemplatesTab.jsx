import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import {
	Plus,
	Edit,
	Trash2,
	Download,
	Upload,
	X,
	Calendar,
	AlertCircle,
	FolderOpen,
	Zap,
	Clock,
	Target,
} from "lucide-react";

export default function EventTemplatesTab({ className = "" }) {
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
		type: "RANDOM",
		triggerConfig: {},
		effect: {},
		frequency: {},
		conditions: {},
		active: true,
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await api.get("/event-templates");
			console.log("Event templates response:", response.data);
			// Ensure we have proper data structure
			const templatesData = response.data?.data || response.data || [];
			console.log("Processed event templates data:", templatesData);
			setTemplates(templatesData);
		} catch (error) {
			console.error("Error fetching event templates:", error);
			showMessage("Failed to fetch event templates", "error");
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
			type: "RANDOM",
			triggerConfig: {},
			effect: {},
			frequency: {},
			conditions: {},
			active: true,
		});
	};

	const handleCreateFromJson = async () => {
		try {
			setJsonError("");

			const trimmedInput = jsonInput.trim();
			if (!trimmedInput) {
				setJsonError("Please enter JSON data");
				return;
			}

			let parsedData;
			try {
				parsedData = JSON.parse(trimmedInput);
			} catch (parseError) {
				setJsonError(
					`Invalid JSON format: ${parseError.message || "Unknown error"}`
				);
				return;
			}

			// Ensure we have an array
			const eventsArray = Array.isArray(parsedData)
				? parsedData
				: [parsedData];

			// Validate each event template
			for (const event of eventsArray) {
				if (!event.slug || !event.name || !event.type || !event.effect) {
					setJsonError(
						"Each event template must have slug, name, type, and effect fields"
					);
					return;
				}
			}

			// Send each event template individually since the API expects a single object
			for (const event of eventsArray) {
				await api.post("/event-templates", event);
			}
			console.log("Created event templates:", eventsArray.length);

			showMessage(
				`Successfully created ${eventsArray.length} event template(s)`,
				"success"
			);
			setShowJsonModal(false);
			setJsonInput("");
			fetchTemplates();
		} catch (error) {
			console.error("Error creating event templates from JSON:", error);
			setJsonError(
				error.response?.data?.message ||
					"Failed to create event templates from JSON"
			);
		}
	};

	const handleFileUpload = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result;
				const parsed = JSON.parse(content);
				setJsonInput(JSON.stringify(parsed, null, 2));
				setJsonError("");
			} catch (error) {
				setJsonError("Invalid JSON file");
			}
		};
		reader.readAsText(file);
	};

	const handleCreateTemplate = async () => {
		try {
			if (
				!formData.slug ||
				!formData.name ||
				!formData.type ||
				!formData.effect
			) {
				showMessage(
					"Please fill in all required fields (slug, name, type, effect)",
					"error"
				);
				return;
			}

			const response = await api.post("/event-templates", [formData]);
			console.log("Created event template:", response.data);

			showMessage("Event template created successfully", "success");
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error creating event template:", error);
			showMessage(
				error.response?.data?.message || "Failed to create event template",
				"error"
			);
		}
	};

	const handleUpdateTemplate = async () => {
		try {
			if (!editingTemplate?.slug) {
				showMessage("No template selected for editing", "error");
				return;
			}

			const response = await api.put(
				`/event-templates/${editingTemplate.slug}`,
				formData
			);
			console.log("Updated event template:", response.data);

			showMessage("Event template updated successfully", "success");
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error updating event template:", error);
			showMessage(
				error.response?.data?.message || "Failed to update event template",
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
			await api.delete(`/event-templates/${templateToDelete.slug}`);
			showMessage("Event template deleted successfully", "success");
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error) {
			console.error("Error deleting event template:", error);
			showMessage(
				error.response?.data?.message || "Failed to delete event template",
				"error"
			);
		}
	};

	const handleToggleStatus = async (slug) => {
		try {
			await api.put(`/event-templates/${slug}/toggle`);
			showMessage("Event template status toggled successfully", "success");
			fetchTemplates();
		} catch (error) {
			console.error("Error toggling event template status:", error);
			showMessage(
				error.response?.data?.message ||
					"Failed to toggle event template status",
				"error"
			);
		}
	};

	const openEditModal = (template) => {
		setEditingTemplate(template);
		setFormData({
			slug: template.slug,
			name: template.name,
			description: template.description || { en: "", ru: "" },
			type: template.type,
			triggerConfig: template.triggerConfig || {},
			effect: template.effect || {},
			frequency: template.frequency || {},
			conditions: template.conditions || {},
			active: template.active,
		});
		setShowEditModal(true);
	};

	const downloadTemplate = (template) => {
		const dataStr = JSON.stringify(template, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${template.slug}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const downloadAllTemplates = () => {
		const dataStr = JSON.stringify(templates, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "event-templates.json";
		link.click();
		URL.revokeObjectURL(url);
	};

	const getTypeIcon = (type) => {
		switch (type) {
			case "RANDOM":
				return <Zap className="h-4 w-4" />;
			case "PERIODIC":
				return <Clock className="h-4 w-4" />;
			case "ONE_TIME":
				return <Calendar className="h-4 w-4" />;
			case "CONDITIONAL":
				return <Target className="h-4 w-4" />;
			default:
				return <AlertCircle className="h-4 w-4" />;
		}
	};

	const getTypeColor = (type) => {
		switch (type) {
			case "RANDOM":
				return "bg-yellow-600 text-black";
			case "PERIODIC":
				return "bg-blue-600 text-white";
			case "ONE_TIME":
				return "bg-purple-600 text-white";
			case "CONDITIONAL":
				return "bg-green-600 text-white";
			case "CHAINED":
				return "bg-indigo-600 text-white";
			case "TRIGGERED_BY_ACTION":
				return "bg-red-600 text-white";
			case "GLOBAL_TIMED":
				return "bg-pink-600 text-white";
			case "LIMITED_REPEATABLE":
				return "bg-orange-600 text-white";
			case "SEASONAL":
				return "bg-teal-600 text-white";
			case "PASSIVE":
				return "bg-gray-600 text-white";
			case "RESOURCE_BASED":
				return "bg-amber-600 text-black";
			case "UPGRADE_DEPENDENT":
				return "bg-cyan-600 text-white";
			case "TASK_DEPENDENT":
				return "bg-lime-600 text-black";
			case "MARKET_DEPENDENT":
				return "bg-emerald-600 text-white";
			case "MULTIPLAYER":
				return "bg-violet-600 text-white";
			case "PROGRESSIVE":
				return "bg-rose-600 text-white";
			case "TIERED":
				return "bg-slate-600 text-white";
			default:
				return "bg-gray-600 text-white";
		}
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Calendar className="h-8 w-8 text-blue-500" />
					<div>
						<h2 className="text-2xl font-bold text-white">
							Event Templates
						</h2>
						<p className="text-gray-400">
							Manage game events and their triggers
						</p>
					</div>
				</div>
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
					<div className="text-gray-400">Loading event templates...</div>
				) : templates.length === 0 ? (
					<div className="text-gray-400">No event templates found.</div>
				) : (
					<div className="space-y-4">
						{templates.map((template) => (
							<div
								key={template.slug}
								className="bg-gray-750 rounded-lg p-4 border border-gray-700"
							>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-3">
											<h4 className="text-white font-medium">
												{template.name}
											</h4>
											<span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
												{template.slug}
											</span>
											<span
												className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${getTypeColor(
													template.type
												)}`}
											>
												{getTypeIcon(template.type)}
												<span>{template.type}</span>
											</span>
											<span
												className={`text-xs px-2 py-1 rounded ${
													template.active
														? "bg-green-600 text-white"
														: "bg-red-600 text-white"
												}`}
											>
												{template.active
													? "Active"
													: "Inactive"}
											</span>
										</div>
										<div className="mt-2 text-sm text-gray-400">
											{template.description && (
												<>
													<div>
														<span className="text-gray-500">
															EN:
														</span>{" "}
														{template.description.en ||
															"No English description"}
													</div>
													<div>
														<span className="text-gray-500">
															RU:
														</span>{" "}
														{template.description.ru ||
															"Нет описания на русском"}
													</div>
												</>
											)}
											{template.triggerConfig &&
												Object.keys(template.triggerConfig)
													.length > 0 && (
													<div>
														<span className="text-gray-500">
															Trigger Config:
														</span>{" "}
														<code className="text-xs bg-gray-700 px-1 rounded">
															{JSON.stringify(
																template.triggerConfig
															)}
														</code>
													</div>
												)}
											{template.effect &&
												Object.keys(template.effect).length >
													0 && (
													<div>
														<span className="text-gray-500">
															Effect:
														</span>{" "}
														<code className="text-xs bg-gray-700 px-1 rounded">
															{JSON.stringify(
																template.effect
															)}
														</code>
													</div>
												)}
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() =>
												handleToggleStatus(template.slug)
											}
											title={`Toggle ${
												template.active
													? "deactivate"
													: "activate"
											}`}
											className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
												template.active
													? "bg-red-600 hover:bg-red-700 text-white"
													: "bg-green-600 hover:bg-green-700 text-white"
											}`}
										>
											{template.active
												? "Deactivate"
												: "Activate"}
										</button>
										<button
											onClick={() =>
												downloadTemplate(template)
											}
											title="Download template"
											className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
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
								Create Event Template
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
						<EventTemplateForm
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
								Edit Event Template
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
						<EventTemplateForm
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
								Import Event Templates from JSON
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
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Upload JSON File
								</label>
								<input
									type="file"
									accept=".json"
									onChange={handleFileUpload}
									className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Or paste JSON directly
								</label>
								<textarea
									value={jsonInput}
									onChange={(e) => setJsonInput(e.target.value)}
									placeholder="Paste your JSON here..."
									className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
								/>
							</div>

							{jsonError && (
								<div className="text-red-400 text-sm">
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
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Delete Event Template
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
						<p className="text-gray-300 mb-6">
							Are you sure you want to delete the event template "
							{templateToDelete?.name}"? This action cannot be undone.
						</p>
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
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function EventTemplateForm({ formData, setFormData, onSubmit, submitText }) {
	const updateField = (field, value) => {
		setFormData({ ...formData, [field]: value });
	};

	const updateDescription = (lang, value) => {
		setFormData({
			...formData,
			description: {
				...formData.description,
				[lang]: value,
			},
		});
	};

	const updateJsonField = (field, value) => {
		try {
			const parsed = value ? JSON.parse(value) : {};
			updateField(field, parsed);
		} catch (error) {
			// Keep the string value if it's not valid JSON
			updateField(field, value);
		}
	};

	const eventTypes = [
		"RANDOM",
		"PERIODIC",
		"ONE_TIME",
		"CONDITIONAL",
		"CHAINED",
		"TRIGGERED_BY_ACTION",
		"GLOBAL_TIMED",
		"LIMITED_REPEATABLE",
		"SEASONAL",
		"PASSIVE",
		"RESOURCE_BASED",
		"UPGRADE_DEPENDENT",
		"TASK_DEPENDENT",
		"MARKET_DEPENDENT",
		"MULTIPLAYER",
		"PROGRESSIVE",
		"TIERED",
	];

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="space-y-4"
		>
			{/* Basic Information */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Slug *
					</label>
					<input
						type="text"
						value={formData.slug || ""}
						onChange={(e) => updateField("slug", e.target.value)}
						className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="event-slug"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Name *
					</label>
					<input
						type="text"
						value={formData.name || ""}
						onChange={(e) => updateField("name", e.target.value)}
						className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="Event Name"
						required
					/>
				</div>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Description
				</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-xs text-gray-400 mb-1">
							English
						</label>
						<textarea
							value={formData.description?.en || ""}
							onChange={(e) => updateDescription("en", e.target.value)}
							className="w-full h-20 p-3 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
							placeholder="English description"
						/>
					</div>
					<div>
						<label className="block text-xs text-gray-400 mb-1">
							Russian
						</label>
						<textarea
							value={formData.description?.ru || ""}
							onChange={(e) => updateDescription("ru", e.target.value)}
							className="w-full h-20 p-3 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
							placeholder="Описание на русском"
						/>
					</div>
				</div>
			</div>

			{/* Type and Status */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Type *
					</label>
					<select
						value={formData.type || "RANDOM"}
						onChange={(e) => updateField("type", e.target.value)}
						className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
						required
					>
						{eventTypes.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Status
					</label>
					<select
						value={formData.active ? "true" : "false"}
						onChange={(e) =>
							updateField("active", e.target.value === "true")
						}
						className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="true">Active</option>
						<option value="false">Inactive</option>
					</select>
				</div>
			</div>

			{/* JSON Configuration Fields */}
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Trigger Config (JSON)
					</label>
					<textarea
						value={JSON.stringify(formData.triggerConfig || {}, null, 2)}
						onChange={(e) =>
							updateJsonField("triggerConfig", e.target.value)
						}
						className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
						placeholder='{"interval": "24h"}'
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Effect (JSON)
					</label>
					<textarea
						value={JSON.stringify(formData.effect || {}, null, 2)}
						onChange={(e) => updateJsonField("effect", e.target.value)}
						className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
						placeholder='{"multipliers": {"cps": 2.0}, "duration": 600}'
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Frequency (JSON)
					</label>
					<textarea
						value={JSON.stringify(formData.frequency || {}, null, 2)}
						onChange={(e) =>
							updateJsonField("frequency", e.target.value)
						}
						className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
						placeholder='{"maxPerDay": 1}'
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Conditions (JSON)
					</label>
					<textarea
						value={JSON.stringify(formData.conditions || {}, null, 2)}
						onChange={(e) =>
							updateJsonField("conditions", e.target.value)
						}
						className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
						placeholder='{"minLevel": 10}'
					/>
				</div>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end">
				<button
					type="submit"
					className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
				>
					{submitText}
				</button>
			</div>
		</form>
	);
}
