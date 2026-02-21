import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  scheduleId: string;
  scheduledAt: string;
}

export class NotificationService {
  private notificationKey = 'scheduledNotifications';

  constructor() {
    this.configurePushNotifications();
  }

  private configurePushNotifications() {
    PushNotification.configure({
      onNotification: function (notification: any) {
        console.log('NOTIFICATION:', notification);
      },
      
      onRegister: function (token: any) {
        console.log('TOKEN:', token);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  // Schedule a notification for a schedule item
  async scheduleNotification(
    scheduleId: string,
    title: string,
    message: string,
    date: string,
    time: string
  ): Promise<string> {
    try {
      const notificationId = this.generateId();
      const notificationData: NotificationData = {
        id: notificationId,
        title,
        message,
        date,
        time,
        scheduleId,
        scheduledAt: new Date().toISOString(),
      };

      // Save notification to AsyncStorage
      const existingNotifications = await this.getAllNotifications();
      existingNotifications.push(notificationData);
      await AsyncStorage.setItem(this.notificationKey, JSON.stringify(existingNotifications));

      // Schedule the notification using react-native-push-notification
      PushNotification.localNotificationSchedule({
        id: notificationData.id,
        title: title,
        message: message,
        date: this.getNotificationDate(date, time),
        allowWhileIdle: true,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Cancel a notification by ID
  async cancelNotification(id: string): Promise<void> {
    try {
      PushNotification.cancelLocalNotifications({ id: id });
      
      // Remove from storage
      const existingNotifications = await this.getAllNotifications();
      const filteredNotifications = existingNotifications.filter(
        (notification: NotificationData) => notification.id !== id
      );
      await AsyncStorage.setItem(this.notificationKey, JSON.stringify(filteredNotifications));
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all notifications for a specific schedule item
  async cancelNotificationsForSchedule(scheduleId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const notificationsToCancel = notifications.filter(
        (notification: NotificationData) => notification.scheduleId === scheduleId
      );

      for (const notification of notificationsToCancel) {
        await this.cancelNotification(notification.id);
      }
    } catch (error) {
      console.error('Error canceling notifications for schedule:', error);
    }
  }

  // Get all scheduled notifications
  async getAllNotifications(): Promise<NotificationData[]> {
    try {
      const data = await AsyncStorage.getItem(this.notificationKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Get notifications for a specific date
  async getNotificationsForDate(date: string): Promise<NotificationData[]> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter((notification: NotificationData) => notification.date === date);
    } catch (error) {
      console.error('Error getting notifications for date:', error);
      return [];
    }
  }

  // Update a notification (for when schedule items are updated)
  async updateNotification(
    id: string,
    updates: Partial<NotificationData>
  ): Promise<void> {
    try {
      const existingNotifications = await this.getAllNotifications();
      const notificationIndex = existingNotifications.findIndex(
        (notification: NotificationData) => notification.id === id
      );

      if (notificationIndex >= 0) {
        const updatedNotification = {
          ...existingNotifications[notificationIndex],
          ...updates,
        };

        // Cancel the old notification
        await this.cancelNotification(id);

        // Schedule the new notification
        if (updates.date || updates.time) {
          const scheduleDate = updates.date || existingNotifications[notificationIndex].date;
          const scheduleTime = updates.time || existingNotifications[notificationIndex].time;
          
          PushNotification.localNotificationSchedule({
            id: updatedNotification.id,
            title: updatedNotification.title,
            message: updatedNotification.message,
            date: this.getNotificationDate(scheduleDate, scheduleTime),
            allowWhileIdle: true,
          });
        }

        existingNotifications[notificationIndex] = updatedNotification;
        await AsyncStorage.setItem(this.notificationKey, JSON.stringify(existingNotifications));
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  }

  // Generate a unique ID for notifications
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Helper to convert date and time to Date object for notification scheduling
  private getNotificationDate(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    const notificationDate = new Date(year, month - 1, day, hours, minutes);
    return notificationDate;
  }

  // Initialize notifications on app startup
  async initializeNotifications(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      for (const notification of notifications) {
        // Only schedule notifications that are not in the past
        const notificationDate = this.getNotificationDate(notification.date, notification.time);
        if (notificationDate > new Date()) {
          PushNotification.localNotificationSchedule({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            date: notificationDate,
            allowWhileIdle: true,
          });
        }
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }
}