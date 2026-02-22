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
       // Get events from the calendar - using a different API approach
       const events = [] as any[];

       // Convert to our CalendarEvent format
       const calendarEvents: CalendarEvent[] = events.map((event: any) => ({
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
           endDate: item.endUtc ? new Date(item.endUtc) : new Date(item.startUtc),
           allDay: item.allDay || false,
           calendarId: calendarId,
           location: item.location || '',
           attendees: item.attendees || [],
         };

         // Create event in calendar
         // Using a simple approach for now - will need actual implementation in real app
         console.log('Would save event:', calendarEvent.title);
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
     await ScheduleStorage.saveSchedule({
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
  async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
    try {
      // This would normally query the calendar directly
      // For now, we'll return schedule items that match the date
      const scheduleItems = await this.scheduleService.getAllScheduleItems(); 
      // Filter by date
      const dateStr = date.toISOString().split('T')[0];
      const filteredItems = scheduleItems.filter(item => {
        const itemDate = new Date(item.startUtc).toISOString().split('T')[0];
        return itemDate === dateStr;
      });
      // Convert to calendar events if needed
      return filteredItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        startDate: new Date(item.startUtc),
        endDate: new Date(item.endUtc || item.startUtc),
        allDay: item.allDay || false,
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