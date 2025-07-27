export function cn(...classes: (string | undefined | null | false)[]) {
	return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date) {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function formatNumber(num: number) {
	return new Intl.NumberFormat('en-US').format(num);
}
