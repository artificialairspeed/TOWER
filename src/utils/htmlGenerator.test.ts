/**
 * Unit tests for HTML artifact generator
 * Tests task 15.1 implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateHTML } from './htmlGenerator';
import { templateProvider } from './templateProvider';
import type { DeploymentFormData, Theme } from '../types/models';

// Sample deployment form data for testing
const createTestFormData = (): DeploymentFormData => ({
  formId: 'test-form-1',
  application: {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  },
  changeNumber: 'CHG12345',
  releaseVersion: 'v5.4.1',
  environment: 'PROD',
  deploymentTitle: '[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]',
  deploymentDate: new Date('2025-03-05'),
  startTime: new Date('2025-03-05T20:00:00'),
  endTime: new Date('2025-03-05T22:00:00'),
  hasOutage: false,
  outageStartDate: null,
  outageStartTime: null,
  outageEndDate: null,
  outageEndTime: null,
  changeItems: [
    {
      id: '1',
      jiraNumber: 'JIRA-123',
      description: 'Updated user authentication flow'
    }
  ],
  impactItems: [
    {
      id: '1',
      text: 'Users will experience improved login performance'
    }
  ],
  contactName: 'John Doe',
  contactEmail: 'john.doe@example.com',
  contactPhone: '(555) 123-4567'
});

describe('generateHTML', () => {
  beforeEach(() => {
    // Set up mock templates for testing
    templateProvider.setTemplate('light', `
      <html>
        <head><title>Light Mode Template</title></head>
        <body>
          <h1>{{NOTIFICATION_HEADER}}</h1>
          <h2>{{DEPLOYMENT_TITLE}}</h2>
          <p>ID: {{DEPLOYMENT_SUBTITLE}}</p>
          <p>Schedule: {{SCHEDULE}}</p>
          <div>{{OUTAGE_BLOCK}}</div>
          <div>{{JIRA_ITEMS}}</div>
          <div>{{IMPACT_ITEMS}}</div>
          <div>{{CONTACT}}</div>
        </body>
      </html>
    `);
    
    templateProvider.setTemplate('dark', `
      <html>
        <head><title>Dark Mode Template</title></head>
        <body class="dark">
          <h1>{{NOTIFICATION_HEADER}}</h1>
          <h2>{{DEPLOYMENT_TITLE}}</h2>
          <p>ID: {{DEPLOYMENT_SUBTITLE}}</p>
          <p>Schedule: {{SCHEDULE}}</p>
          <div>{{OUTAGE_BLOCK}}</div>
          <div>{{JIRA_ITEMS}}</div>
          <div>{{IMPACT_ITEMS}}</div>
          <div>{{CONTACT}}</div>
        </body>
      </html>
    `);
  });

  it('generates HTML with Light Mode theme', () => {
    const formData = createTestFormData();
    const theme: Theme = 'Light Mode';
    
    const html = generateHTML(formData, theme);
    
    // Should use light mode template
    expect(html).toContain('<title>Light Mode Template</title>');
    expect(html).not.toContain('class="dark"');
    
    // Should contain deployment data
    expect(html).toContain('Crew Portal Deployment Notification');
    expect(html).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
    expect(html).toContain('CHG12345');
    expect(html).toContain('John Doe');
    expect(html).toContain('john.doe@example.com');
    expect(html).toContain('(555) 123-4567');
  });

  it('generates HTML with Dark Mode theme', () => {
    const formData = createTestFormData();
    const theme: Theme = 'Dark Mode';
    
    const html = generateHTML(formData, theme);
    
    // Should use dark mode template
    expect(html).toContain('<title>Dark Mode Template</title>');
    expect(html).toContain('class="dark"');
    
    // Should contain deployment data
    expect(html).toContain('Crew Portal Deployment Notification');
    expect(html).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });

  it('injects notification header from application', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Dark Mode');
    
    expect(html).toContain('Crew Portal Deployment Notification');
  });

  it('injects deployment title', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Light Mode');
    
    expect(html).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });

  it('injects change number as deployment subtitle', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Dark Mode');
    
    expect(html).toContain('ID: CHG12345');
  });

  it('injects formatted schedule', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Should contain formatted date/time (March 05, 2025, 08:00 PM–10:00 PM)
    expect(html).toContain('March');
    expect(html).toContain('2025');
    expect(html).toContain('PM');
  });

  it('injects change items as HTML', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Dark Mode');
    
    // Should contain Jira number in strong tag
    expect(html).toContain('<strong>JIRA-123</strong>');
    expect(html).toContain('Updated user authentication flow');
  });

  it('injects impact items as HTML list', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Should contain impact items in list format
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
    expect(html).toContain('Users will experience improved login performance');
  });

  it('injects contact information', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Dark Mode');
    
    expect(html).toContain('John Doe');
    expect(html).toContain('john.doe@example.com');
    expect(html).toContain('(555) 123-4567');
  });

  it('handles outage information when hasOutage is false', () => {
    const formData = createTestFormData();
    formData.hasOutage = false;
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Should have empty or minimal outage section
    expect(html).toBeDefined();
  });

  it('handles outage information when hasOutage is true', () => {
    const formData = createTestFormData();
    formData.hasOutage = true;
    formData.outageStartDate = new Date('2025-03-05');
    formData.outageStartTime = new Date('2025-03-05T20:00:00');
    formData.outageEndDate = new Date('2025-03-05');
    formData.outageEndTime = new Date('2025-03-05T21:00:00');
    
    const html = generateHTML(formData, 'Dark Mode');
    
    // Should contain outage information
    expect(html).toContain('March');
    expect(html).toBeDefined();
  });

  it('handles multiple change items', () => {
    const formData = createTestFormData();
    formData.changeItems = [
      { id: '1', jiraNumber: 'JIRA-123', description: 'First change' },
      { id: '2', jiraNumber: 'JIRA-456', description: 'Second change' },
      { id: '3', jiraNumber: 'JIRA-789', description: 'Third change' }
    ];
    
    const html = generateHTML(formData, 'Light Mode');
    
    expect(html).toContain('JIRA-123');
    expect(html).toContain('JIRA-456');
    expect(html).toContain('JIRA-789');
    expect(html).toContain('First change');
    expect(html).toContain('Second change');
    expect(html).toContain('Third change');
  });

  it('handles multiple impact items', () => {
    const formData = createTestFormData();
    formData.impactItems = [
      { id: '1', text: 'Impact one' },
      { id: '2', text: 'Impact two' },
      { id: '3', text: 'Impact three' }
    ];
    
    const html = generateHTML(formData, 'Dark Mode');
    
    expect(html).toContain('Impact one');
    expect(html).toContain('Impact two');
    expect(html).toContain('Impact three');
  });

  it('escapes HTML special characters in user input', () => {
    const formData = createTestFormData();
    formData.contactName = 'John <script>alert("xss")</script> Doe';
    formData.changeNumber = 'CHG<123>';
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Should not contain unescaped script tags
    expect(html).not.toContain('<script>alert("xss")</script>');
    // Should contain escaped versions
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
  });

  it('throws error if templates not initialized', () => {
    // Clear templates
    templateProvider.clear();
    
    const formData = createTestFormData();
    
    expect(() => generateHTML(formData, 'Light Mode')).toThrow(
      /Template not found for theme: light/
    );
  });

  it('returns complete HTML document structure', () => {
    const formData = createTestFormData();
    
    const html = generateHTML(formData, 'Dark Mode');
    
    // Should have HTML structure
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('</head>');
    expect(html).toContain('<body');
    expect(html).toContain('</body>');
  });

  it('generates different HTML for different themes', () => {
    const formData = createTestFormData();
    
    const lightHtml = generateHTML(formData, 'Light Mode');
    const darkHtml = generateHTML(formData, 'Dark Mode');
    
    // Should be different due to different templates
    expect(lightHtml).not.toBe(darkHtml);
    expect(lightHtml).toContain('Light Mode Template');
    expect(darkHtml).toContain('Dark Mode Template');
  });

  it('preserves data integrity across generation', () => {
    const formData = createTestFormData();
    const originalData = JSON.stringify(formData);
    
    generateHTML(formData, 'Light Mode');
    
    // Form data should not be mutated
    expect(JSON.stringify(formData)).toBe(originalData);
  });
});
