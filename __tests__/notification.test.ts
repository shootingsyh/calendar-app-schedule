import { NotificationService } from '../src/services/notificationService';

// Simple test to verify TypeScript compilation works
describe('Notification Service', () => {
  it('should initialize without errors', () => {
    const service = new NotificationService();
    expect(service).toBeDefined();
  });
});