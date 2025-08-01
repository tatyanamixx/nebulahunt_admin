import { useState, useEffect } from 'react';
import { api } from '../lib/api';
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
} from 'lucide-react';

interface TaskTemplate {
	id?: number;
	slug: string;
	title: {
		en: string;
		ru: string;
	};
	description: {
		en: string;
		ru: string;
	};
	reward: {
		type: string;
		amount: number;
	};
	condition: any;
	icon: string;
	active: boolean;
	sortOrder?: number;
	createdAt?: string;
	updatedAt?: string;
}

interface TaskTemplatesTabProps {
	className?: string;
}

export default function TaskTemplatesTab({
	className = '',
}: TaskTemplatesTabProps) {
	const [templates, setTemplates] = useState<TaskTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'success' | 'error'>(
		'success'
	);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showJsonModal, setShowJsonModal] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
		null
	);
	const [jsonInput, setJsonInput] = useState('');
	const [jsonError, setJsonError] = useState('');
	const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(
		null
	);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [templateToDelete, setTemplateToDelete] =
		useState<TaskTemplate | null>(null);

	// Form states
	const [formData, setFormData] = useState<Partial<TaskTemplate>>({
		slug: '',
		title: { en: '', ru: '' },
		description: { en: '', ru: '' },
		reward: { type: 'stardust', amount: 0 },
		condition: {},
		icon: '',
		active: true,
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await api.get('/task-templates');
			console.log('Templates response:', response.data);
			// Ensure we have proper data structure
			const templatesData = response.data?.data || response.data || [];
			console.log('Processed templates data:', templatesData);
			setTemplates(templatesData);
		} catch (error: any) {
			console.error('Error fetching templates:', error);
			showMessage('Failed to fetch task templates', 'error');
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
			title: { en: '', ru: '' },
			description: { en: '', ru: '' },
			reward: { type: 'stardust', amount: 0 },
			condition: {},
			icon: '',
			active: true,
		});
		setJsonInput('');
		setJsonError('');
	};

	const handleCreateFromJson = async () => {
		try {
			setJsonError('');
			const parsedData = JSON.parse(jsonInput);

			if (!Array.isArray(parsedData)) {
				setJsonError('JSON must be an array of task templates');
				return;
			}

			// Remove id field from each template to avoid database constraint violation
			const cleanedData = parsedData.map((template: any) => {
				const { id, createdAt, updatedAt, ...cleanTemplate } = template;
				return cleanTemplate;
			});

			const response = await api.post('/task-templates', cleanedData);
			showMessage('Task templates created successfully', 'success');
			setShowJsonModal(false);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			if (error.name === 'SyntaxError') {
				setJsonError('Invalid JSON format');
			} else {
				console.error('Error creating templates:', error);
				setJsonError(
					error.response?.data?.message ||
						'Failed to create templates'
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
						'JSON file must contain an array of task templates'
					);
					return;
				}

				// Clean the data by removing id, createdAt, updatedAt fields
				const cleanedData = parsedData.map((template: any) => {
					const { id, createdAt, updatedAt, ...cleanTemplate } =
						template;
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
			if (
				!formData.slug ||
				!formData.title?.en ||
				!formData.description?.en
			) {
				showMessage('Please fill in all required fields', 'error');
				return;
			}

			const response = await api.post('/task-templates', [formData]);
			showMessage('Task template created successfully', 'success');
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			console.error('Error creating template:', error);
			showMessage(
				error.response?.data?.message || 'Failed to create template',
				'error'
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
			showMessage('Task template updated successfully', 'success');
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			console.error('Error updating template:', error);
			showMessage(
				error.response?.data?.message || 'Failed to update template',
				'error'
			);
		}
	};

	const handleDeleteTemplate = async (template: TaskTemplate) => {
		setTemplateToDelete(template);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!templateToDelete) return;

		try {
			await api.delete(
				`/task-templates/${encodeURIComponent(templateToDelete.slug)}`
			);
			showMessage('Task template deleted successfully', 'success');
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error: any) {
			console.error('Error deleting template:', error);
			showMessage(
				error.response?.data?.message || 'Failed to delete template',
				'error'
			);
		}
	};

	const handleToggleStatus = async (slug: string) => {
		try {
			await api.put(`/task-templates/${encodeURIComponent(slug)}/toggle`);
			showMessage('Template status toggled successfully', 'success');
			fetchTemplates();
		} catch (error: any) {
			console.error('Error toggling template status:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to toggle template status',
				'error'
			);
		}
	};

	const openEditModal = (template: TaskTemplate) => {
		console.log('Opening edit modal with template:', template);
		setEditingTemplate(template);
		const formData = {
			slug: template.slug || '',
			title: template.title || { en: '', ru: '' },
			description: template.description || { en: '', ru: '' },
			reward: template.reward || { type: 'stardust', amount: 0 },
			condition: template.condition || {},
			icon: template.icon || '',
			active: template.active ?? true,
			sortOrder: template.sortOrder || 0,
		};
		console.log('Setting form data:', formData);
		setFormData(formData);
		setShowEditModal(true);
	};

	const downloadTemplate = (template: TaskTemplate) => {
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
		const exportFileDefaultName = 'task-templates.json';

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	};

	if (loading) {
		return (
			<div
				className={`flex items-center justify-center p-8 ${className}`}>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				<span className='ml-2 text-white'>
					Loading task templates...
				</span>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div></div>
				<div className='flex items-center space-x-2'>
					<button
						onClick={downloadAllTemplates}
						className='inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors'>
						<Download className='h-4 w-4 mr-2' />
						Export All
					</button>
					<button
						onClick={() => setShowJsonModal(true)}
						className='inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
						<Upload className='h-4 w-4 mr-2' />
						Import JSON
					</button>
					<button
						onClick={() => setShowCreateModal(true)}
						className='inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors'>
						<Plus className='h-4 w-4 mr-2' />
						Create Template
					</button>
				</div>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`p-4 rounded-md ${
						messageType === 'success'
							? 'bg-green-600 text-white'
							: 'bg-red-600 text-white'
					}`}>
					{message}
				</div>
			)}

			{/* Templates List */}
			<div className='bg-gray-800 rounded-lg'>
				{templates.length === 0 ? (
					<div className='flex flex-col items-center justify-center p-8 text-gray-400'>
						<FileText className='h-12 w-12 text-gray-500 mx-auto mb-4' />
						<p className='text-lg font-medium'>
							No task templates found
						</p>
						<p className='text-sm'>
							Create your first template to get started
						</p>
					</div>
				) : (
					<div className='divide-y divide-gray-700'>
						{templates.map((template) => (
							<div
								key={template.slug}
								className='p-6 hover:bg-gray-750 transition-colors'>
								<div className='flex items-center justify-between'>
									<div className='flex-1'>
										<div className='flex items-center space-x-3 mb-2'>
											<div className='flex items-center space-x-2'>
												<span className='text-2xl'>
													{template.icon}
												</span>
												<h3 className='text-lg font-medium text-white'>
													{template.title?.en ||
														template.slug}
												</h3>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														template.active
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}`}>
													{template.active
														? 'ACTIVE'
														: 'INACTIVE'}
												</span>
											</div>
										</div>

										<div className='text-sm text-gray-400 space-y-1'>
											<p>
												<strong>Slug:</strong>{' '}
												{template.slug}
											</p>
											<p>
												<strong>Description:</strong>{' '}
												{template.description?.en}
											</p>
											<p>
												<strong>Reward:</strong>{' '}
												{template.reward?.amount}{' '}
												{template.reward?.type}
											</p>
											{template.sortOrder !==
												undefined && (
												<p>
													<strong>Sort Order:</strong>{' '}
													{template.sortOrder}
												</p>
											)}
										</div>
									</div>

									<div className='flex items-center space-x-2 ml-4'>
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
											{template.active ? (
												<EyeOff className='h-3 w-3 mr-1' />
											) : (
												<Eye className='h-3 w-3 mr-1' />
											)}
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
								Create Task Template
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

						<TaskTemplateForm
							formData={formData}
							setFormData={setFormData}
							onSubmit={handleCreateTemplate}
							submitText='Create Template'
						/>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{showEditModal && editingTemplate && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-xl font-bold text-white'>
								Edit Task Template
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

						<TaskTemplateForm
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
								Import Task Templates from JSON
							</h3>
							<button
								onClick={() => {
									setShowJsonModal(false);
									resetForm();
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
										href='/examples/task-templates-example.json'
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
    "slug": "daily-login",
    "title": {
      "en": "Daily Login",
      "ru": "Ежедневный вход"
    },
    "description": {
      "en": "Login to the game daily",
      "ru": "Входите в игру ежедневно"
    },
    "reward": {
      "type": "stardust",
      "amount": 100
    },
    "condition": {
      "type": "daily_login"
    },
    "icon": "🌟",
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
										resetForm();
									}}
									className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors'>
									Cancel
								</button>
								<button
									onClick={handleCreateFromJson}
									className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
									<Upload className='h-4 w-4 mr-2 inline' />
									Import Templates
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && templateToDelete && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-xl font-bold text-white'>
								Confirm Delete
							</h3>
							<button
								onClick={() => {
									setShowDeleteModal(false);
									setTemplateToDelete(null);
								}}
								title='Close modal'
								className='text-gray-400 hover:text-white'>
								<X className='h-6 w-6' />
							</button>
						</div>

						<div className='mb-6'>
							<p className='text-gray-300 mb-2'>
								Are you sure you want to delete this task
								template?
							</p>
							<div className='bg-gray-700 p-3 rounded-md'>
								<p className='text-white font-medium'>
									{templateToDelete.title?.en ||
										templateToDelete.slug}
								</p>
								<p className='text-gray-400 text-sm'>
									Slug: {templateToDelete.slug}
								</p>
							</div>
						</div>

						<div className='flex justify-end space-x-2'>
							<button
								onClick={() => {
									setShowDeleteModal(false);
									setTemplateToDelete(null);
								}}
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

// Task Template Form Component
interface TaskTemplateFormProps {
	formData: Partial<TaskTemplate>;
	setFormData: (data: Partial<TaskTemplate>) => void;
	onSubmit: () => void;
	submitText: string;
}

function TaskTemplateForm({
	formData,
	setFormData,
	onSubmit,
	submitText,
}: TaskTemplateFormProps) {
	const updateField = (field: string, value: any) => {
		setFormData({ ...formData, [field]: value });
	};

	const updateNestedField = (parent: string, field: string, value: any) => {
		setFormData({
			...formData,
			[parent]: {
				...formData[parent as keyof TaskTemplate],
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
						placeholder='daily-login'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Icon *
					</label>
					<input
						type='text'
						value={formData.icon || ''}
						onChange={(e) => updateField('icon', e.target.value)}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='🌟'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Title (English) *
					</label>
					<input
						type='text'
						value={formData.title?.en || ''}
						onChange={(e) =>
							updateNestedField('title', 'en', e.target.value)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='Daily Login'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Title (Russian)
					</label>
					<input
						type='text'
						value={formData.title?.ru || ''}
						onChange={(e) =>
							updateNestedField('title', 'ru', e.target.value)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						placeholder='Ежедневный вход'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Description (English) *
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
						placeholder='Login to the game daily'
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
						placeholder='Входите в игру ежедневно'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Reward Type
					</label>
					<select
						value={formData.reward?.type || 'stardust'}
						onChange={(e) =>
							updateNestedField('reward', 'type', e.target.value)
						}
						aria-label='Select reward type'
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'>
						<option value='stardust'>Stardust</option>
						<option value='darkMatter'>Dark Matter</option>
						<option value='stars'>Stars</option>
						<option value='tonToken'>TON Token</option>
					</select>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Reward Amount
					</label>
					<input
						type='number'
						value={formData.reward?.amount || 0}
						onChange={(e) =>
							updateNestedField(
								'reward',
								'amount',
								parseInt(e.target.value) || 0
							)
						}
						className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
						min='0'
						placeholder='0'
					/>
				</div>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-300 mb-1'>
					Condition (JSON)
				</label>
				<textarea
					value={JSON.stringify(formData.condition || {}, null, 2)}
					onChange={(e) => {
						try {
							const parsed = JSON.parse(e.target.value);
							updateField('condition', parsed);
						} catch (error) {
							// Allow invalid JSON while typing
						}
					}}
					className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm'
					rows={4}
					placeholder='{"type": "daily_login"}'
				/>
			</div>

			<div className='flex items-center space-x-2'>
				<input
					type='checkbox'
					id='active'
					checked={formData.active || false}
					onChange={(e) => updateField('active', e.target.checked)}
					aria-label='Set template as active'
					className='rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500'
				/>
				<label htmlFor='active' className='text-sm text-gray-300'>
					Active
				</label>
			</div>

			<div className='flex justify-end space-x-2 pt-4'>
				<button
					onClick={onSubmit}
					className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
					<Save className='h-4 w-4 mr-2 inline' />
					{submitText}
				</button>
			</div>
		</div>
	);
}
