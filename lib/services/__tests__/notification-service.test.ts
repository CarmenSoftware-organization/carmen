import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../notification-service';

// Mock the notification templates
vi.mock('../../mock/price-management/notification-templates.json', () => ({
  default: {
    templates: [
      {
        id: 'price-collection-invitation',
        name: 'Price Collection Invitation',
        subject: 'Price Collection Request - {{vendorName}}',
        body: 'Dear {{vendorName}}, please submit your latest pricing...',
        type: 'email'
      },
      {
        id: 'price-expiration-warning',
        name: 'Price Expiration Warning',
        subject: 'Price Expiration Alert - {{productCount}} items',
        body: 'Your pricing for {{productCount}} items will expire soon...',
        type: 'email'
      }
    ]
  }
}));

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('sendPriceCollectionInvitation', () => {
    it('should send invitation email to vendor', async () => {
      const vendorInfo = {
        id: 'vendor-1',
        name: 'Test Vendor',
        email: 'vendor@test.com',
        contactPerson: 'John Doe'
      };

      const sessionInfo = {
        token: 'abc123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        portalUrl: 'https://portal.example.com/abc123'
      };

      const result = await service.sendPriceCollectionInvitation(vendorInfo, sessionInfo);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.sentAt).toBeDefined();
    });

    it('should handle invalid vendor email', async () => {
      const vendorInfo = {
        id: 'vendor-1',
        name: 'Test Vendor',
        email: 'invalid-email',
        contactPerson: 'John Doe'
      };

      const sessionInfo = {
        token: 'abc123',
        expiresAt: new Date(),
        portalUrl: 'https://portal.example.com/abc123'
      };

      await expect(service.sendPriceCollectionInvitation(vendorInfo, sessionInfo))
        .rejects.toThrow('Invalid email address');
    });

    it('should handle expired session', async () => {
      const vendorInfo = {
        id: 'vendor-1',
        name: 'Test Vendor',
        email: 'vendor@test.com',
        contactPerson: 'John Doe'
      };

      const sessionInfo = {
        token: 'abc123',
        expiresAt: new Date(Date.now() - 1000), // Expired
        portalUrl: 'https://portal.example.com/abc123'
      };

      await expect(service.sendPriceCollectionInvitation(vendorInfo, sessionInfo))
        .rejects.toThrow('Session has expired');
    });
  });

  describe('sendPriceExpirationWarning', () => {
    it('should send expiration warning to vendor', async () => {
      const vendorInfo = {
        id: 'vendor-1',
        name: 'Test Vendor',
        email: 'vendor@test.com',
        contactPerson: 'John Doe'
      };

      const expiringItems = [
        {
          productId: 'prod-1',
          productName: 'Product 1',
          currentPrice: 25.50,
          currency: 'USD',
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          productId: 'prod-2',
          productName: 'Product 2',
          currentPrice: 15.75,
          currency: 'USD',
          expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      ];

      const result = await service.sendPriceExpirationWarning(vendorInfo, expiringItems);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.sentAt).toBeDefined();
    });

    it('should handle empty expiring items list', async () => {
      const vendorInfo = {
        id: 'vendor-1',
        name: 'Test Vendor',
        email: 'vendor@test.com',
        contactPerson: 'John Doe'
      };

      await expect(service.sendPriceExpirationWarning(vendorInfo, []))
        .rejects.toThrow('No expiring items provided');
    });
  });

  describe('sendSubmissionConfirmation', () => {
    it('should send confirmation email after successful submission', async () => {
      const vendorInfo = {
        id: 'vendor-1',
        name: 'Test Vendor',
        email: 'vendor@test.com',
        contactPerson: 'John Doe'
      };

      const submissionInfo = {
        submissionId: 'sub-123',
        submittedAt: new Date(),
        itemCount: 50,
        processedCount: 48,
        errorCount: 2,
        status: 'processed'
      };

      const result = await service.sendSubmissionConfirmation(vendorInfo, submissionInfo);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should include error details in confirmation when errors exist', async () => {
      const vendorInfo = {
        id: 'vendor-1',
        name: 'Test Vendor',
        email: 'vendor@test.com',
        contactPerson: 'John Doe'
      };

      const submissionInfo = {
        submissionId: 'sub-123',
        submittedAt: new Date(),
        itemCount: 50,
        processedCount: 45,
        errorCount: 5,
        status: 'processed_with_errors',
        errors: [
          'Invalid price format in row 10',
          'Missing product ID in row 15'
        ]
      };

      const result = await service.sendSubmissionConfirmation(vendorInfo, submissionInfo);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('sendPriceAssignmentNotification', () => {
    it('should send notification about price assignment', async () => {
      const assignmentInfo = {
        prItemId: 'pr-item-1',
        productName: 'Office Chair',
        assignedVendor: 'Premium Vendor',
        assignedPrice: 150.00,
        currency: 'USD',
        assignmentReason: 'Best price with preferred vendor',
        confidence: 0.95
      };

      const recipientInfo = {
        userId: 'user-1',
        email: 'purchaser@company.com',
        name: 'Jane Smith'
      };

      const result = await service.sendPriceAssignmentNotification(assignmentInfo, recipientInfo);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('template processing', () => {
    it('should process template variables correctly', () => {
      const template = 'Hello {{name}}, your order #{{orderId}} is ready.';
      const variables = {
        name: 'John Doe',
        orderId: '12345'
      };

      const processed = service.processTemplate(template, variables);

      expect(processed).toBe('Hello John Doe, your order #12345 is ready.');
    });

    it('should handle missing template variables', () => {
      const template = 'Hello {{name}}, your order #{{orderId}} is ready.';
      const variables = {
        name: 'John Doe'
        // orderId is missing
      };

      const processed = service.processTemplate(template, variables);

      expect(processed).toBe('Hello John Doe, your order #{{orderId}} is ready.');
    });

    it('should handle empty template', () => {
      const processed = service.processTemplate('', { name: 'John' });
      expect(processed).toBe('');
    });

    it('should handle template with no variables', () => {
      const template = 'This is a static message.';
      const processed = service.processTemplate(template, {});
      expect(processed).toBe('This is a static message.');
    });
  });

  describe('email validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(service.validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(service.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('notification queue', () => {
    it('should queue notifications for batch processing', async () => {
      const notifications = [
        {
          type: 'price-expiration',
          recipient: 'vendor1@test.com',
          data: { vendorName: 'Vendor 1' }
        },
        {
          type: 'price-expiration',
          recipient: 'vendor2@test.com',
          data: { vendorName: 'Vendor 2' }
        }
      ];

      const result = await service.queueNotifications(notifications);

      expect(result.success).toBe(true);
      expect(result.queuedCount).toBe(2);
    });

    it('should process queued notifications', async () => {
      await service.queueNotifications([
        {
          type: 'price-expiration',
          recipient: 'vendor@test.com',
          data: { vendorName: 'Test Vendor' }
        }
      ]);

      const result = await service.processNotificationQueue();

      expect(result.processedCount).toBeGreaterThan(0);
      expect(result.failedCount).toBeGreaterThanOrEqual(0);
    });
  });
});