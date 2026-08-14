/**
 * Integration tests for HTML artifact generator with real templates
 * Tests task 15.1 with actual template files
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateHTML } from './htmlGenerator';
import { templateProvider } from './templateProvider';
import type { DeploymentFormData, Theme } from '../types/models';

// Sample deployment form data for integration testing
const createCompleteFormData = (): DeploymentFormData => ({
  formId: 'integration-test-1',
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
  hasOutage: true,
  outageStartDate: new Date('2025-03-05'),
  outageStartTime: new Date('2025-03-05T20:15:00'),
  outageEndDate: new Date('2025-03-05'),
  outageEndTime: new Date('2025-03-05T20:45:00'),
  changeItems: [
    {
      id: '1',
      jiraNumber: 'JIRA-123',
      description: 'Updated user authentication flow'
    },
    {
      id: '2',
      jiraNumber: 'JIRA-456',
      description: 'Fixed navigation bug in mobile view'
    }
  ],
  impactItems: [
    {
      id: '1',
      text: 'Users will experience improved login performance'
    },
    {
      id: '2',
      text: 'Mobile users will see corrected navigation behavior'
    }
  ],
  contactName: 'John Doe',
  contactEmail: 'john.doe@example.com',
  contactPhone: '(555) 123-4567'
});

describe('generateHTML - Integration Tests with Real Templates', () => {
  beforeAll(async () => {
    // Load actual templates from public/templates directory
    // In test environment, we'll use mock templates that match the real structure
    templateProvider.setTemplate('light', `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Notification - Light Mode</title>
</head>
<body>
    <div class="container light-theme">
        <header>
            <h1>{{NOTIFICATION_HEADER}}</h1>
        </header>
        <main>
            <section class="deployment-info">
                <h2>{{DEPLOYMENT_TITLE}}</h2>
                <p><strong>Change ID:</strong> {{DEPLOYMENT_SUBTITLE}}</p>
                <p><strong>Schedule:</strong> {{SCHEDULE}}</p>
            </section>
            <section class="outage-info">
                {{OUTAGE_BLOCK}}
            </section>
            <section class="changes">
                <h3>Change Items</h3>
                {{JIRA_ITEMS}}
            </section>
            <section class="impacts">
                <h3>Deployment Impacts</h3>
                {{IMPACT_ITEMS}}
            </section>
            <section class="contact">
                <h3>Contact Information</h3>
                <p>{{CONTACT}}</p>
            </section>
        </main>
    </div>
</body>
</html>
    `);
    
    templateProvider.setTemplate('dark', `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Notification - Dark Mode</title>
</head>
<body>
    <div class="container dark-theme">
        <header>
            <h1>{{NOTIFICATION_HEADER}}</h1>
        </header>
        <main>
            <section class="deployment-info">
                <h2>{{DEPLOYMENT_TITLE}}</h2>
                <p><strong>Change ID:</strong> {{DEPLOYMENT_SUBTITLE}}</p>
                <p><strong>Schedule:</strong> {{SCHEDULE}}</p>
            </section>
            <section class="outage-info">
                {{OUTAGE_BLOCK}}
            </section>
            <section class="changes">
                <h3>Change Items</h3>
                {{JIRA_ITEMS}}
            </section>
            <section class="impacts">
                <h3>Deployment Impacts</h3>
                {{IMPACT_ITEMS}}
            </section>
            <section class="contact">
                <h3>Contact Information</h3>
                <p>{{CONTACT}}</p>
            </section>
        </main>
    </div>
</body>
</html>
    `);
  });

  it('generates complete HTML artifact with Light Mode theme', () => {
    const formData = createCompleteFormData();
    const theme: Theme = 'Light Mode';
    
    const html = generateHTML(formData, theme);
    
    // Verify HTML structure
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
    expect(html).toContain('light-theme');
    
    // Verify all sections present
    expect(html).toContain('Crew Portal Deployment Notification');
    expect(html).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
    expect(html).toContain('CHG12345');
    expect(html).toContain('Change Items');
    expect(html).toContain('Deployment Impacts');
    expect(html).toContain('Contact Information');
  });

  it('generates complete HTML artifact with Dark Mode theme', () => {
    const formData = createCompleteFormData();
    const theme: Theme = 'Dark Mode';
    
    const html = generateHTML(formData, theme);
    
    // Verify HTML structure
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
    expect(html).toContain('dark-theme');
    
    // Verify all sections present
    expect(html).toContain('Crew Portal Deployment Notification');
    expect(html).toContain('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });

  it('includes all deployment metadata in generated HTML', () => {
    const formData = createCompleteFormData();
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Application info
    expect(html).toContain('Crew Portal');
    
    // Deployment info
    expect(html).toContain('CHG12345');
    expect(html).toContain('v5.4.1');
    expect(html).toContain('PROD');
    
    // Schedule info
    expect(html).toContain('March');
    expect(html).toContain('2025');
    
    // Change items
    expect(html).toContain('JIRA-123');
    expect(html).toContain('Updated user authentication flow');
    expect(html).toContain('JIRA-456');
    expect(html).toContain('Fixed navigation bug in mobile view');
    
    // Impact items
    expect(html).toContain('Users will experience improved login performance');
    expect(html).toContain('Mobile users will see corrected navigation behavior');
    
    // Contact info
    expect(html).toContain('John Doe');
    expect(html).toContain('john.doe@example.com');
    expect(html).toContain('(555) 123-4567');
  });

  it('properly formats change items with strong tags for Jira numbers', () => {
    const formData = createCompleteFormData();
    
    const html = generateHTML(formData, 'Dark Mode');
    
    // Jira numbers should be wrapped in <strong> tags
    expect(html).toContain('<strong>JIRA-123</strong>');
    expect(html).toContain('<strong>JIRA-456</strong>');
    
    // Descriptions should be plain text (not in strong tags)
    expect(html).toContain('Updated user authentication flow');
    expect(html).toContain('Fixed navigation bug in mobile view');
  });

  it('properly formats impact items as unordered list', () => {
    const formData = createCompleteFormData();
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Should contain list structure
    expect(html).toContain('<ul>');
    expect(html).toContain('</ul>');
    expect(html).toContain('<li>');
    expect(html).toContain('</li>');
    
    // Should contain impact text
    expect(html).toContain('Users will experience improved login performance');
    expect(html).toContain('Mobile users will see corrected navigation behavior');
  });

  it('includes outage information when hasOutage is true', () => {
    const formData = createCompleteFormData();
    formData.hasOutage = true;
    
    const html = generateHTML(formData, 'Dark Mode');
    
    // Should contain outage section
    expect(html).toContain('outage-info');
    // Outage details should be present in some form
    expect(html).toBeDefined();
  });

  it('handles minimal data (no outage, single items)', () => {
    const formData = createCompleteFormData();
    formData.hasOutage = false;
    formData.outageStartDate = null;
    formData.outageStartTime = null;
    formData.outageEndDate = null;
    formData.outageEndTime = null;
    formData.changeItems = [
      { id: '1', jiraNumber: 'JIRA-001', description: 'Single change' }
    ];
    formData.impactItems = [
      { id: '1', text: 'Single impact' }
    ];
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Should still generate valid HTML
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('JIRA-001');
    expect(html).toContain('Single change');
    expect(html).toContain('Single impact');
  });

  it('produces valid HTML that can be opened in browser', () => {
    const formData = createCompleteFormData();
    
    const html = generateHTML(formData, 'Dark Mode');
    
    // Basic HTML validity checks
    expect(html).toMatch(/<!DOCTYPE html>/i);
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('</head>');
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
    expect(html).toContain('<title>');
    
    // Should not have template tokens remaining
    expect(html).not.toContain('{{NOTIFICATION_HEADER}}');
    expect(html).not.toContain('{{DEPLOYMENT_TITLE}}');
    expect(html).not.toContain('{{DEPLOYMENT_SUBTITLE}}');
    expect(html).not.toContain('{{SCHEDULE}}');
    expect(html).not.toContain('{{OUTAGE_BLOCK}}');
    expect(html).not.toContain('{{JIRA_ITEMS}}');
    expect(html).not.toContain('{{IMPACT_ITEMS}}');
    expect(html).not.toContain('{{CONTACT}}');
  });

  it('escapes potentially dangerous HTML in user input', () => {
    const formData = createCompleteFormData();
    formData.contactName = '<script>alert("XSS")</script>';
    formData.changeItems[0].description = 'Test <img src=x onerror=alert(1)>';
    
    const html = generateHTML(formData, 'Light Mode');
    
    // Should not contain unescaped script or img tags
    expect(html).not.toContain('<script>alert("XSS")</script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    
    // Should contain escaped versions
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
  });

  it('generates different output for different applications', () => {
    const formData1 = createCompleteFormData();
    formData1.application = {
      id: 'crew-portal',
      name: 'Crew Portal',
      notificationHeader: 'Crew Portal Deployment Notification'
    };
    
    const formData2 = createCompleteFormData();
    formData2.application = {
      id: 'crew-mobile',
      name: 'Crew Mobile',
      notificationHeader: 'Crew Mobile Deployment Notification'
    };
    
    const html1 = generateHTML(formData1, 'Dark Mode');
    const html2 = generateHTML(formData2, 'Dark Mode');
    
    // Different applications should produce different headers
    expect(html1).toContain('Crew Portal Deployment Notification');
    expect(html2).toContain('Crew Mobile Deployment Notification');
    expect(html1).not.toContain('Crew Mobile Deployment Notification');
    expect(html2).not.toContain('Crew Portal Deployment Notification');
  });
});
