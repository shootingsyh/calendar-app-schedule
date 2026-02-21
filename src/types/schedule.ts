export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startUtc: string; // ISO string
  endUtc?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  reminder?: {
    time: string; // HH:MM
    enabled: boolean;
  };
  recurrence?: {
    rule: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
      interval?: number;
      count?: number;
      until?: string; // ISO date string
      byDay?: string[]; // e.g., ['MO', 'WE', 'FR']
      byMonth?: number[]; // e.g., [1, 6, 12]
      byMonthDay?: number[]; // e.g., [1, 15]
    };
    originalDate: string; // The original start date of the recurring event
    originalTime?: string; // The original time of the recurring event
  };
  isRecurringOccurrence?: boolean;
  calendarId?: string;
}