/**
 * Tests for template token injection
 * Task 7.4: Template token injection engine
 * Requirements: 10.4
 */

import { describe, it, expect } from 'vitest';
import { injectTemplate } from './formatters';
import { DeploymentFormData, Application } from '../types/models';

describe('injectTemplate', () => {
  const mockApplication: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  };

  const createMockData = (overrides?: Partial<DeploymentFormData>): DeploymentFormData => ({
    formId: 'test-form-1',
    application: mockApplication,
    changeNumber: 'CHG12345',
    releaseVersion: 'v5.4.1',
    environment: 'PROD',
    deploymentTitle: '[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]',
    deploymentDate: new Date('2025-03-05T00:00:00Z'),
    startTime: new Date('2025-03-05T20:00:00Z'),
    endTime: new Date('2025-03-05T22:00:00Z'),
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    changeItems: [
      { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login bug' },
      { id: '2', jiraNumber: 'JIRA-456', description: 'Add new feature' }
    ],
    impactItems: [
      { id: '1', text: 'System will be unavailable during deployment' },
      { id: '2', text: 'Users may experience slower performance' }
    ],
    contactName: 'John Doe',
    contactEmail: 'john.doe@example.com',
    contactPhone: '(555) 123-4567',
    ...overrides
  });

  it('should replace all basic text tokens', () => {
    const template = `
      {{NOTIFICATION_HEADER}}
      {{DEPLOYMENT_TITLE}}
      {{DEPLOYMENT_ID}}
      {{CONTACT_NAME}}
      {{CONTACT_EMAIL}}
      {{CONTACT_PHONE}}
    `;
    
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    expect(result).toContain('Crew Portal Deployment Notification');
    expect(result).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
    expect(result).toContain('CHG12345');
    expect(result).toContain('John Doe');
    expect(result).toContain('john.doe@example.com');
    expect(result).toContain('(555) 123-4567');
  });

  it('should replace deployment schedule token', () => {
    const template = 'Schedule: {{DEPLOYMENT_SCHEDULE}}';
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    // Check that the result contains expected date components
    // The exact format depends on the user's locale and timezone
    expect(result).toContain('2025');
    expect(result).toMatch(/\d{2}:\d{2} (AM|PM)/); // Check that times are formatted as HH:MM AM/PM
  });

  it('should replace change items with HTML', () => {
    const template = '<div>{{CHANGE_ITEMS}}</div>';
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    expect(result).toContain('<strong>JIRA-123</strong> Fix login bug');
    expect(result).toContain('<strong>JIRA-456</strong> Add new feature');
  });

  it('should replace impact items with HTML list', () => {
    const template = '<div>{{IMPACT_ITEMS}}</div>';
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>System will be unavailable during deployment</li>');
    expect(result).toContain('<li>Users may experience slower performance</li>');
    expect(result).toContain('</ul>');
  });

  it('should replace outage window when outage exists', () => {
    const template = 'Outage: {{OUTAGE_WINDOW}}';
    const data = createMockData({
      hasOutage: true,
      outageStartDate: new Date('2025-03-05T00:00:00Z'),
      outageStartTime: new Date('2025-03-05T20:00:00Z'),
      outageEndDate: new Date('2025-03-05T00:00:00Z'),
      outageEndTime: new Date('2025-03-05T22:00:00Z')
    });
    const result = injectTemplate(template, data);
    
    expect(result).toContain('Outage Window:');
    expect(result).toContain('2025');
  });

  it('should replace outage window with empty string when no outage', () => {
    const template = 'Outage: {{OUTAGE_WINDOW}}';
    const data = createMockData({ hasOutage: false });
    const result = injectTemplate(template, data);
    
    expect(result).toBe('Outage: ');
  });

  it('should escape HTML in text tokens', () => {
    const template = 'Name: {{CONTACT_NAME}}, Email: {{CONTACT_EMAIL}}';
    const data = createMockData({
      contactName: '<script>alert("XSS")</script>',
      contactEmail: 'test@example.com<script>'
    });
    const result = injectTemplate(template, data);
    
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('should handle multiple occurrences of the same token', () => {
    const template = '{{DEPLOYMENT_ID}} - {{DEPLOYMENT_ID}} - {{DEPLOYMENT_ID}}';
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    expect(result).toBe('CHG12345 - CHG12345 - CHG12345');
  });

  it('should handle a complete HTML template', () => {
    const template = `
      <!DOCTYPE html>
      <html>
        <head><title>{{NOTIFICATION_HEADER}}</title></head>
        <body>
          <h1>{{DEPLOYMENT_TITLE}}</h1>
          <p>ID: {{DEPLOYMENT_ID}}</p>
          <p>Schedule: {{DEPLOYMENT_SCHEDULE}}</p>
          <p>Outage: {{OUTAGE_WINDOW}}</p>
          <div>{{CHANGE_ITEMS}}</div>
          <div>{{IMPACT_ITEMS}}</div>
          <p>Contact: {{CONTACT_NAME}} ({{CONTACT_EMAIL}}, {{CONTACT_PHONE}})</p>
        </body>
      </html>
    `;
    
    const data = createMockData();
    const result = injectTemplate(template, data);
    
    // Verify all tokens are replaced
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
    expect(result).toContain('Crew Portal Deployment Notification');
    expect(result).toContain('CHG12345');
    expect(result).toContain('John Doe');
    expect(result).toContain('<strong>JIRA-123</strong>');
    expect(result).toContain('<ul>');
  });
});
