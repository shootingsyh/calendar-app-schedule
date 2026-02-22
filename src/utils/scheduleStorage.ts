import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduleItem } from '../types/schedule';
import { RecurrenceUtils } from '../utils/recurrenceUtils';

export class ScheduleStorage {
  private readonly SCHEDULES_KEY = '@schedules';

  async saveSchedule(schedule: ScheduleItem): Promise<void> {
    try {
      const schedules = await this.getAllSchedules();
      const existingIndex = schedules.findIndex(s => s.id === schedule.id);
      
      if (existingIndex >= 0) {
        schedules[existingIndex] = schedule;
      } else {
        schedules.push(schedule);
      }
      
      await AsyncStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  async getAllSchedules(): Promise<ScheduleItem[]> {
    try {
      const schedulesJson = await AsyncStorage.getItem(this.SCHEDULES_KEY);
      return schedulesJson ? JSON.parse(schedulesJson) : [];
    } catch (error) {
      console.error('Error loading schedules:', error);
      return [];
    }
  }

  async getScheduleById(id: string): Promise<ScheduleItem | null> {
    try {
      const schedules = await this.getAllSchedules();
      return schedules.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Error finding schedule:', error);
      return null;
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      const schedules = await this.getAllSchedules();
      const filteredSchedules = schedules.filter(s => s.id !== id);
      await AsyncStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(filteredSchedules));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  async getSchedulesForDate(date: Date): Promise<ScheduleItem[]> {
    try {
      const schedules = await this.getAllSchedules();
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      return schedules.filter(schedule => {
        // For non-recurring schedules, check exact date match
        if (!schedule.recurrence) {
          const scheduleDate = new Date(schedule.startUtc);
          const scheduleDateString = scheduleDate.toISOString().split('T')[0];
          return scheduleDateString === dateString;
        }
        
        // For recurring schedules, check if the date falls within occurrence
        try {
          const occurrences = RecurrenceUtils.getOccurrencesForDateRange(
            schedule,
            new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
          );
          
          return occurrences.length > 0;
        } catch (recurrenceError) {
          console.error('Error processing recurrence for schedule:', schedule.id, recurrenceError);
          // If recurrence processing fails, fallback to basic check
          const scheduleDate = new Date(schedule.startUtc);
          const scheduleDateString = scheduleDate.toISOString().split('T')[0];
          return scheduleDateString === dateString;
        }
      });
    } catch (error) {
      console.error('Error getting schedules for date:', error);
      return [];
    }
  }
}