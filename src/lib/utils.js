import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { parseISO } from 'date-fns';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const safeParseDate = (dateStr) => {
	if (!dateStr) return new Date();
	try {
		if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? new Date() : dateStr;
		const parsed = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
		return isNaN(parsed.getTime()) ? new Date() : parsed;
	} catch (e) {
		return new Date();
	}
};
