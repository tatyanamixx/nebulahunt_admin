import React, { useState, useEffect } from 'react';
import {
	Plus,
	Edit,
	Trash2,
	Download,
	Upload,
	X,
	AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';

interface CommissionTemplate {
	id?: number;
	currency: 'tgstars' | 'tontoken' | 'stardust' | 'darkmatter' | 'stars';
	rate: number;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface CommissionTemplatesTabProps {
	className?: string;
}

export default function CommissionTemplatesTab({
	className = '',
}: CommissionTemplatesTabProps) {
	const [templates, setTemplates] = useState<CommissionTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'success' | 'error'>(
		'success'
	);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showJsonModal, setShowJsonModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [templateToDelete, setTemplateToDelete] =
		useState<CommissionTemplate | null>(null);
	const [editingTemplate, setEditingTemplate] =
		useState<CommissionTemplate | null>(null);
	const [jsonInput, setJsonInput] = useState('');
	const [jsonError, setJsonError] = useState('');

	const [formData, setFormData] = useState<Partial<CommissionTemplate>>({
		currency: 'tgstars',
		rate: 0.05,
		description: '',
	});

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			console.log('Fetching commission templates...');
			const response = await api.get('/commission-templates');
			console.log('Commission templates response:', response);
			console.log('Response data:', response.data);
			console.log('Response data.data:', response.data?.data);
			console.log('Response data.templates:', response.data?.templates);

			const templatesData =
				response.data?.data ||
				response.data?.templates ||
				response.data ||
				[];
			console.log('Processed templates data:', templatesData);

			setTemplates(templatesData);
		} catch (error: any) {
			console.error('Error fetching commission templates:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to fetch commission templates',
				'error'
			);
		} finally {
			setLoading(false);
		}
	};

	// Debug: Log changes to templates state
	useEffect(() => {
		console.log('Templates state changed:', templates);
	}, [templates]);

	const showMessage = (text: string, type: 'success' | 'error') => {
		setMessage(text);
		setMessageType(type);
		setTimeout(() => setMessage(''), 5000);
	};

	const resetForm = () => {
		setFormData({
			currency: 'tgstars',
			rate: 0.05,
			description: '',
		});
	};

	const handleCreateFromJson = async () => {
		try {
			setJsonError('');

			// Trim whitespace and check if input is empty
			const trimmedInput = jsonInput.trim();
			if (!trimmedInput) {
				setJsonError('Please enter JSON data');
				return;
			}

			console.log('Processing JSON input:', trimmedInput);

			let parsedData;
			try {
				parsedData = JSON.parse(trimmedInput);
			} catch (parseError: any) {
				console.error('JSON parse error:', parseError);
				setJsonError(
					`Invalid JSON format: ${
						parseError.message || 'Unknown error'
					}`
				);
				return;
			}

			console.log('Parsed data:', parsedData);

			if (!Array.isArray(parsedData)) {
				setJsonError('JSON must be an array of commission templates');
				return;
			}

			if (parsedData.length === 0) {
				setJsonError('JSON array cannot be empty');
				return;
			}

			console.log('Validating templates...');

			// Validate each template
			for (let i = 0; i < parsedData.length; i++) {
				const template = parsedData[i];
				console.log(`Validating template ${i + 1}:`, template);

				if (
					!template.currency ||
					![
						'tgstars',
						'tontoken',
						'stardust',
						'darkmatter',
						'stars',
					].includes(template.currency)
				) {
					console.log(
						`Template ${i + 1} failed validation: currency = "${
							template.currency
						}"`
					);
					setJsonError(
						`Template ${
							i + 1
						}: Invalid or missing currency. Must be 'tgstars', 'tontoken', 'stardust', 'darkmatter', or 'stars'`
					);
					return;
				}
				if (
					typeof template.rate !== 'number' ||
					template.rate < 0 ||
					template.rate > 1
				) {
					console.log(
						`Template ${i + 1} failed validation: rate = ${
							template.rate
						} (type: ${typeof template.rate})`
					);
					setJsonError(
						`Template ${
							i + 1
						}: Invalid rate. Must be a number between 0 and 1`
					);
					return;
				}
				console.log(`Template ${i + 1} passed validation`);
			}

			console.log('All templates passed validation');

			// Remove id field from each template to avoid database constraint violation
			const cleanedData = parsedData.map((template: any) => {
				const { id, createdAt, updatedAt, ...cleanTemplate } = template;
				return cleanTemplate;
			});

			console.log('Sending cleaned data to API:', cleanedData);

			const response = await api.post(
				'/commission-templates',
				cleanedData
			);

			console.log('API response:', response);

			showMessage('Commission templates created successfully', 'success');
			setShowJsonModal(false);
			setJsonInput('');
			setJsonError('');
			fetchTemplates();
		} catch (error: any) {
			console.error('Error creating commission templates:', error);
			setJsonError(
				error.response?.data?.message ||
					'Failed to create commission templates'
			);
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
						'JSON file must contain an array of commission templates'
					);
					return;
				}

				// Validate each template
				for (let i = 0; i < parsedData.length; i++) {
					const template = parsedData[i];
					if (
						!template.currency ||
						![
							'tgstars',
							'tontoken',
							'stardust',
							'darkmatter',
							'stars',
						].includes(template.currency)
					) {
						setJsonError(
							`Template ${
								i + 1
							}: Invalid or missing currency. Must be 'tgstars', 'tontoken', 'stardust', 'darkmatter', or 'stars'`
						);
						return;
					}
					if (
						typeof template.rate !== 'number' ||
						template.rate < 0 ||
						template.rate > 1
					) {
						setJsonError(
							`Template ${
								i + 1
							}: Invalid rate. Must be a number between 0 and 1`
						);
						return;
					}
				}

				// Clean the data by removing id, createdAt, updatedAt fields
				const cleanedData = parsedData.map((template: any) => {
					const { id, createdAt, updatedAt, ...cleanTemplate } =
						template;
					return cleanTemplate;
				});

				setJsonInput(JSON.stringify(cleanedData, null, 2));
				setJsonError('');
			} catch (error: any) {
				setJsonError(
					`Invalid JSON file format: ${
						error.message || 'Unknown error'
					}`
				);
			}
		};
		reader.readAsText(file);
	};

	const handleCreateTemplate = async () => {
		try {
			if (!formData.currency) {
				showMessage('Currency is required', 'error');
				return;
			}

			const response = await api.post('/commission-templates', [
				formData,
			]);
			showMessage('Commission template created successfully', 'success');
			setShowCreateModal(false);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			console.error('Error creating commission template:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to create commission template',
				'error'
			);
		}
	};

	const handleUpdateTemplate = async () => {
		try {
			if (!editingTemplate?.currency) {
				showMessage('Template currency is required', 'error');
				return;
			}

			const response = await api.put(
				`/commission-templates/${encodeURIComponent(
					editingTemplate.currency
				)}`,
				formData
			);
			showMessage('Commission template updated successfully', 'success');
			setShowEditModal(false);
			setEditingTemplate(null);
			resetForm();
			fetchTemplates();
		} catch (error: any) {
			console.error('Error updating commission template:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to update commission template',
				'error'
			);
		}
	};

	const handleDeleteTemplate = async (template: CommissionTemplate) => {
		setTemplateToDelete(template);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!templateToDelete?.currency) return;

		try {
			await api.delete(
				`/commission-templates/${encodeURIComponent(
					templateToDelete.currency
				)}`
			);
			showMessage('Commission template deleted successfully', 'success');
			setShowDeleteModal(false);
			setTemplateToDelete(null);
			fetchTemplates();
		} catch (error: any) {
			console.error('Error deleting commission template:', error);
			showMessage(
				error.response?.data?.message ||
					'Failed to delete commission template',
				'error'
			);
		}
	};

	const openEditModal = (template: CommissionTemplate) => {
		console.log('Opening edit modal with commission template:', template);
		setEditingTemplate(template);
		const formData = {
			currency: template.currency || 'tgstars',
			rate: template.rate || 0.05,
			description: template.description || '',
		};
		console.log('Setting form data:', formData);
		setFormData(formData);
		setShowEditModal(true);
	};

	const downloadTemplate = (template: CommissionTemplate) => {
		const dataStr = JSON.stringify(template, null, 2);
		const dataUri =
			'data:application/json;charset=utf-8,' +
			encodeURIComponent(dataStr);
		const exportFileDefaultName = `${template.currency}.json`;

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
		const exportFileDefaultName = 'commission-templates.json';

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
					<div className='text-gray-400'>
						Loading commission templates...
					</div>
				) : templates.length === 0 ? (
					<div className='text-gray-400'>
						No commission templates found.
					</div>
				) : (
					<div className='space-y-4'>
						{templates.map((template) => (
							<div
								key={template.currency}
								className='bg-gray-750 rounded-lg p-4 border border-gray-700'>
								<div className='flex items-center justify-between'>
									<div className='flex-1'>
										<div className='flex items-center space-x-3'>
											<h4 className='text-white font-medium'>
												{template.currency}
											</h4>
											<span className='text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded'>
												{(template.rate * 100).toFixed(
													2
												)}
												%
											</span>
										</div>
										<div className='mt-2 text-sm text-gray-400'>
											{template.description && (
												<div>
													<span className='text-gray-500'>
														Description:
													</span>{' '}
													{template.description}
												</div>
											)}
										</div>
									</div>
									<div className='flex items-center space-x-2'>
										<button
											onClick={() =>
												downloadTemplate(template)
											}
											title='Download template'
											className='inline-flex items-center px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'>
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
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-xl font-bold text-white'>
								Create Commission Template
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

						<CommissionTemplateForm
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
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-xl font-bold text-white'>
								Edit Commission Template
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

						<CommissionTemplateForm
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
								Import Commission Templates from JSON
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
										href='#'
										onClick={(e) => {
											e.preventDefault();
											const exampleData = [
												{
													currency: 'tgstars',
													rate: 0.05,
													description:
														'Standard commission for TG Stars',
												},
											];
											const dataStr = JSON.stringify(
												exampleData,
												null,
												2
											);
											const dataUri =
												'data:application/json;charset=utf-8,' +
												encodeURIComponent(dataStr);
											const linkElement =
												document.createElement('a');
											linkElement.setAttribute(
												'href',
												dataUri
											);
											linkElement.setAttribute(
												'download',
												'commission-templates-example.json'
											);
											linkElement.click();
										}}
										className='text-blue-400 hover:text-blue-300 text-sm'>
										Download Example
									</a>
								</div>
								<div className='flex items-center space-x-2'>
									<input
										type='file'
										accept='.json'
										onChange={handleFileUpload}
										className='hidden'
										id='commission-json-upload'
									/>
									<label
										htmlFor='commission-json-upload'
										className='cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'>
										<Upload className='h-4 w-4 mr-2' />
										Choose File
									</label>
									<span className='text-sm text-gray-400'>
										or paste JSON directly below
									</span>
								</div>
							</div>

							{/* JSON Input Section */}
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									JSON Content
								</label>
								<textarea
									value={jsonInput}
									onChange={(e) =>
										setJsonInput(e.target.value)
									}
									className='w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm'
									placeholder='[{"currency": "tgstars", "rate": 0.05, "description": "Standard commission for TG Stars"}, {"currency": "stardust", "rate": 0.03, "description": "Commission for Stardust"}]'
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
							Are you sure you want to delete the commission
							template for "{templateToDelete?.currency}"? This
							action cannot be undone.
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

interface CommissionTemplateFormProps {
	formData: Partial<CommissionTemplate>;
	setFormData: (data: Partial<CommissionTemplate>) => void;
	onSubmit: () => void;
	submitText: string;
}

function CommissionTemplateForm({
	formData,
	setFormData,
	onSubmit,
	submitText,
}: CommissionTemplateFormProps) {
	const updateField = (field: string, value: any) => {
		setFormData({
			...formData,
			[field]: value,
		});
	};

	return (
		<div className='space-y-4'>
			<div>
				<label className='block text-sm font-medium text-gray-300 mb-1'>
					Currency *
				</label>
				<select
					value={formData.currency || 'tgstars'}
					onChange={(e) => updateField('currency', e.target.value)}
					className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
					title='Select currency'>
					<option value='tgstars'>TG Stars</option>
					<option value='tontoken'>TON Token</option>
					<option value='stardust'>Stardust</option>
					<option value='darkmatter'>Dark Matter</option>
					<option value='stars'>Stars</option>
				</select>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-300 mb-1'>
					Commission Rate *
				</label>
				<input
					type='number'
					step='0.001'
					min='0'
					max='1'
					value={formData.rate || 0.05}
					onChange={(e) =>
						updateField('rate', parseFloat(e.target.value) || 0.05)
					}
					className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
					placeholder='0.05'
				/>
				<p className='text-xs text-gray-400 mt-1'>
					{(formData.rate || 0.05) * 100}%
				</p>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-300 mb-1'>
					Description
				</label>
				<textarea
					value={formData.description || ''}
					onChange={(e) => updateField('description', e.target.value)}
					className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
					rows={3}
					placeholder='Description of this commission...'
				/>
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
