import { CalendarEvent } from '../types/calendar';
import { ScheduleItem } from '../types/schedule';
import { ScheduleStorage } from '../utils/scheduleStorage';
import { ScheduleService } from './scheduleService';

// For iOS and Android platform-specific imports
import { Platform } from 'react-native';
import CalendarEvents from 'react-native-calendar-events';

export class CalendarSyncService {
  private scheduleStorage: ScheduleStorage;
  private scheduleService: ScheduleService;

  constructor() {
    this.scheduleStorage = new ScheduleStorage();
    this.scheduleService = new ScheduleService();
  }

  /**
   * Request calendar permissions
   */
  async requestCalendarPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS permission request
        const status = await CalendarEvents.requestPermissions();
        return status === 'authorized' || status === 'restricted';
      } else if (Platform.OS === 'android') {
        // Android permission request
        const status = await CalendarEvents.requestPermissions();
        return status === 'authorized' || status === 'restricted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  }

  /**
   * Get all available calendars
   */
  async getCalendars(): Promise<any[]> {
    try {
      const calendars = await CalendarEvents.findCalendars();
      return calendars;
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return [];
    }
  }

  /**
   * Import events from calendar to local storage
   */
  async importEventsFromCalendar(calendarId?: string): Promise<CalendarEvent[]> {
    try {
      // Get events from the calendar
      const events = await CalendarEvents.findEvents(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        calendarId ? [calendarId] : undefined
      );

      // Convert to our CalendarEvent format
      const calendarEvents: CalendarEvent[] = events.map(event => ({
        id: event.id,
        title: event.title || 'Untitled Event',
        description: event.notes || '',
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay || false,
        calendarId: event.calendarId,
        location: event.location || '',
        attendees: event.attendees || [],
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval,
          endDate: event.recurrence.endDate,
          daysOfWeek: event.recurrence.daysOfWeek,
        } : undefined,
      }));

      // Save to local storage
      for (const event of calendarEvents) {
        await this.saveCalendarEvent(event);
      }

      return calendarEvents;
    } catch (error) {
      console.error('Error importing calendar events:', error);
      return [];
    }
  }

  /**
   * Export schedule items to calendar
   */
  async exportScheduleItemsToCalendar(scheduleItems: ScheduleItem[], calendarId?: string): Promise<boolean> {
    try {
      for (const item of scheduleItems) {
        // Convert schedule item to calendar event
        const calendarEvent = {
          title: item.title,
          description: item.description,
          startDate: new Date(item.startUtc),
          endDate: new Date(item.startUtc),
          allDay: !item.startTime,
          calendarId: calendarId,
          location: item.location || '',
          attendees: item.attendees || [],
        };

        // Create event in calendar
        await CalendarEvents.saveEvent(calendarEvent.title, {
          startDate: calendarEvent.startDate,
          endDate: calendarEvent.endDate,
          allDay: calendarEvent.allDay,
          calendarId: calendarEvent.calendarId,
          location: calendarEvent.location,
          notes: calendarEvent.description,
          attendees: calendarEvent.attendees,
        });
      }
      return true;
    } catch (error) {
      console.error('Error exporting schedule items to calendar:', error);
      return false;
    }
  }

  /**
   * Get all schedule items (needed for export)
   */
  async getAllScheduleItems(): Promise<ScheduleItem[]> {
    return await this.scheduleService.getAllScheduleItems();
  }

  /**
   * Save calendar event to local storage
   */
  private async saveCalendarEvent(event: CalendarEvent): Promise<void> {
    // For simplicity, we're storing these in the schedule storage
    // In a real app, you might want a separate storage for calendar events
    await this.scheduleStorage.saveSchedule({
      id: event.id,
      title: event.title,
      description: event.description,
      startUtc: event.startDate.toISOString(),
      endUtc: event.endDate.toISOString(),
      location: event.location,
      attendees: event.attendees,
      calendarId: event.calendarId,
      allDay: event.allDay,
      recurrence: event.recurrence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Get calendar events for a specific date
   */
  async getEventsForDate(date: string): Promise<CalendarEvent[]> {
    try {
      // This would normally query the calendar directly
      // For now, we'll return schedule items that match the date
      const scheduleItems = await this.scheduleStorage.getAllSchedules(); // This should be filtered by date
      // Convert to calendar events if needed
      return scheduleItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        startDate: new Date(item.startUtc),
        endDate: new Date(item.endUtc),
        allDay: item.allDay,
        calendarId: item.calendarId,
        location: item.location || '',
        attendees: item.attendees || [],
        recurrence: item.recurrence,
      }));
    } catch (error) {
      console.error('Error getting events for date:', error);
      return [];
    }
  }
}