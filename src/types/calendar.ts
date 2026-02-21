export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  calendarId?: string;
  location?: string;
  attendees?: string[];
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    endDate?: Date;
    daysOfWeek?: string[];
  };
}