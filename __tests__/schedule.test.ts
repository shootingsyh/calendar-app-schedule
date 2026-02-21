import { ScheduleItem } from '../src/types/schedule';
import { ScheduleStorage } from '../src/utils/scheduleStorage';
import { ScheduleService } from '../src/services/scheduleService';

// Simple test to verify TypeScript compilation works
describe('Schedule Management', () => {
  it('should create a schedule item', () => {
    const service = new ScheduleService();
    const item: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Test Event',
      description: 'A test event',
      date: '2023-12-25',
      time: '10:00',
      isAllDay: false,
    };

    const createdItem = service.createScheduleItem(item);
    expect(createdItem.id).toBeDefined();
    expect(createdItem.title).toBe('Test Event');
  });
});