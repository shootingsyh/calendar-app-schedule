import { RecurrenceUtils } from '../src/utils/recurrenceUtils';
import { ScheduleItem } from '../src/types/schedule';

describe('RecurrenceUtils', () => {
  it('should generate occurrences for daily recurrence', () => {
    const scheduleItem: ScheduleItem & { recurrence?: any } = {
      id: 'test1',
      title: 'Test Event',
      date: '2023-12-25',
      time: '10:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recurrence: {
        rule: {
          frequency: 'DAILY',
          interval: 1,
        },
        originalDate: '2023-12-25',
        originalTime: '10:00'
      }
    };

    const occurrences = RecurrenceUtils.generateOccurrences(
      scheduleItem,
      '2023-12-25',
      '2023-12-27'
    );

    expect(occurrences.length).toBeGreaterThan(0);
    expect(occurrences[0].date).toBe('2023-12-25');
  });

  it('should generate occurrences for weekly recurrence', () => {
    const scheduleItem: ScheduleItem & { recurrence?: any } = {
      id: 'test2',
      title: 'Weekly Event',
      date: '2023-12-25',
      time: '10:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recurrence: {
        rule: {
          frequency: 'WEEKLY',
          interval: 1,
          byDay: ['MO', 'FR']
        },
        originalDate: '2023-12-25',
        originalTime: '10:00'
      }
    };

    const occurrences = RecurrenceUtils.generateOccurrences(
      scheduleItem,
      '2023-12-25',
      '2024-01-01'
    );

    expect(occurrences.length).toBeGreaterThan(0);
  });

  it('should return original date for non-recurring items', () => {
    const scheduleItem: ScheduleItem = {
      id: 'test3',
      title: 'Non-recurring Event',
      date: '2023-12-25',
      time: '10:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const occurrences = RecurrenceUtils.generateOccurrences(
      scheduleItem,
      '2023-12-25',
      '2023-12-25'
    );

    expect(occurrences.length).toBe(1);
    expect(occurrences[0].date).toBe('2023-12-25');
  });

  it('should get recurrence description', () => {
    const rule = {
      frequency: 'WEEKLY' as 'WEEKLY',
      interval: 2,
      byDay: ['MO', 'FR']
    };

    const description = RecurrenceUtils.getRecurrenceDescription(rule);
    expect(description).toContain('Every 2 weeks');
    expect(description).toContain('Monday');
    expect(description).toContain('Friday');
  });
});