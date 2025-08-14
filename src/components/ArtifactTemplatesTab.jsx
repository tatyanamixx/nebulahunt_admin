import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Download, Upload, X, AlertCircle } from "lucide-react";
import { artifactTemplateApi } from "../lib/api.js";

export default function ArtifactTemplatesTab({ className = "" }) {
	const [templates, setTemplates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState("success");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showJsonModal, setShowJsonModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState(null);
	const [editingTemplate, setEditingTemplate] = useState(null);
	const [jsonInput, setJsonInput] = useState("");
	const [jsonError, setJsonError] = useState("");
	const [sortBy, setSortBy] = useState("baseChance");
	const [sortOrder, setSortOrder] = useState("asc");

	const [formData, setFormData] = useState({
		slug: "",
		name: "",
		description: { en: "", ru: "" },
		rarity: "COMMON",
		image: "",
		effects: {},
		limited: false,
		limitedCount: 0,
		limitedDuration: 0,
		limitedDurationType: "HOUR",
		limitedDurationValue: 0,
		baseChance: 0.01,
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await artifactTemplateApi.getAll();
			const templatesData = response.data || [];
			setTemplates(templatesData);
		} catch (error) {
			console.error("Error fetching artifact templates:", error);
			showMessage(
				error.response?.data?.message ||
					"Failed to fetch artifact templates",
				"error"
			);
		} finally {
			setLoading(false);
		}
	};

	const showMessage = (text, type) => {
		setMessage(text);
		setMessageType(type);
		setTimeout(() => setMessage(""), 5000);
	};

	const sortTemplates = (templates) => {
		return [...templates].sort((a, b) => {
			let aValue, bValue;

			switch (sortBy) {
				case "baseChance":
					aValue = a.baseChance || 0;
					bValue = b.baseChance || 0;
					break;
				case "name":
					aValue = a.name || "";
					bValue = b.name || "";
					break;
				case "rarity":
					const rarityOrder = {
						COMMON: 1,
						UNCOMMON: 2,
						RARE: 3,
						EPIC: 4,
						LEGENDARY: 5,
					};
					aValue = rarityOrder[a.rarity] || 0;
					bValue = rarityOrder[b.rarity] || 0;
					break;
				default:
					return 0;
			}

			if (sortOrder === "asc") {
				return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
			} else {
				return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
			}
		});
	};

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	const resetForm = () => {
		setFormData({
			slug: "",
			name: "",
			description: { en: "", ru: "" },
			rarity: "COMMON",
			image: "",
			effects: {},
			limited: false,
			limitedCount: 0,
			limitedDuration: 0,
			baseChance: 0.01,
			limitedDurationType: "HOUR",
			limitedDurationValue: 0,
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

			if (!Array.isArray(parsedData)) {
				setJsonError("JSON must be an array of artifact templates");
				return;
			}

			if (parsedData.length === 0) {
				setJsonError("JSON array cannot be empty");
				return;
			}

			// Validate each template
			for (let i = 0; i < parsedData.length; i++) {
				const template = parsedData[i];
				if (!template.slug || !template.name || !template.description) {
					setJsonError(
						`Template ${
							i + 1
						}: Missing required fields (slug, name, description)`
					);
					return;
				}
				if (typeof template.description === "object") {
					if (!template.description.en || !template.description.ru) {
						setJsonError(
							`Template ${
								i + 1
							}: Description must contain both "en" and "ru" translations`
						);
						return;
					}
				}
				if (
					!["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"].includes(
						template.rarity
					)
				) {
					setJsonError(
						`Template ${
							i + 1
						}: Invalid rarity. Must be COMMON, UNCOMMON, RARE, EPIC, or LEGENDARY`
					);
					return;
				}
			}

			// Remove id field from each template to avoid database constraint violation
			const cleanedData = parsedData.map((template) => {
				const { id, createdAt, updatedAt, ...cleanTemplate } = template;
				return cleanTemplate;
			});

			const response = await artifactTemplateApi.create(cleanedData);
			showMessage("Artifact templates created successfully", "success");
			setShowJsonModal(false);
			setJsonInput("");
			setJsonError("");
			fetchTemplates();
		} catch (error) {
			console.error("Error creating artifact templates:", error);
			setJsonError(
				error.response?.data?.message ||
					"Failed to create artifact templates"
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
				const parsedData = JSON.parse(content);

				if (!Array.isArray(parsedData)) {
					setJsonError(
						"JSON file must contain an array of artifact templates"
					);
					return;
				}

				// Validate each template
				for (let i = 0; i < parsedData.length; i++) {
					const template = parsedData[i];
					if (!template.slug || !template.name || !template.description) {
						setJsonError(
							`Template ${
								i + 1
							}: Missing required fields (slug, name, description)`
						);
						return;
					}
					if (typeof template.description === "object") {
						if (!template.description.en || !template.description.ru) {
							setJsonError(
								`Template ${
									i + 1
								}: Description must contain both "en" and "ru" translations`
							);
							return;
						}
					}
					if (
						![
							"COMMON",
							"UNCOMMON",
							"RARE",
							"EPIC",
							"LEGENDARY",
						].includes(template.rarity)
					) {
						setJsonError(
							`Template ${
								i + 1
							}: Invalid rarity. Must be COMMON, UNCOMMON, RARE, EPIC, or LEGENDARY`
						);
						return;
					}
				}

				setJsonInput(JSON.stringify(parsedData, null, 2));
				setJsonError("");
			} catch (error) {
				setJsonError(
					`Invalid JSON file: ${error.message || "Unknown error"}`
				);
			}
		};
		reader.readAsText(file);
	};

	const handleCreateTemplate = async () => {
		try {
			if (!formData.slug || !formData.name || !formData.description) {
				showMessage("Please fill in all required fields", "error");
				return;
			}

			if (typeof formData.description === "object") {
				if (!formData.description.en || !formData.description.ru) {
					showMessage(
						"Description must contain both English and Russian translations",
						"error"
					);
					return;
				}
			}

			const response = await artifactTemplateApi.create([formData]);
			showMessage("Artifact template created successfully", "success");
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error creating artifact template:", error);
			showMessage(
				error.response?.data?.message ||
					"Failed to create artifact template",
				"error"
			);
		}
	};

	const handleUpdateTemplate = async () => {
		try {
			if (!editingTemplate?.slug || !formData.name || !formData.description) {
				showMessage("Please fill in all required fields", "error");
				return;
			}

			if (typeof formData.description === "object") {
				if (!formData.description.en || !formData.description.ru) {
					showMessage(
						"Description must contain both English and Russian translations",
						"error"
					);
					return;
				}
			}

			const response = await artifactTemplateApi.update(formData);
			showMessage("Artifact template updated successfully", "success");
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error) {
			console.error("Error updating artifact template:", error);
			showMessage(
				error.response?.data?.message ||
					"Failed to update artifact template",
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
			await artifactTemplateApi.delete(templateToDelete.slug);
			showMessage("Artifact template deleted successfully", "success");
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error) {
			console.error("Error deleting artifact template:", error);
			showMessage(
				error.response?.data?.message ||
					"Failed to delete artifact template",
				"error"
			);
		}
	};

	const openEditModal = (template) => {
		setEditingTemplate(template);

		// Handle description - it might be a string or an object
		let description = { en: "", ru: "" };
		if (template.description) {
			if (typeof template.description === "object") {
				description = {
					en: template.description.en || "",
					ru: template.description.ru || "",
				};
			} else {
				// If it's a string, use it for both languages
				description = {
					en: template.description,
					ru: template.description,
				};
			}
		}

		setFormData({
			slug: template.slug,
			name: template.name,
			description: description,
			rarity: template.rarity,
			image: template.image || "",
			effects: template.effects || {},
			limited: template.limited || false,
			limitedCount: template.limitedCount || 0,
			limitedDuration: template.limitedDuration || 0,
			limitedDurationType: template.limitedDurationType || "HOUR",
			limitedDurationValue: template.limitedDurationValue || 0,
		});
		setShowEditModal(true);
	};

	const downloadTemplate = (template) => {
		const dataStr = JSON.stringify(template, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const linkElement = document.createElement("a");
		linkElement.href = url;
		linkElement.download = `${template.slug}.json`;
		linkElement.click();
	};

	const downloadAllTemplates = () => {
		const dataStr = JSON.stringify(templates, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const linkElement = document.createElement("a");
		linkElement.href = url;
		linkElement.download = "artifact-templates.json";
		linkElement.click();
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
					<div className="text-gray-400">
						Loading artifact templates...
					</div>
				) : templates.length === 0 ? (
					<div className="text-gray-400">No artifact templates found.</div>
				) : (
					<>
						{/* Sort Controls */}
						<div className="mb-4 flex items-center space-x-4">
							<span className="text-sm text-gray-300">Sort by:</span>
							<button
								onClick={() => handleSort("baseChance")}
								className={`px-3 py-1 text-sm rounded-md transition-colors ${
									sortBy === "baseChance"
										? "bg-blue-600 text-white"
										: "bg-gray-700 text-gray-300 hover:bg-gray-600"
								}`}
							>
								Base Chance{" "}
								{sortBy === "baseChance" &&
									(sortOrder === "asc" ? "↑" : "↓")}
							</button>
							<button
								onClick={() => handleSort("name")}
								className={`px-3 py-1 text-sm rounded-md transition-colors ${
									sortBy === "name"
										? "bg-blue-600 text-white"
										: "bg-gray-700 text-gray-300 hover:bg-gray-600"
								}`}
							>
								Name{" "}
								{sortBy === "name" &&
									(sortOrder === "asc" ? "↑" : "↓")}
							</button>
							<button
								onClick={() => handleSort("rarity")}
								className={`px-3 py-1 text-sm rounded-md transition-colors ${
									sortBy === "rarity"
										? "bg-blue-600 text-white"
										: "bg-gray-700 text-gray-300 hover:bg-gray-600"
								}`}
							>
								Rarity{" "}
								{sortBy === "rarity" &&
									(sortOrder === "asc" ? "↑" : "↓")}
							</button>
						</div>
						<div className="space-y-4">
							{sortTemplates(templates).map((template) => (
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
													className={`text-xs px-2 py-1 rounded ${
														template.rarity === "COMMON"
															? "bg-gray-600 text-gray-300"
															: template.rarity ===
															  "UNCOMMON"
															? "bg-green-600 text-white"
															: template.rarity ===
															  "RARE"
															? "bg-blue-600 text-white"
															: template.rarity ===
															  "EPIC"
															? "bg-purple-600 text-white"
															: "bg-yellow-600 text-black"
													}`}
												>
													{template.rarity}
												</span>
											</div>
											<div className="mt-2 text-sm text-gray-400">
												{template.description &&
												typeof template.description ===
													"object" ? (
													<>
														<div>
															<span className="text-gray-500">
																EN:
															</span>{" "}
															{template.description
																.en ||
																"No English description"}
														</div>
														<div>
															<span className="text-gray-500">
																RU:
															</span>{" "}
															{template.description
																.ru ||
																"Нет описания на русском"}
														</div>
													</>
												) : (
													<div>
														<span className="text-gray-500">
															Description:
														</span>{" "}
														{template.description ||
															"No description"}
													</div>
												)}
												{template.image && (
													<div>
														<span className="text-gray-500">
															Image:
														</span>{" "}
														{template.image}
													</div>
												)}
												{template.baseChance !==
													undefined && (
													<div>
														<span className="text-gray-500">
															Base Chance:
														</span>{" "}
														{(
															template.baseChance * 100
														).toFixed(1)}
														%
													</div>
												)}
												{template.limited && (
													<div className="text-yellow-400">
														Limited:{" "}
														{template.limitedCount} items
													</div>
												)}
											</div>
										</div>
										<div className="flex items-center space-x-2">
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
												onClick={() =>
													openEditModal(template)
												}
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
					</>
				)}
			</div>

			{/* Create Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-white">
								Create Artifact Template
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
						<ArtifactTemplateForm
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
								Edit Artifact Template
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
						<ArtifactTemplateForm
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
								Import Artifact Templates from JSON
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
									Or paste JSON content
								</label>
								<textarea
									value={jsonInput}
									onChange={(e) => setJsonInput(e.target.value)}
									placeholder={`[
  {
    "slug": "stardust_amplifier",
    "name": "Stardust Amplifier",
    "description": {
      "en": "Increases stardust production by 10%",
      "ru": "Увеличивает производство звездной пыли на 10%"
    },
    "rarity": "COMMON",
    "image": "⭐",
    "effects": {
      "stardustProduction": 0.1
    },
    "limited": false
  },
  {
    "slug": "chaos_crystal",
    "name": "Chaos Crystal",
    "description": {
      "en": "Increases chaos chance by 5%",
      "ru": "Увеличивает шанс хаоса на 5%"
    },
    "rarity": "UNCOMMON",
    "image": "💎",
    "effects": {
      "chaosChance": 0.05
    },
    "limited": true,
    "limitedCount": 100
  }
]`}
									className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md text-white text-sm font-mono"
								/>
							</div>

							{jsonError && (
								<div className="flex items-center space-x-2 text-red-400">
									<AlertCircle className="h-4 w-4" />
									<span>{jsonError}</span>
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
							<h3 className="text-lg font-semibold text-white">
								Delete Artifact Template
							</h3>
						</div>
						<p className="text-gray-300 mb-6">
							Are you sure you want to delete "{templateToDelete?.name}
							"? This action cannot be undone.
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

function ArtifactTemplateForm({ formData, setFormData, onSubmit, submitText }) {
	const updateField = (field, value) => {
		setFormData({ ...formData, [field]: value });
	};

	const updateDescription = (lang, value) => {
		const currentDescription =
			typeof formData.description === "object"
				? formData.description
				: { en: "", ru: "" };

		setFormData({
			...formData,
			description: {
				...currentDescription,
				[lang]: value,
			},
		});
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="space-y-4"
		>
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
						placeholder="stardust_amplifier"
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
						placeholder="Stardust Amplifier"
						required
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Description (English) *
				</label>
				<textarea
					value={
						typeof formData.description === "object"
							? formData.description.en || ""
							: ""
					}
					onChange={(e) => updateDescription("en", e.target.value)}
					className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
					placeholder="Increases stardust production by 10%"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Description (Russian) *
				</label>
				<textarea
					value={
						typeof formData.description === "object"
							? formData.description.ru || ""
							: ""
					}
					onChange={(e) => updateDescription("ru", e.target.value)}
					className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
					placeholder="Увеличивает производство звездной пыли на 10%"
					required
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Rarity
					</label>
					<select
						value={formData.rarity || "COMMON"}
						onChange={(e) => updateField("rarity", e.target.value)}
						className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
					>
						<option value="COMMON">Common</option>
						<option value="UNCOMMON">Uncommon</option>
						<option value="RARE">Rare</option>
						<option value="EPIC">Epic</option>
						<option value="LEGENDARY">Legendary</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Image
					</label>
					<input
						type="text"
						value={formData.image || ""}
						onChange={(e) => updateField("image", e.target.value)}
						className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="⭐"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Base Chance
					</label>
					<input
						type="number"
						step="0.001"
						min="0"
						max="1"
						value={formData.baseChance || 0.01}
						onChange={(e) =>
							updateField(
								"baseChance",
								parseFloat(e.target.value) || 0.01
							)
						}
						className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
						placeholder="0.01"
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Effects (JSON)
				</label>
				<textarea
					value={JSON.stringify(formData.effects || {}, null, 2)}
					onChange={(e) => {
						try {
							const parsed = JSON.parse(e.target.value);
							updateField("effects", parsed);
						} catch (error) {
							// Ignore parsing errors while typing
						}
					}}
					className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm resize-none"
					placeholder='{"stardustProduction": 0.1, "chaosChance": 0.05}'
				/>
			</div>

			<div className="flex items-center space-x-4">
				<label className="flex items-center">
					<input
						type="checkbox"
						checked={formData.limited || false}
						onChange={(e) => updateField("limited", e.target.checked)}
						className="mr-2"
					/>
					<span className="text-sm text-gray-300">Limited Edition</span>
				</label>
			</div>

			{formData.limited && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Limited Count
						</label>
						<input
							type="number"
							value={formData.limitedCount || 0}
							onChange={(e) =>
								updateField(
									"limitedCount",
									parseInt(e.target.value) || 0
								)
							}
							className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
							min="0"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Duration Type
						</label>
						<select
							value={formData.limitedDurationType || "HOUR"}
							onChange={(e) =>
								updateField("limitedDurationType", e.target.value)
							}
							className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
						>
							<option value="HOUR">Hour</option>
							<option value="DAY">Day</option>
							<option value="WEEK">Week</option>
							<option value="MONTH">Month</option>
							<option value="YEAR">Year</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Duration Value
						</label>
						<input
							type="number"
							value={formData.limitedDurationValue || 0}
							onChange={(e) =>
								updateField(
									"limitedDurationValue",
									parseInt(e.target.value) || 0
								)
							}
							className="w-full h-12 p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
							min="0"
						/>
					</div>
				</div>
			)}

			<div className="flex justify-end space-x-2 pt-4">
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
