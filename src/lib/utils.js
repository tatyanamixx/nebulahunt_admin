export function cn(...classes) {
	return classes.filter(Boolean).join(' ');
}

export function formatDate(date) {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function formatNumber(num) {
	return new Intl.NumberFormat('en-US').format(num);
}
