import { format, parseISO, differenceInHours, differenceInDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

export const formatDateTime = (date: string | Date, pattern: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatTime = (date: string | Date, pattern: string = 'HH:mm:ss'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const isArchiveOverdue = (endTime: string | Date, archiveTime?: string | Date, thresholdHours: number = 24): boolean => {
  if (archiveTime) return false;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  const now = new Date();
  const hoursPassed = differenceInHours(now, end);
  return hoursPassed > thresholdHours;
};

export const getOverdueHours = (endTime: string | Date): number => {
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  const now = new Date();
  return Math.max(0, differenceInHours(now, end));
};

export const getOverdueDays = (endTime: string | Date): number => {
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  const now = new Date();
  return Math.max(0, differenceInDays(now, end));
};

export type TimeRangeType = 'day' | 'week' | 'month' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const getDateRange = (type: TimeRangeType, customStart?: string, customEnd?: string): DateRange => {
  const now = new Date();

  switch (type) {
    case 'day':
      return {
        startDate: format(startOfDay(now), 'yyyy-MM-dd'),
        endDate: format(endOfDay(now), 'yyyy-MM-dd'),
      };
    case 'week':
      return {
        startDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'custom':
      return {
        startDate: customStart || format(startOfDay(now), 'yyyy-MM-dd'),
        endDate: customEnd || format(endOfDay(now), 'yyyy-MM-dd'),
      };
    default:
      return {
        startDate: format(startOfDay(now), 'yyyy-MM-dd'),
        endDate: format(endOfDay(now), 'yyyy-MM-dd'),
      };
  }
};

export const getLastPeriodDateRange = (type: TimeRangeType, currentStart: string, currentEnd: string): DateRange => {
  const start = parseISO(currentStart);
  const end = parseISO(currentEnd);
  const daysDiff = differenceInDays(end, start) + 1;

  switch (type) {
    case 'day':
      return {
        startDate: format(subDays(start, 1), 'yyyy-MM-dd'),
        endDate: format(subDays(end, 1), 'yyyy-MM-dd'),
      };
    case 'week':
      return {
        startDate: format(subWeeks(start, 1), 'yyyy-MM-dd'),
        endDate: format(subWeeks(end, 1), 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        startDate: format(subMonths(start, 1), 'yyyy-MM-dd'),
        endDate: format(subMonths(end, 1), 'yyyy-MM-dd'),
      };
    case 'custom':
      return {
        startDate: format(subDays(start, daysDiff), 'yyyy-MM-dd'),
        endDate: format(subDays(end, daysDiff), 'yyyy-MM-dd'),
      };
    default:
      return {
        startDate: format(subDays(start, 1), 'yyyy-MM-dd'),
        endDate: format(subDays(end, 1), 'yyyy-MM-dd'),
      };
  }
};

export const isDateInRange = (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return d >= startOfDay(start) && d <= endOfDay(end);
};

export const generateDateSeries = (startDate: string, endDate: string): string[] => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const result: string[] = [];
  let current = startOfDay(start);

  while (current <= endOfDay(end)) {
    result.push(format(current, 'yyyy-MM-dd'));
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return result;
};

export const getDurationText = (startTime: string | Date, endTime: string | Date): string => {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  }
  return `${mins}分钟`;
};

export const getRelativeTimeText = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(d);
};
