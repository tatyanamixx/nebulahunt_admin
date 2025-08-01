import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
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
} from 'lucide-react';

interface UpgradeTemplate {
	id?: number;
	slug: string;
	name: string;
	description?: {
		en: string;
		ru: string;
	};
	maxLevel: number;
	basePrice: number;
	effectPerLevel: number;
	priceMultiplier: number;
	currency: 'stardust' | 'darkmatter' | 'stars';
	category:
		| 'production'
		| 'economy'
		| 'special'
		| 'chance'
		| 'storage'
		| 'multiplier';
	icon: string;
	stability: number;
	instability: number;
	modifiers?: any;
	active: boolean;
	conditions?: any;
	delayedUntil?: string;
	children?: string[];
	weight: number;
	createdAt?: string;
	updatedAt?: string;
}

interface UpgradeTemplatesTabProps {
	className?: string;
}

export default function UpgradeTemplatesTab({
	className = '',
}: UpgradeTemplatesTabProps) {
	const [templates, setTemplates] = useState<UpgradeTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'success' | 'error'>(
		'success'
	);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showJsonModal, setShowJsonModal] = useState(false);
	const [editingTemplate, setEditingTemplate] =
		useState<UpgradeTemplate | null>(null);
	const [jsonInput, setJsonInput] = useState('');
	const [jsonError, setJsonError] = useState('');
	const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(
		null
	);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [templateToDelete, setTemplateToDelete] =
		useState<UpgradeTemplate | null>(null);

	// Form states
	const [formData, setFormData] = useState<Partial<UpgradeTemplate>>({
		slug: '',
		name: '',
		description: { en: '', ru: '' },
		maxLevel: 1,
		basePrice: 0,
		effectPerLevel: 0,
		priceMultiplier: 1.0,
		currency: 'stardust',
		category: 'production',
		icon: '',
		stability: 0,
		instability: 0,
		modifiers: {},
		active: true,
		conditions: {},
		delayedUntil: '',
		children: [],
		weight: 1,
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	// Debug: Log templates state changes
	useEffect(() => {
		console.log('Templates state changed:', templates);
	}, [templates]);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await api.get('/upgrade-templates');
			console.log('Upgrade templates response:', response.data);
			console.log('Response data type:', typeof response.data);
			console.log(
				'Response data is array:',
				Array.isArray(response.data)
			);

			// Ensure we have proper data structure
			let templatesData;
			if (Array.isArray(response.data)) {
				templatesData = response.data;
			} else if (
				response.data?.data &&
				Array.isArray(response.data.data)
			) {
				templatesData = response.data.data;
			} else if (
				response.data?.templates &&
				Array.isArray(response.data.templates)
			) {
				templatesData = response.data.templates;
			} else {
				templatesData = [];
			}

			console.log('Processed upgrade templates data:', templatesData);
			console.log('Templates count:', templatesData.length);
			setTemplates(templatesData);

			// Debug: Check templates state after setting
			setTimeout(() => {
				console.log('Templates state after setState:', templates);
			}, 100);
		} catch (error: any) {
			console.error('Error fetching upgrade templates:', error);
			showMessage('Failed to fetch upgrade templates', 'error');
		} finally {
			setLoading(false);
		}
	};

	const showMessage = (text: string, type: 'success' | 'error') => {
		setMessage(text);
		setMessageType(type);
		setTimeout(() => setMessage(''), 5000);
	};

	const resetForm = () => {
		setFormData({
			slug: '',
			name: '',
			description: { en: '', ru: '' },
			maxLevel: 1,
			basePrice: 0,
			effectPerLevel: 0,
			priceMultiplier: 1.0,
			currency: 'stardust',
			category: 'production',
			icon: '',
			stability: 0,
			instability: 0,
			modifiers: {},
			active: true,
			conditions: {},
			delayedUntil: '',
			children: [],
			weight: 1,
		});
	};

	const handleCreateFromJson = async () => {
		try {
			setJsonError('');
			const parsedData = JSON.parse(jsonInput);

			if (!Array.isArray(parsedData)) {
				setJsonError('JSON must be an array of upgrade templates');
				return;
			}

			// Remove id field from each template to avoid database constraint violation
			const cleanedData = parsedData.map((template: any) => {
				const { id, createdAt, updatedAt, ...cleanTemplate } = template;
				// Clean up delayedUntil - remove empty strings
				if (
					cleanTemplate.delayedUntil &&
					cleanTemplate.delayedUntil.trim() === ''
				) {
					delete cleanTemplate.delayedUntil;
				}
				return cleanTemplate;
			});

			const response = await api.post('/upgrade-templates', cleanedData);
			showMessage('Upgrade templates created successfully', 'success');
			setShowJsonModal(false);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			if (error.name === 'SyntaxError') {
				setJsonError('Invalid JSON format');
			} else {
				console.error('Error creating upgrade templates:', error);
				setJsonError(
					error.response?.data?.message ||
						'Failed to create upgrade templates'
				);
			}
		}
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const parsedData = JSON.parse(content);

				if (!Array.isArray(parsedData)) {
					setJsonError(
						'JSON file must contain an array of upgrade templates'
					);
					return;
				}

				// Clean the data by removing id, createdAt, updatedAt fields
				const cleanedData = parsedData.map((template: any) => {
					const { id, createdAt, updatedAt, ...cleanTemplate } =
						template;
					// Clean up delayedUntil - remove empty strings
					if (
						cleanTemplate.delayedUntil &&
						cleanTemplate.delayedUntil.trim() === ''
					) {
						delete cleanTemplate.delayedUntil;
					}
					return cleanTemplate;
				});

				setJsonInput(JSON.stringify(cleanedData, null, 2));
				setJsonError('');
			} catch (error) {
				setJsonError('Invalid JSON file format');
			}
		};
		reader.readAsText(file);
	};

	const handleCreateTemplate = async () => {
		try {
			if (!formData.slug || !formData.name) {
				showMessage('Please fill in all required fields', 'error');
				return;
			}

			// Clean up formData - remove empty delayedUntil
			const cleanedData = {
				...formData,
				delayedUntil:
					formData.delayedUntil && formData.delayedUntil.trim() !== ''
						? formData.delayedUntil
						: undefined,
			};

			const response = await api.post('/upgrade-templates', [
				cleanedData,
			]);
			showMessage('Upgrade template created successfully', 'success');
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			console.error('Error creating upgrade template:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to create upgrade template',
				'error'
			);
		}
	};

	const handleUpdateTemplate = async () => {
		try {
			if (!editingTemplate?.slug) return;

			// Clean up formData - remove empty delayedUntil
			const cleanedData = {
				...formData,
				delayedUntil:
					formData.delayedUntil && formData.delayedUntil.trim() !== ''
						? formData.delayedUntil
						: undefined,
			};

			const response = await api.put(
				`/upgrade-templates/${encodeURIComponent(
					editingTemplate.slug
				)}`,
				cleanedData
			);
			showMessage('Upgrade template updated successfully', 'success');
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			console.error('Error updating upgrade template:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to update upgrade template',
				'error'
			);
		}
	};

	const handleDeleteTemplate = async (template: UpgradeTemplate) => {
		setTemplateToDelete(template);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!templateToDelete) return;

		try {
			await api.delete(
				`/upgrade-templates/${encodeURIComponent(
					templateToDelete.slug
				)}`
			);
			showMessage('Upgrade template deleted successfully', 'success');
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error: any) {
			console.error('Error deleting upgrade template:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to delete upgrade template',
				'error'
			);
		}
	};

	const handleToggleStatus = async (slug: string) => {
		try {
			await api.post(
				`/upgrade-templates/${encodeURIComponent(slug)}/activate`
			);
			showMessage(
				'Upgrade template status toggled successfully',
				'success'
			);
			fetchTemplates();
		} catch (error: any) {
			console.error('Error toggling upgrade template status:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to toggle upgrade template status',
				'error'
			);
		}
	};

	const openEditModal = (template: UpgradeTemplate) => {
		console.log('Opening edit modal with upgrade template:', template);
		setEditingTemplate(template);
		const formData = {
			slug: template.slug || '',
			name: template.name || '',
			description: template.description || { en: '', ru: '' },
			maxLevel: template.maxLevel || 1,
			basePrice: template.basePrice || 0,
			effectPerLevel: template.effectPerLevel || 0,
			priceMultiplier: template.priceMultiplier || 1.0,
			currency: template.currency || 'stardust',
			category: template.category || 'production',
			icon: template.icon || '',
			stability: template.stability || 0,
			instability: template.instability || 0,
			modifiers: template.modifiers || {},
			active: template.active ?? true,
			conditions: template.conditions || {},
			delayedUntil: template.delayedUntil || '',
			children: template.children || [],
			weight: template.weight || 1,
		};
		console.log('Setting form data:', formData);
		setFormData(formData);
		setShowEditModal(true);
	};

	const downloadTemplate = (template: UpgradeTemplate) => {
		const dataStr = JSON.stringify(template, null, 2);
		const dataUri =
			'data:application/json;charset=utf-8,' +
			encodeURIComponent(dataStr);
		const exportFileDefaultName = `${template.slug}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	};

	const downloadAllTemplates = () => {
		const dataStr = JSON.stringify(templates, null, 2);
		const dataUri =
			'data:application/json;charset=utf-8,' +
			encodeURIComponent(dataStr);
		const exportFileDefaultName = 'upgrade-templates.json';

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	};

	// Debug: Log current templates state
	console.log('Current templates state in render:', templates);

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div></div>
				<div className='flex space-x-2'>
					<button
						onClick={() => setShowJsonModal(true)}
						title='Import from JSON'
						className='inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors'>
						<Upload className='h-4 w-4 mr-2' />
						Import JSON
					</button>
					<button
						onClick={downloadAllTemplates}
						title='Export all templates'
						className='inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
						<Download className='h-4 w-4 mr-2' />
						Export All
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
						title='Create new template'
						className='inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors'>
						<Plus className='h-4 w-4 mr-2' />
						Create Template
					</button>
				</div>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`p-3 rounded-md ${
						messageType === 'success'
							? 'bg-green-600 text-white'
							: 'bg-red-600 text-white'
					}`}>
					{message}
				</div>
			)}

			{/* Templates List */}
			<div className='bg-gray-800 rounded-lg p-6'>
				{loading ? (
					<div className='text-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4'></div>
						<p className='text-gray-400'>
							Loading upgrade templates...
						</p>
					</div>
				) : templates.length === 0 ? (
					<div className='text-center py-8'>
						<Zap className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-400'>
							No upgrade templates found
						</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className='mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
							<Plus className='h-4 w-4 mr-2' />
							Create First Template
						</button>
					</div>
				) : (
					<div className='space-y-4'>
						{templates.map((template) => (
							<div
								key={template.slug}
								className='bg-gray-700 rounded-lg p-4 border border-gray-600'>
								<div className='flex items-center justify-between'>
									<div className='flex-1'>
										<div className='flex items-center space-x-3 mb-2'>
											<h3 className='text-lg font-semibold text-white'>
												{template.name}
											</h3>
											<span className='text-sm text-gray-400'>
												({template.slug})
											</span>
											{!template.active && (
												<span className='px-2 py-1 text-xs bg-red-600 text-white rounded'>
													Disabled
												</span>
											)}
										</div>
										{template.description?.en && (
											<p className='text-gray-300 mb-2'>
												{template.description.en}
											</p>
										)}
										<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
											<div>
												<span className='text-gray-400'>
													Category:
												</span>
												<span className='text-white ml-2'>
													{template.category}
												</span>
											</div>
											<div>
												<span className='text-gray-400'>
													Max Level:
												</span>
												<span className='text-white ml-2'>
													{template.maxLevel}
												</span>
											</div>
											<div>
												<span className='text-gray-400'>
													Base Price:
												</span>
												<span className='text-white ml-2'>
													{template.basePrice}{' '}
													{template.currency}
												</span>
											</div>
											<div>
												<span className='text-gray-400'>
													Effect/Level:
												</span>
												<span className='text-white ml-2'>
													{template.effectPerLevel}
												</span>
											</div>
										</div>
									</div>
									<div className='flex space-x-2 ml-4'>
										<button
											onClick={() =>
												downloadTemplate(template)
											}
											title='Export template as JSON'
											className='inline-flex items-center px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors'>
											<Download className='h-3 w-3 mr-1' />
											Export
										</button>
										<button
											onClick={() =>
												openEditModal(template)
											}
											title='Edit template'
											className='inline-flex items-center px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'>
											<Edit className='h-3 w-3 mr-1' />
											Edit
										</button>
										<button
											onClick={() =>
												handleToggleStatus(
													template.slug
												)
											}
											title={
												template.active
													? 'Disable template'
													: 'Enable template'
											}
											className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
												template.active
													? 'bg-yellow-600 hover:bg-yellow-700 text-white'
													: 'bg-green-600 hover:bg-green-700 text-white'
											}`}>
											{template.active
												? 'Disable'
												: 'Enable'}
										</button>
										<button
											onClick={() =>
												handleDeleteTemplate(template)
											}
											title='Delete template'
											className='inline-flex items-center px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors'>
											<Trash2 className='h-3 w-3 mr-1' />
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
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-xl font-bold text-white'>
								Create Upgrade Template
							</h3>
							<button
								onClick={() => {
									setShowCreateModal(false);
									resetForm();
								}}
								title='Close modal'
								className='text-gray-400 hover:text-white'>
								<X className='h-6 w-6' />
							</button>
						</div>

						<UpgradeTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleCreateTemplate}
							submitText='Create Template'
						/>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{showEditModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-xl font-bold text-white'>
								Edit Upgrade Template
							</h3>
							<button
								onClick={() => {
									setShowEditModal(false);
									setEditingTemplate(null);
									resetForm();
								}}
								title='Close modal'
								className='text-gray-400 hover:text-white'>
								<X className='h-6 w-6' />
							</button>
						</div>

						<UpgradeTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleUpdateTemplate}
							submitText='Update Template'
						/>
					</div>
				</div>
			)}

			{/* JSON Import Modal */}
			{showJsonModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-xl font-bold text-white'>
								Import Upgrade Templates from JSON
							</h3>
							<button
								onClick={() => {
									setShowJsonModal(false);
									setJsonInput('');
									setJsonError('');
								}}
								title='Close modal'
								className='text-gray-400 hover:text-white'>
								<X className='h-6 w-6' />
							</button>
						</div>

						<div className='space-y-4'>
							{/* File Upload Section */}
							<div className='border border-gray-600 rounded-lg p-4 bg-gray-750'>
								<div className='flex items-center justify-between mb-3'>
									<label className='block text-sm font-medium text-gray-300'>
										Upload JSON File
									</label>
									<a
										href='/examples/upgrade-templates-example.json'
										download
										className='text-sm text-blue-400 hover:text-blue-300 underline'>
										Download Example
									</a>
								</div>
								<div className='flex items-center space-x-3'>
									<input
										type='file'
										accept='.json'
										onChange={handleFileUpload}
										className='hidden'
										aria-label='Upload JSON file'
										ref={(el) => setFileInputRef(el)}
									/>
									<button
										onClick={() => fileInputRef?.click()}
										className='inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
										<FolderOpen className='h-4 w-4 mr-2' />
										Choose File
									</button>
									<span className='text-sm text-gray-400'>
										Select a JSON file to upload
									</span>
								</div>
							</div>

							{/* Manual JSON Input Section */}
							<div>
								<div className='flex items-center justify-between mb-2'>
									<label className='block text-sm font-medium text-gray-300'>
										Or paste JSON data manually
									</label>
								</div>
								<textarea
									value={jsonInput}
									onChange={(e) =>
										setJsonInput(e.target.value)
									}
									className='w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm'
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
								<div className='flex items-center p-3 bg-red-600 text-white rounded-md'>
									<AlertCircle className='h-4 w-4 mr-2' />
									{jsonError}
								</div>
							)}

							<div className='flex justify-end space-x-2'>
								<button
									onClick={() => {
										setShowJsonModal(false);
										setJsonInput('');
										setJsonError('');
									}}
									className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors'>
									Cancel
								</button>
								<button
									onClick={handleCreateFromJson}
									className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors'>
									Import Templates
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md'>
						<div className='flex items-center space-x-3 mb-4'>
							<AlertCircle className='h-6 w-6 text-red-400' />
							<h3 className='text-xl font-bold text-white'>
								Delete Template
							</h3>
						</div>
						<p className='text-gray-300 mb-6'>
							Are you sure you want to delete the template "
							{templateToDelete?.name}"? This action cannot be
							undone.
						</p>
						<div className='flex justify-end space-x-2'>
							<button
								onClick={() => setShowDeleteModal(false)}
								className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors'>
								Cancel
							</button>
							<button
								onClick={confirmDelete}
								className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors'>
								<Trash2 className='h-4 w-4 mr-2 inline' />
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

interface UpgradeTemplateFormProps {
	formData: Partial<UpgradeTemplate>;
	setFormData: (data: Partial<UpgradeTemplate>) => void;
	onSubmit: () => void;
	submitText: string;
}

function UpgradeTemplateForm({
	formData,
	setFormData,
	onSubmit,
	submitText,
}: UpgradeTemplateFormProps) {
	const updateField = (field: string, value: any) => {
		setFormData({ ...formData, [field]: value });
	};

	const updateNestedField = (parent: string, field: string, value: any) => {
		setFormData({
			...formData,
			[parent]: {
				...formData[parent as keyof UpgradeTemplate],
				[field]: value,
			},
		});
	};

	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Slug *
					</label>
					<input
						type='text'
						value={formData.slug || ''}
						onChange={(e) =>
							updateField(
								'slug',
								e.target.value.replace(/\s+/g, '-')
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='production-boost'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Name *
					</label>
					<input
						type='text'
						value={formData.name || ''}
						onChange={(e) => updateField('name', e.target.value)}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='Production Boost'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Description (English)
					</label>
					<textarea
						value={formData.description?.en || ''}
						onChange={(e) =>
							updateNestedField(
								'description',
								'en',
								e.target.value
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						rows={3}
						placeholder='Description in English...'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Description (Russian)
					</label>
					<textarea
						value={formData.description?.ru || ''}
						onChange={(e) =>
							updateNestedField(
								'description',
								'ru',
								e.target.value
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						rows={3}
						placeholder='Описание на русском...'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Category *
					</label>
					<select
						value={formData.category || 'production'}
						onChange={(e) =>
							updateField('category', e.target.value)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						title='Select upgrade category'>
						<option value='production'>Production</option>
						<option value='economy'>Economy</option>
						<option value='special'>Special</option>
						<option value='chance'>Chance</option>
						<option value='storage'>Storage</option>
						<option value='multiplier'>Multiplier</option>
					</select>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Currency *
					</label>
					<select
						value={formData.currency || 'stardust'}
						onChange={(e) =>
							updateField('currency', e.target.value)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						title='Select currency type'>
						<option value='stardust'>Stardust</option>
						<option value='darkmatter'>Dark Matter</option>
						<option value='stars'>Stars</option>
					</select>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Max Level *
					</label>
					<input
						type='number'
						value={formData.maxLevel || 1}
						onChange={(e) =>
							updateField(
								'maxLevel',
								parseInt(e.target.value) || 1
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='1'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Base Price *
					</label>
					<input
						type='number'
						value={formData.basePrice || 0}
						onChange={(e) =>
							updateField(
								'basePrice',
								parseInt(e.target.value) || 0
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='0'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Effect Per Level
					</label>
					<input
						type='number'
						step='0.01'
						value={formData.effectPerLevel || 0}
						onChange={(e) =>
							updateField(
								'effectPerLevel',
								parseFloat(e.target.value) || 0
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='0'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Price Multiplier
					</label>
					<input
						type='number'
						step='0.01'
						value={formData.priceMultiplier || 1.0}
						onChange={(e) =>
							updateField(
								'priceMultiplier',
								parseFloat(e.target.value) || 1.0
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='1.0'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Icon
					</label>
					<input
						type='text'
						value={formData.icon || ''}
						onChange={(e) => updateField('icon', e.target.value)}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='⚡'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Weight
					</label>
					<input
						type='number'
						value={formData.weight || 1}
						onChange={(e) =>
							updateField('weight', parseInt(e.target.value) || 1)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='1'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Stability
					</label>
					<input
						type='number'
						step='0.01'
						value={formData.stability || 0}
						onChange={(e) =>
							updateField(
								'stability',
								parseFloat(e.target.value) || 0
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='0'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Instability
					</label>
					<input
						type='number'
						step='0.01'
						value={formData.instability || 0}
						onChange={(e) =>
							updateField(
								'instability',
								parseFloat(e.target.value) || 0
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='0'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4'>
				<div>
					<div className='flex items-center justify-between mb-1'>
						<label className='block text-sm font-medium text-gray-300'>
							Modifiers (JSON)
						</label>
						<div className='flex space-x-2'>
							<button
								type='button'
								onClick={() => updateField('modifiers', {})}
								className='px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors'
								title='Clear modifiers'>
								Clear
							</button>
							<button
								type='button'
								onClick={() =>
									updateField('modifiers', {
										productionBonus: 0.1,
										energyCost: 0.05,
									})
								}
								className='px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'
								title='Set example modifiers'>
								Example
							</button>
						</div>
					</div>
					<textarea
						value={JSON.stringify(
							formData.modifiers || {},
							null,
							2
						)}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								updateField('modifiers', parsed);
							} catch (error) {
								// Keep the raw value if JSON is invalid
								updateField('modifiers', e.target.value);
							}
						}}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm'
						rows={4}
						placeholder='{"bonus": 0.1, "multiplier": 1.2}'
					/>
					<p className='text-xs text-gray-400 mt-1'>
						Enter valid JSON for additional modifiers and effects
					</p>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4'>
				<div>
					<div className='flex items-center justify-between mb-1'>
						<label className='block text-sm font-medium text-gray-300'>
							Conditions (JSON)
						</label>
						<div className='flex space-x-2'>
							<button
								type='button'
								onClick={() => updateField('conditions', {})}
								className='px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors'
								title='Clear conditions'>
								Clear
							</button>
							<button
								type='button'
								onClick={() =>
									updateField('conditions', {
										level: 3,
										resources: { stardust: 500 },
									})
								}
								className='px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'
								title='Set example conditions'>
								Example
							</button>
						</div>
					</div>
					<textarea
						value={JSON.stringify(
							formData.conditions || {},
							null,
							2
						)}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								updateField('conditions', parsed);
							} catch (error) {
								// Keep the raw value if JSON is invalid
								updateField('conditions', e.target.value);
							}
						}}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm'
						rows={4}
						placeholder='{"level": 5, "resources": {"stardust": 1000}}'
					/>
					<p className='text-xs text-gray-400 mt-1'>
						Enter valid JSON for conditions required to unlock this
						upgrade
					</p>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Children (Array of slugs)
					</label>
					<div className='space-y-2'>
						{Array.isArray(formData.children) &&
							formData.children.map((child, index) => (
								<div
									key={index}
									className='flex items-center space-x-2'>
									<input
										type='text'
										value={child}
										onChange={(e) => {
											const newChildren = [
												...(formData.children || []),
											];
											newChildren[index] = e.target.value;
											updateField(
												'children',
												newChildren
											);
										}}
										className='flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
										placeholder='upgrade-slug'
									/>
									<button
										type='button'
										onClick={() => {
											const newChildren = [
												...(formData.children || []),
											];
											newChildren.splice(index, 1);
											updateField(
												'children',
												newChildren
											);
										}}
										className='px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors'
										title='Remove child'>
										×
									</button>
								</div>
							))}
						<button
							type='button'
							onClick={() => {
								const newChildren = [
									...(formData.children || []),
									'',
								];
								updateField('children', newChildren);
							}}
							className='w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors border border-dashed border-gray-500'>
							+ Add Child Upgrade
						</button>
					</div>
					<p className='text-xs text-gray-400 mt-1'>
						Add child upgrade slugs that will be unlocked by this
						upgrade
					</p>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Delayed Until
					</label>
					<input
						type='datetime-local'
						value={formData.delayedUntil || ''}
						onChange={(e) =>
							updateField('delayedUntil', e.target.value)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='Select date and time'
					/>
				</div>
			</div>

			<div className='flex items-center space-x-4'>
				<label className='flex items-center'>
					<input
						type='checkbox'
						checked={formData.active ?? true}
						onChange={(e) =>
							updateField('active', e.target.checked)
						}
						className='rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500'
					/>
					<span className='ml-2 text-gray-300'>Active</span>
				</label>
			</div>

			<div className='flex justify-end space-x-2'>
				<button
					onClick={onSubmit}
					className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
					{submitText}
				</button>
			</div>
		</div>
	);
}
