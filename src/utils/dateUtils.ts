
import { format, formatDistance } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * Format a date to a Dutch formatted string
 */
export const formatDateNL = (date: Date | string | number, formatStr: string = 'PP'): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: nl });
};

/**
 * Get relative time in Dutch (e.g. "3 dagen geleden")
 */
export const getRelativeTimeNL = (date: Date | string | number, baseDate: Date | string | number = new Date()): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const baseDateObj = typeof baseDate === 'string' || typeof baseDate === 'number' ? new Date(baseDate) : baseDate;
  
  return formatDistance(dateObj, baseDateObj, { 
    locale: nl,
    addSuffix: true 
  });
};
