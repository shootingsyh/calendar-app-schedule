import { ScheduleService } from './scheduleService';
import { NotificationService } from './notificationService';
import { ScheduleItem } from '../types/schedule';
import { RecurrenceUtils } from '../utils/recurrenceUtils';

export class NotificationManager {
  private scheduleService: ScheduleService;
  private notificationService: NotificationService;

  constructor() {
    this.scheduleService = new ScheduleService();
    this.notificationService = new NotificationService();
  }

  // Initialize the notification manager
  async initialize(): Promise<void> {
    await this.notificationService.initializeNotifications();
  }

  // Handle creation of schedule items with reminders
  async handleScheduleItemCreated(item: ScheduleItem): Promise<void> {
    if (item.reminder && item.reminder.enabled && item.startUtc) {
      // For recurring items, we need to schedule notifications for each occurrence
      if (item.recurrence) {
        await this.scheduleNotificationsForRecurringItem(item);
      } else {
        await this.scheduleNotificationForItem(item);
      }
    }
  }

  // Handle updates to schedule items
  async handleScheduleItemUpdated(
    id: string,
    updates: Partial<ScheduleItem>
  ): Promise<void> {
    // Get the current item
    const currentItem = await this.scheduleService.getScheduleItemById(id);
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
  }

  // Handle deletion of schedule items
  async handleScheduleItemDeleted(id: string): Promise<void> {
    await this.cancelNotificationsForItem(id);
  }

  // Schedule notification for a schedule item
  private async scheduleNotificationForItem(item: ScheduleItem): Promise<void> {
    if (item.reminder && item.reminder.enabled && item.startUtc) {
      await this.notificationService.scheduleNotification(
        item.id,
        item.title,
        item.description || 'Schedule reminder',
        item.startUtc
      );
    }
  }

  // Schedule notifications for all occurrences of a recurring item
  private async scheduleNotificationsForRecurringItem(item: ScheduleItem): Promise<void> {
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
            occurrence.startUtc
          );
        }
      }
    }
  }

  // Cancel all notifications for a schedule item
  private async cancelNotificationsForItem(scheduleId: string): Promise<void> {
    try {
      await this.notificationService.cancelNotificationsForSchedule(scheduleId);
    } catch (error) {
      console.error('Error cancelling notifications for schedule item:', error);
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

      if (notificationToUpdate) {
        const updatedNotificationData = {
          date: updates.startUtc || notificationToUpdate.date,
          time: updates.startUtc || notificationToUpdate.time,
        };
        await this.notificationService.updateNotification(
          notificationToUpdate.id,
          updatedNotificationData
        );
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  }
}