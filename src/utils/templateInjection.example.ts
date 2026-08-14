/**
 * Example usage of the template injection engine
 * Task 7.4: Template token injection engine
 * 
 * This file demonstrates how the injectTemplate function works with actual deployment data.
 */

import { injectTemplate } from './formatters';
import { DeploymentFormData, Application } from '../types/models';

// Example application
const exampleApp: Application = {
  id: 'crew-portal',
  name: 'Crew Portal',
  notificationHeader: 'Crew Portal Deployment Notification'
};

// Example deployment form data
const exampleData: DeploymentFormData = {
  formId: 'example-1',
  application: exampleApp,
  changeNumber: 'CHG12345',
  releaseVersion: 'v5.4.1',
  environment: 'PROD',
  deploymentTitle: '[CHG12345] — [Crew Portal: v5.4.1 - Deploy to PROD]',
  startDateTime: new Date('2025-03-05T20:00:00Z'),
  endDateTime: new Date('2025-03-05T22:00:00Z'),
  hasOutage: true,
  outageStartDateTime: new Date('2025-03-05T19:00:00Z'),
  outageEndDateTime: new Date('2025-03-05T23:00:00Z'),
  changeItems: [
    { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login authentication bug' },
    { id: '2', jiraNumber: 'JIRA-456', description: 'Add new dashboard feature' },
    { id: '3', jiraNumber: 'JIRA-789', description: 'Update user profile page' }
  ],
  impactItems: [
    { id: '1', text: 'System will be unavailable during deployment window' },
    { id: '2', text: 'Users may experience slower performance immediately after deployment' },
    { id: '3', text: 'All active sessions will be terminated' }
  ],
  contactName: 'John Doe',
  contactEmail: 'john.doe@example.com',
  contactPhone: '(555) 123-4567'
};

// Example template snippet
const exampleTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{NOTIFICATION_HEADER}}</title>
</head>
<body>
  <h1>{{NOTIFICATION_HEADER}}</h1>
  
  <section>
    <h2>Deployment Details</h2>
    <p><strong>Title:</strong> {{DEPLOYMENT_TITLE}}</p>
    <p><strong>Change Number:</strong> {{DEPLOYMENT_ID}}</p>
    <p><strong>Schedule:</strong> {{DEPLOYMENT_SCHEDULE}}</p>
    <p><strong>Outage:</strong> {{OUTAGE_WINDOW}}</p>
  </section>
  
  <section>
    <h2>Change Items</h2>
    <div>{{CHANGE_ITEMS}}</div>
  </section>
  
  <section>
    <h2>Impact Items</h2>
    {{IMPACT_ITEMS}}
  </section>
  
  <section>
    <h2>Contact Information</h2>
    <p><strong>Name:</strong> {{CONTACT_NAME}}</p>
    <p><strong>Email:</strong> {{CONTACT_EMAIL}}</p>
    <p><strong>Phone:</strong> {{CONTACT_PHONE}}</p>
  </section>
</body>
</html>
`;

// Generate the populated HTML
const populatedHtml = injectTemplate(exampleTemplate, exampleData);

console.log('='.repeat(80));
console.log('EXAMPLE: Template Token Injection');
console.log('='.repeat(80));
console.log('\nOriginal Template Tokens:');
console.log('- {{NOTIFICATION_HEADER}}');
console.log('- {{DEPLOYMENT_TITLE}}');
console.log('- {{DEPLOYMENT_ID}}');
console.log('- {{DEPLOYMENT_SCHEDULE}}');
console.log('- {{OUTAGE_WINDOW}}');
console.log('- {{CHANGE_ITEMS}}');
console.log('- {{IMPACT_ITEMS}}');
console.log('- {{CONTACT_NAME}}');
console.log('- {{CONTACT_EMAIL}}');
console.log('- {{CONTACT_PHONE}}');

console.log('\n' + '='.repeat(80));
console.log('POPULATED HTML OUTPUT:');
console.log('='.repeat(80));
console.log(populatedHtml);

console.log('\n' + '='.repeat(80));
console.log('KEY FEATURES:');
console.log('='.repeat(80));
console.log('✓ Text tokens are HTML-escaped for security');
console.log('✓ HTML tokens (lists) are inserted verbatim');
console.log('✓ All tokens are replaced with actual data');
console.log('✓ Dates and times are formatted according to locale');
console.log('✓ Outage section shows only when hasOutage is true');
console.log('✓ Change items are rendered with <strong> tags for Jira numbers');
console.log('✓ Impact items are rendered as an HTML <ul> list');
