import { ScheduleService } from './scheduleService';
import { NotificationService } from './notificationService';
import { ScheduleItem } from '../types/schedule';
import { RecurrenceUtils } from '../utils/recurrenceUtils';

export class NotificationManager {
  private scheduleService: ScheduleService | null = null;
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // Lazy initialization of scheduleService to avoid circular dependency
  private getScheduleService(): ScheduleService {
    if (!this.scheduleService) {
      this.scheduleService = new ScheduleService();
    }
    return this.scheduleService;
  }

  // Initialize the notification manager
  async initialize(): Promise<void> {
    await this.notificationService.initializeNotifications();
  }

  // Handle creation of schedule items with reminders
  async handleScheduleItemCreated(item: ScheduleItem): Promise<void> {
    try {
      if (item.reminder && item.reminder.enabled && item.startUtc) {
        // For recurring items, we need to schedule notifications for each occurrence
        if (item.recurrence) {
          await this.scheduleNotificationsForRecurringItem(item);
        } else {
          await this.scheduleNotificationForItem(item);
        }
      }
    } catch (error) {
      console.error('Error handling schedule item creation:', error);
    }
  }

  // Handle updates to schedule items
  async handleScheduleItemUpdated(
    id: string,
    updates: Partial<ScheduleItem>
  ): Promise<void> {
    try {
      // Get the current item
      const currentItem = await this.getScheduleService().getScheduleItemById(id);
      if (!currentItem) return;

      // Check if reminder settings have changed
      if (updates.reminder !== undefined) {
        // If reminder was disabled, cancel the notification
        if (!updates.reminder?.enabled) {
          await this.cancelNotificationsForItem(id);
        } 
        // If reminder was enabled or updated, schedule new notification
        else if (updates.reminder?.enabled && currentItem.startUtc) {
          if (currentItem.recurrence) {
            await this.scheduleNotificationsForRecurringItem(currentItem);
          } else {
            await this.scheduleNotificationForItem(currentItem);
          }
        }
      }
      // If reminder settings weren't changed but the date/time changed
      else if (updates.startUtc !== undefined) {
        if (currentItem.reminder?.enabled && currentItem.startUtc) {
          if (currentItem.recurrence) {
            await this.scheduleNotificationsForRecurringItem(currentItem);
          } else {
            await this.updateNotificationForItem(id, updates);
          }
        }
      }
    } catch (error) {
      console.error('Error handling schedule item update:', error);
    }
  }

  // Handle deletion of schedule items
  async handleScheduleItemDeleted(id: string): Promise<void> {
    try {
      await this.cancelNotificationsForItem(id);
    } catch (error) {
      console.error('Error handling schedule item deletion:', error);
    }
  }

  // Schedule notification for a schedule item
  private async scheduleNotificationForItem(item: ScheduleItem): Promise<void> {
    try {
      if (item.reminder && item.reminder.enabled && item.startUtc) {
        await this.notificationService.scheduleNotification(
          item.id,
          item.title,
          item.description || 'Schedule reminder',
          item.startUtc,
          item.startUtc
        );
      }
    } catch (error) {
      console.error('Error scheduling notification for item:', item.id, error);
    }
  }

  // Schedule notifications for all occurrences of a recurring item
  private async scheduleNotificationsForRecurringItem(item: ScheduleItem): Promise<void> {
    try {
      if (item.reminder && item.reminder.enabled && item.startUtc) {
        // Generate occurrences for a reasonable period
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 365); // 1 year
        
        const occurrences = RecurrenceUtils.getOccurrencesForDateRange(
          item,
          startDate,
          endDate
        );
        
        // Schedule notification for each occurrence
        for (const occurrence of occurrences) {
          if (occurrence.startUtc) {
            await this.notificationService.scheduleNotification(
              `${item.id}_${occurrence.startUtc}`,
              item.title,
              item.description || 'Schedule reminder',
              occurrence.startUtc,
              occurrence.startUtc
            );
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling notifications for recurring item:', item.id, error);
    }
  }

  // Cancel all notifications for a schedule item
  private async cancelNotificationsForItem(scheduleId: string): Promise<void> {
    try {
      await this.notificationService.cancelNotificationsForSchedule(scheduleId);
    } catch (error) {
      console.error('Error cancelling notifications for schedule item:', scheduleId, error);
    }
  }

  // Update notification for a schedule item when date/time changes
  private async updateNotificationForItem(
    id: string,
    updates: Partial<ScheduleItem>
  ): Promise<void> {
    try {
      // Get all notifications for this schedule item
      const notifications = await this.notificationService.getAllNotifications();
      const notificationToUpdate = notifications.find(
        (notification) => notification.scheduleId === id
      );

      if (notificationToUpdate && updates.startUtc) {
        const updatedNotificationData = {
          date: updates.startUtc,
          time: updates.startUtc,
        };
        await this.notificationService.updateNotification(
          notificationToUpdate.id,
          updatedNotificationData
        );
      }
    } catch (error) {
      console.error('Error updating notification for item:', id, error);
    }
  }
}