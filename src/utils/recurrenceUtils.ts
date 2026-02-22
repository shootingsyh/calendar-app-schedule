import { RRule } from 'rrule';
import { ScheduleItem } from '../types/schedule';

export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  count?: number;
  until?: string; // ISO date string
  byDay?: string[]; // e.g., ['MO', 'WE', 'FR']
  byMonth?: number[]; // e.g., [1, 6, 12]
  byMonthDay?: number[]; // e.g., [1, 15]
}

export interface RecurrencePattern {
  rule: RecurrenceRule;
  originalDate: string; // The original start date of the recurring event
  originalTime?: string; // The original time of the recurring event
}

export class RecurrenceUtils {
  /**
   * Generate all occurrences for a recurring schedule within a date range
   */
  static getOccurrencesForDateRange(
    scheduleItem: ScheduleItem & { recurrence?: RecurrencePattern },
    startDate: Date,
    endDate: Date
  ): ScheduleItem[] {
    // If no recurrence pattern, return the original schedule item
    if (!scheduleItem.recurrence) {
      return [scheduleItem];
    }

    const { recurrence, startUtc } = scheduleItem;
    const occurrences: ScheduleItem[] = [];

    try {
      // Parse the recurrence rule
      const rule = recurrence.rule;
      const rruleOptions: any = {
        freq: this.getRRuleFrequency(rule.frequency),
        interval: rule.interval || 1,
      };

      if (rule.count) {
        rruleOptions.count = rule.count;
      }
      
      if (rule.until) {
        rruleOptions.until = new Date(rule.until);
      }

      if (rule.byDay) {
        rruleOptions.byweekday = rule.byDay.map(day => this.getRRuleDay(day));
      }

      if (rule.byMonth) {
        rruleOptions.bymonth = rule.byMonth;
      }

      if (rule.byMonthDay) {
        rruleOptions.bymonthday = rule.byMonthDay;
      }

      // Create the rule
      const rrule = new RRule(rruleOptions);

      // Generate occurrences within the date range
      const start = new Date(startDate);
      const end = new Date(endDate);

      // We'll generate a reasonable number of occurrences to check
      const maxOccurrences = 1000; // Prevent infinite loops
      let generatedCount = 0;
      
      // Create a set to avoid duplicates
      const generatedDates = new Set<string>();
      
      // Generate occurrences
      for (let i = 0; i < maxOccurrences; i++) {
        const occurrence = rrule.after(start, true);
        if (!occurrence || occurrence > end) break;
        
        // Convert date to YYYY-MM-DD format
        const dateStr = occurrence.toISOString().split('T')[0];
        
        // Only add if it's within our range and not already added
        if (!generatedDates.has(dateStr)) {
          generatedDates.add(dateStr);
          // Create a new schedule item for this occurrence
          const occurrenceItem: ScheduleItem = {
            ...scheduleItem,
            id: `${scheduleItem.id}_${occurrence.toISOString()}`,
            startUtc: occurrence.toISOString(),
            isRecurringOccurrence: true
          };
          occurrences.push(occurrenceItem);
        }
        
        start.setDate(start.getDate() + 1);
        generatedCount++;
        
        // Safety break
        if (generatedCount >= maxOccurrences) break;
      }
    } catch (error) {
      console.error('Error generating recurrence occurrences:', scheduleItem.id, error);
      // Return empty array to prevent crashes
      return [];
    }

    // Sort by date
    occurrences.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    
    return occurrences;
  }

  /**
   * Get the RRule frequency constant from our custom frequency
   */
  private static getRRuleFrequency(frequency: string): any {
    switch (frequency) {
      case 'DAILY': return RRule.DAILY;
      case 'WEEKLY': return RRule.WEEKLY;
      case 'MONTHLY': return RRule.MONTHLY;
      case 'YEARLY': return RRule.YEARLY;
      default: return RRule.DAILY;
    }
  }

  /**
   * Get the RRule day constant from our custom day string
   */
  private static getRRuleDay(day: string): any {
    switch (day) {
      case 'MO': return RRule.MO;
      case 'TU': return RRule.TU;
      case 'WE': return RRule.WE;
      case 'TH': return RRule.TH;
      case 'FR': return RRule.FR;
      case 'SA': return RRule.SA;
      case 'SU': return RRule.SU;
      default: return RRule.MO;
    }
  }

  /**
   * Convert a recurrence rule to a human-readable string
   */
  static getRecurrenceDescription(rule: RecurrenceRule): string {
    const { frequency, interval = 1, count, until, byDay, byMonth, byMonthDay } = rule;
    
    let description = '';
    
    // Frequency
    switch (frequency) {
      case 'DAILY':
        description += interval > 1 ? `Every ${interval} days` : 'Daily';
        break;
      case 'WEEKLY':
        description += interval > 1 ? `Every ${interval} weeks` : 'Weekly';
        break;
      case 'MONTHLY':
        description += interval > 1 ? `Every ${interval} months` : 'Monthly';
        break;
      case 'YEARLY':
        description += interval > 1 ? `Every ${interval} years` : 'Yearly';
        break;
    }
    
    // Days of week if specified
    if (byDay && byDay.length > 0) {
      const days = byDay.map(day => {
        switch (day) {
          case 'MO': return 'Monday';
          case 'TU': return 'Tuesday';
          case 'WE': return 'Wednesday';
          case 'TH': return 'Thursday';
          case 'FR': return 'Friday';
          case 'SA': return 'Saturday';
          case 'SU': return 'Sunday';
          default: return day;
        }
      });
      description += ` on ${days.join(', ')}`;
    }
    
    // Month days if specified
    if (byMonthDay && byMonthDay.length > 0) {
      description += ` on day(s) ${byMonthDay.join(', ')}`;
    }
    
    // Count or until
    if (count) {
      description += ` for ${count} times`;
    } else if (until) {
      description += ` until ${new Date(until).toLocaleDateString()}`;
    }
    
    return description;
  }
}