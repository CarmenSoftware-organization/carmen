export interface EmailNotification {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent: string;
  textContent: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'confirmation' | 'error' | 'warning' | 'reminder';
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
}

export interface NotificationContext {
  vendorName: string;
  vendorEmail: string;
  templateName?: string;
  submissionId?: string;
  processingResults?: any;
  validationResults?: any;
  errors?: any[];
  warnings?: any[];
  supportEmail?: string;
  supportPhone?: string;
}

export class NotificationService {
  private templates: Map<string, NotificationTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Confirmation email template
    this.templates.set('price_submission_confirmation', {
      id: 'price_submission_confirmation',
      name: 'Price Submission Confirmation',
      type: 'confirmation',
      subject: 'Price Submission Confirmation - {{vendorName}}',
      htmlTemplate: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c5aa0;">Price Submission Confirmation</h2>
              
              <p>Dear {{vendorName}},</p>
              
              <p>We have successfully received and processed your price submission.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #28a745;">Submission Details</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>Submission ID:</strong> {{submissionId}}</li>
                  <li><strong>Template:</strong> {{templateName}}</li>
                  <li><strong>Items Processed:</strong> {{itemsProcessed}}</li>
                  <li><strong>Items Created:</strong> {{itemsCreated}}</li>
                  <li><strong>Items Updated:</strong> {{itemsUpdated}}</li>
                  <li><strong>Processing Date:</strong> {{processingDate}}</li>
                </ul>
              </div>
              
              {{#if warnings}}
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h4 style="margin-top: 0; color: #856404;">Warnings</h4>
                <p>Your submission was processed successfully, but please note the following warnings:</p>
                <ul>
                  {{#each warnings}}
                  <li>Row {{row}}: {{message}}</li>
                  {{/each}}
                </ul>
              </div>
              {{/if}}
              
              <p>Your pricing information is now active in our system and will be used for purchase request assignments.</p>
              
              <p>If you have any questions, please contact our support team:</p>
              <ul>
                <li>Email: {{supportEmail}}</li>
                <li>Phone: {{supportPhone}}</li>
              </ul>
              
              <p>Thank you for your continued partnership.</p>
              
              <p>Best regards,<br>
              Carmen Supply Chain Management Team</p>
            </div>
          </body>
        </html>
      `,
      textTemplate: `
Price Submission Confirmation - {{vendorName}}

Dear {{vendorName}},

We have successfully received and processed your price submission.

Submission Details:
- Submission ID: {{submissionId}}
- Template: {{templateName}}
- Items Processed: {{itemsProcessed}}
- Items Created: {{itemsCreated}}
- Items Updated: {{itemsUpdated}}
- Processing Date: {{processingDate}}

{{#if warnings}}
Warnings:
{{#each warnings}}
- Row {{row}}: {{message}}
{{/each}}
{{/if}}

Your pricing information is now active in our system and will be used for purchase request assignments.

If you have any questions, please contact our support team:
- Email: {{supportEmail}}
- Phone: {{supportPhone}}

Thank you for your continued partnership.

Best regards,
Carmen Supply Chain Management Team
      `
    });

    // Error notification template
    this.templates.set('price_submission_error', {
      id: 'price_submission_error',
      name: 'Price Submission Error',
      type: 'error',
      subject: 'Price Submission Error - {{vendorName}}',
      htmlTemplate: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #dc3545;">Price Submission Error</h2>
              
              <p>Dear {{vendorName}},</p>
              
              <p>We encountered errors while processing your price submission and were unable to import your pricing data.</p>
              
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h3 style="margin-top: 0; color: #721c24;">Submission Details</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>Submission ID:</strong> {{submissionId}}</li>
                  <li><strong>Template:</strong> {{templateName}}</li>
                  <li><strong>Processing Date:</strong> {{processingDate}}</li>
                  <li><strong>Status:</strong> Failed</li>
                </ul>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #dc3545;">Errors Found</h4>
                <ul>
                  {{#each errors}}
                  <li><strong>Row {{row}}, Field {{field}}:</strong> {{message}}</li>
                  {{/each}}
                </ul>
              </div>
              
              <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                <h4 style="margin-top: 0; color: #0c5460;">Next Steps</h4>
                <ol>
                  <li>Review and correct the errors listed above in your Excel file</li>
                  <li>Ensure all required fields are filled in correctly</li>
                  <li>Verify that currency codes and dates are in the correct format</li>
                  <li>Resubmit your corrected file</li>
                </ol>
              </div>
              
              <p>If you need assistance with correcting these errors, please contact our support team:</p>
              <ul>
                <li>Email: {{supportEmail}}</li>
                <li>Phone: {{supportPhone}}</li>
              </ul>
              
              <p>We appreciate your patience and look forward to receiving your corrected submission.</p>
              
              <p>Best regards,<br>
              Carmen Supply Chain Management Team</p>
            </div>
          </body>
        </html>
      `,
      textTemplate: `
Price Submission Error - {{vendorName}}

Dear {{vendorName}},

We encountered errors while processing your price submission and were unable to import your pricing data.

Submission Details:
- Submission ID: {{submissionId}}
- Template: {{templateName}}
- Processing Date: {{processingDate}}
- Status: Failed

Errors Found:
{{#each errors}}
- Row {{row}}, Field {{field}}: {{message}}
{{/each}}

Next Steps:
1. Review and correct the errors listed above in your Excel file
2. Ensure all required fields are filled in correctly
3. Verify that currency codes and dates are in the correct format
4. Resubmit your corrected file

If you need assistance with correcting these errors, please contact our support team:
- Email: {{supportEmail}}
- Phone: {{supportPhone}}

We appreciate your patience and look forward to receiving your corrected submission.

Best regards,
Carmen Supply Chain Management Team
      `
    });

    // Template download notification
    this.templates.set('template_download_notification', {
      id: 'template_download_notification',
      name: 'Template Download Notification',
      type: 'confirmation',
      subject: 'Price Template Ready for Download - {{vendorName}}',
      htmlTemplate: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c5aa0;">Price Template Ready</h2>
              
              <p>Dear {{vendorName}},</p>
              
              <p>Your customized price submission template is ready for download.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #28a745;">Template Details</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>Template Name:</strong> {{templateName}}</li>
                  <li><strong>Categories:</strong> {{categories}}</li>
                  <li><strong>Currency:</strong> {{currency}}</li>
                  <li><strong>Generated:</strong> {{generatedDate}}</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{downloadUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Template</a>
              </div>
              
              <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                <h4 style="margin-top: 0; color: #0c5460;">Instructions</h4>
                <ol>
                  <li>Download the Excel template using the button above</li>
                  <li>Fill in your pricing information in the provided columns</li>
                  <li>Follow the validation rules and instructions included in the template</li>
                  <li>Email the completed template back to: pricing@carmen.com</li>
                </ol>
              </div>
              
              <p>If you have any questions about filling out the template, please contact our support team:</p>
              <ul>
                <li>Email: {{supportEmail}}</li>
                <li>Phone: {{supportPhone}}</li>
              </ul>
              
              <p>Thank you for your continued partnership.</p>
              
              <p>Best regards,<br>
              Carmen Supply Chain Management Team</p>
            </div>
          </body>
        </html>
      `,
      textTemplate: `
Price Template Ready - {{vendorName}}

Dear {{vendorName}},

Your customized price submission template is ready for download.

Template Details:
- Template Name: {{templateName}}
- Categories: {{categories}}
- Currency: {{currency}}
- Generated: {{generatedDate}}

Download URL: {{downloadUrl}}

Instructions:
1. Download the Excel template using the URL above
2. Fill in your pricing information in the provided columns
3. Follow the validation rules and instructions included in the template
4. Email the completed template back to: pricing@carmen.com

If you have any questions about filling out the template, please contact our support team:
- Email: {{supportEmail}}
- Phone: {{supportPhone}}

Thank you for your continued partnership.

Best regards,
Carmen Supply Chain Management Team
      `
    });
  }

  async sendNotification(templateId: string, context: NotificationContext): Promise<boolean> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const notification = this.renderTemplate(template, context);
      
      // In a real implementation, this would integrate with an email service
      // For now, we'll simulate sending the email
      console.log('Sending notification:', {
        to: context.vendorEmail,
        subject: notification.subject,
        type: template.type
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  private renderTemplate(template: NotificationTemplate, context: NotificationContext): EmailNotification {
    // Simple template rendering (in a real implementation, use a proper template engine like Handlebars)
    let subject = template.subject;
    let htmlContent = template.htmlTemplate;
    let textContent = template.textTemplate;

    // Replace template variables
    const replacements = {
      vendorName: context.vendorName,
      vendorEmail: context.vendorEmail,
      templateName: context.templateName || 'N/A',
      submissionId: context.submissionId || 'N/A',
      processingDate: new Date().toLocaleString(),
      supportEmail: context.supportEmail || 'support@carmen.com',
      supportPhone: context.supportPhone || '+1 (555) 123-4567',
      itemsProcessed: context.processingResults?.itemsProcessed || 0,
      itemsCreated: context.processingResults?.itemsCreated || 0,
      itemsUpdated: context.processingResults?.itemsUpdated || 0,
      categories: Array.isArray(context.processingResults?.categories) 
        ? context.processingResults.categories.join(', ') 
        : 'N/A',
      currency: context.processingResults?.currency || 'USD',
      generatedDate: new Date().toLocaleString(),
      downloadUrl: context.processingResults?.downloadUrl || '#'
    };

    // Replace simple variables
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      htmlContent = htmlContent.replace(regex, String(value));
      textContent = textContent.replace(regex, String(value));
    });

    // Handle conditional blocks and loops (simplified implementation)
    if (context.warnings && context.warnings.length > 0) {
      const warningsHtml = context.warnings.map(w => `<li>Row ${w.row}: ${w.message}</li>`).join('');
      const warningsText = context.warnings.map(w => `- Row ${w.row}: ${w.message}`).join('\n');
      
      htmlContent = htmlContent.replace(/{{#if warnings}}[\s\S]*?{{\/if}}/g, 
        `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="margin-top: 0; color: #856404;">Warnings</h4>
          <p>Your submission was processed successfully, but please note the following warnings:</p>
          <ul>${warningsHtml}</ul>
        </div>`);
      
      textContent = textContent.replace(/{{#if warnings}}[\s\S]*?{{\/if}}/g, 
        `Warnings:\n${warningsText}\n`);
    } else {
      htmlContent = htmlContent.replace(/{{#if warnings}}[\s\S]*?{{\/if}}/g, '');
      textContent = textContent.replace(/{{#if warnings}}[\s\S]*?{{\/if}}/g, '');
    }

    if (context.errors && context.errors.length > 0) {
      const errorsHtml = context.errors.map(e => `<li><strong>Row ${e.row}, Field ${e.field}:</strong> ${e.message}</li>`).join('');
      const errorsText = context.errors.map(e => `- Row ${e.row}, Field ${e.field}: ${e.message}`).join('\n');
      
      htmlContent = htmlContent.replace(/{{#each errors}}[\s\S]*?{{\/each}}/g, errorsHtml);
      textContent = textContent.replace(/{{#each errors}}[\s\S]*?{{\/each}}/g, errorsText);
    } else {
      htmlContent = htmlContent.replace(/{{#each errors}}[\s\S]*?{{\/each}}/g, '');
      textContent = textContent.replace(/{{#each errors}}[\s\S]*?{{\/each}}/g, '');
    }

    return {
      to: context.vendorEmail,
      subject,
      htmlContent,
      textContent
    };
  }

  getAvailableTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId);
  }
}

// Singleton instance
export const notificationService = new NotificationService();