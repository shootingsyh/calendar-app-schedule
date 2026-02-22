import { ScheduleItem } from '../types/schedule';
import { ScheduleStorage } from '../utils/scheduleStorage';
import { NotificationManager } from './notificationManager';

export class ScheduleService {
  private storage: ScheduleStorage;
  private notificationManager: NotificationManager;

  constructor() {
    this.storage = new ScheduleStorage();
    this.notificationManager = new NotificationManager();
  }

  // Create a new schedule item
  async createScheduleItem(item: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduleItem> {
    const newItem: ScheduleItem = {
      id: this.generateId(),
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveSchedule(newItem);
    
    // Handle notifications for the new schedule item
    await this.notificationManager.handleScheduleItemCreated(newItem);
    
    return newItem;
  }

  // Get all schedule items
  async getAllScheduleItems(): Promise<ScheduleItem[]> {
    return await this.storage.getAllSchedules();
  }

  // Get schedule items for a specific date (including recurring items)
  async getScheduleItemsForDate(date: Date): Promise<ScheduleItem[]> {
    return await this.storage.getSchedulesForDate(date);
  }

  // Get a specific schedule item by ID
  async getScheduleItemById(id: string): Promise<ScheduleItem | null> {
    return await this.storage.getScheduleById(id);
  }

  // Update a schedule item
  async updateScheduleItem(id: string, updates: Partial<ScheduleItem>): Promise<void> {
    await this.storage.saveSchedule({ id, ...updates } as ScheduleItem);
    
    // Handle notifications for updated schedule item
    await this.notificationManager.handleScheduleItemUpdated(id, updates);
  }

  // Delete a schedule item
  async deleteScheduleItem(id: string): Promise<void> {
    await this.storage.deleteSchedule(id);
    
    // Handle notifications for deleted schedule item
    await this.notificationManager.handleScheduleItemDeleted(id);
  }

  // Generate a unique ID for schedule items
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}