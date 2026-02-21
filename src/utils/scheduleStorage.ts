import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduleItem } from '../types/schedule';
import { RecurrenceUtils } from '../utils/recurrenceUtils';

export class ScheduleStorage {
  private static readonly SCHEDULES_KEY = '@schedules';

  static async saveSchedule(schedule: ScheduleItem): Promise<void> {
    try {
      const schedules = await ScheduleStorage.getAllSchedules();
      const existingIndex = schedules.findIndex(s => s.id === schedule.id);
      
      if (existingIndex >= 0) {
        schedules[existingIndex] = schedule;
      } else {
        schedules.push(schedule);
      }
      
      await AsyncStorage.setItem(ScheduleStorage.SCHEDULES_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  static async getAllSchedules(): Promise<ScheduleItem[]> {
    try {
      const schedulesJson = await AsyncStorage.getItem(ScheduleStorage.SCHEDULES_KEY);
      return schedulesJson ? JSON.parse(schedulesJson) : [];
    } catch (error) {
      console.error('Error loading schedules:', error);
      return [];
    }
  }

  static async getScheduleById(id: string): Promise<ScheduleItem | null> {
    try {
      const schedules = await ScheduleStorage.getAllSchedules();
      return schedules.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Error finding schedule:', error);
      return null;
    }
  }

  static async deleteSchedule(id: string): Promise<void> {
    try {
      const schedules = await ScheduleStorage.getAllSchedules();
      const filteredSchedules = schedules.filter(s => s.id !== id);
      await AsyncStorage.setItem(ScheduleStorage.SCHEDULES_KEY, JSON.stringify(filteredSchedules));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  static async getSchedulesForDate(date: Date): Promise<ScheduleItem[]> {
    try {
      const schedules = await ScheduleStorage.getAllSchedules();
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      return schedules.filter(schedule => {
        // For non-recurring schedules, check exact date match
        if (!schedule.recurrence) {
          const scheduleDate = new Date(schedule.startUtc);
          const scheduleDateString = scheduleDate.toISOString().split('T')[0];
          return scheduleDateString === dateString;
        }
        
        // For recurring schedules, check if the date falls within occurrence
        const occurrences = RecurrenceUtils.getOccurrencesForDateRange(
          schedule,
          new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
          new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
        );
        
        return occurrences.length > 0;
      });
    } catch (error) {
      console.error('Error getting schedules for date:', error);
      return [];
    }
  }
}