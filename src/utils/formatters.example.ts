/**
 * Example usage of formatter functions
 * 
 * This file demonstrates how to use the title generation functions.
 * It's for documentation purposes only and is not part of the main application.
 */

import { generateDeploymentTitle, generateNotificationHeader } from './formatters';
import { APPLICATION_CATALOG, DeploymentFormData } from '../types/models';

// Example 1: Generate a complete deployment title
const exampleFormData: DeploymentFormData = {
  formId: 'form-1',
  application: APPLICATION_CATALOG[0] ?? null, // AO Crew Training
  changeNumber: 'CHG12345',
  releaseVersion: 'v5.4.1',
  environment: 'PROD',
  deploymentTitle: '', // This would be computed
  deploymentDate: new Date('2025-03-05'),
  startTime: new Date('2025-03-05T20:00:00'),
  endTime: new Date('2025-03-05T22:00:00'),
  hasOutage: false,
  outageStartDate: null,
  outageStartTime: null,
  outageEndDate: null,
  outageEndTime: null,
  changeItems: [],
  impactItems: [],
  contactName: 'John Doe',
  contactEmail: 'john.doe@example.com',
  contactPhone: '(555) 123-4567'
};

const title = generateDeploymentTitle(exampleFormData);
console.log('Generated Title:', title);
// Output: [CHG12345] — [AO Crew Training: v5.4.1 - Deploy Product to PROD]

// Example 2: Generate notification header
const header = generateNotificationHeader('Crew Portal');
console.log('Notification Header:', header);
// Output: Crew Portal Deployment Notification

// Example 3: Incomplete form data returns empty string
const incompleteFormData: DeploymentFormData = {
  ...exampleFormData,
  application: null // Missing application
};

const emptyTitle = generateDeploymentTitle(incompleteFormData);
console.log('Empty Title:', emptyTitle);
// Output: (empty string)

// Example 4: Generate titles for different environments
const qaFormData: DeploymentFormData = {
  ...exampleFormData,
  environment: 'QA'
};

const qaTitle = generateDeploymentTitle(qaFormData);
console.log('QA Title:', qaTitle);
// Output: [CHG12345] — [AO Crew Training: v5.4.1 - Deploy Product to QA]
