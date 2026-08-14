/**
 * Integration tests for form-level validation orchestrator
 * Tests the validateForm function with various scenarios
 */

import { describe, test, expect } from 'vitest';
import { validateForm } from './validators';
import type { DeploymentFormData } from '../types/models';
import { APPLICATION_CATALOG } from '../types/models';

// Helper function to create a valid deployment form for testing
function createValidForm(): DeploymentFormData {
  const now = new Date();
  const startTime = new Date(now);
  startTime.setHours(20, 0, 0, 0);
  const endTime = new Date(now);
  endTime.setHours(22, 0, 0, 0);

  return {
    formId: 'test-form-1',
    application: APPLICATION_CATALOG[0]!,
    changeNumber: 'CHG12345',
    releaseVersion: 'v5.4.1',
    environment: 'PROD',
    deploymentTitle: '[CHG12345] — [AO Crew Training: v5.4.1 - Deploy Product to PROD]',
    deploymentDate: now,
    startTime: startTime,
    endTime: endTime,
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    changeItems: [
      {
        id: '1',
        jiraNumber: 'JIRA-123',
        description: 'Test change item'
      }
    ],
    impactItems: [
      {
        id: '1',
        text: 'Test impact item'
      }
    ],
    contactName: 'John Doe',
    contactEmail: 'john.doe@example.com',
    contactPhone: '(555) 123-4567'
  };
}

describe('validateForm', () => {
  test('validates a complete valid form', () => {
    const form = createValidForm();
    const result = validateForm(form);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('detects missing application', () => {
    const form = createValidForm();
    form.application = null;
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      formId: 'test-form-1',
      field: 'application',
      message: 'Please select an application'
    });
  });

  test('detects missing required deployment fields', () => {
    const form = createValidForm();
    form.changeNumber = '';
    form.releaseVersion = '   '; // whitespace only
    form.environment = null;
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
    expect(result.errors.some(e => e.field === 'changeNumber')).toBe(true);
    expect(result.errors.some(e => e.field === 'releaseVersion')).toBe(true);
    expect(result.errors.some(e => e.field === 'environment')).toBe(true);
  });

  test('detects invalid time ordering (end time before start time)', () => {
    const form = createValidForm();
    // Set end time before start time
    const startTime = new Date();
    startTime.setHours(22, 0, 0, 0);
    const endTime = new Date();
    endTime.setHours(20, 0, 0, 0);
    
    form.startTime = startTime;
    form.endTime = endTime;
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      formId: 'test-form-1',
      field: 'endTime',
      message: 'End Time must be later than Start Time'
    });
  });

  test('detects invalid time ordering when end time equals start time', () => {
    const form = createValidForm();
    const sameTime = new Date();
    sameTime.setHours(20, 0, 0, 0);
    
    form.startTime = sameTime;
    form.endTime = sameTime;
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      formId: 'test-form-1',
      field: 'endTime',
      message: 'End Time must be later than Start Time'
    });
  });

  test('validates outage fields when outage is indicated', () => {
    const form = createValidForm();
    form.hasOutage = true;
    // Leave outage fields null
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
    expect(result.errors.some(e => e.field === 'outageStartDate')).toBe(true);
    expect(result.errors.some(e => e.field === 'outageStartTime')).toBe(true);
    expect(result.errors.some(e => e.field === 'outageEndDate')).toBe(true);
    expect(result.errors.some(e => e.field === 'outageEndTime')).toBe(true);
  });

  test('validates outage time ordering', () => {
    const form = createValidForm();
    form.hasOutage = true;
    
    const outageStart = new Date();
    outageStart.setHours(21, 0, 0, 0);
    const outageEnd = new Date();
    outageEnd.setHours(20, 0, 0, 0); // Before start
    
    form.outageStartDate = outageStart;
    form.outageStartTime = outageStart;
    form.outageEndDate = outageEnd;
    form.outageEndTime = outageEnd;
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      formId: 'test-form-1',
      field: 'outageEndTime',
      message: 'Outage End must be later than Outage Start'
    });
  });

  test('requires at least one change item', () => {
    const form = createValidForm();
    form.changeItems = [];
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      formId: 'test-form-1',
      field: 'changeItems',
      message: 'At least one Change Item is required'
    });
  });

  test('validates change item content', () => {
    const form = createValidForm();
    form.changeItems = [
      {
        id: '1',
        jiraNumber: '',
        description: 'Valid description'
      },
      {
        id: '2',
        jiraNumber: 'JIRA-456',
        description: '   ' // whitespace only
      }
    ];
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'changeItems[0].jiraNumber')).toBe(true);
    expect(result.errors.some(e => e.field === 'changeItems[1].description')).toBe(true);
  });

  test('enforces change item maximum length', () => {
    const form = createValidForm();
    form.changeItems = [
      {
        id: '1',
        jiraNumber: 'A'.repeat(51), // Exceeds 50 char limit
        description: 'B'.repeat(501) // Exceeds 500 char limit
      }
    ];
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => 
      e.field === 'changeItems[0].jiraNumber' && 
      e.message.includes('50 characters')
    )).toBe(true);
    expect(result.errors.some(e => 
      e.field === 'changeItems[0].description' && 
      e.message.includes('500 characters')
    )).toBe(true);
  });

  test('requires at least one impact item', () => {
    const form = createValidForm();
    form.impactItems = [];
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      formId: 'test-form-1',
      field: 'impactItems',
      message: 'At least one Impact Item is required'
    });
  });

  test('validates impact item content', () => {
    const form = createValidForm();
    form.impactItems = [
      {
        id: '1',
        text: ''
      },
      {
        id: '2',
        text: '   ' // whitespace only
      }
    ];
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'impactItems[0].text')).toBe(true);
    expect(result.errors.some(e => e.field === 'impactItems[1].text')).toBe(true);
  });

  test('enforces impact item maximum length', () => {
    const form = createValidForm();
    form.impactItems = [
      {
        id: '1',
        text: 'A'.repeat(501) // Exceeds 500 char limit
      }
    ];
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'impactItems[0].text',
        message: expect.stringContaining('500 characters')
      })
    );
  });

  test('enforces impact items maximum count', () => {
    const form = createValidForm();
    form.impactItems = Array.from({ length: 101 }, (_, i) => ({
      id: `${i}`,
      text: `Impact item ${i}`
    }));
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      formId: 'test-form-1',
      field: 'impactItems',
      message: 'Maximum of 100 Impact Items allowed'
    });
  });

  test('validates contact information', () => {
    const form = createValidForm();
    form.contactName = '';
    form.contactEmail = 'invalid-email';
    form.contactPhone = '555-1234'; // Any format is accepted now

    const result = validateForm(form);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'contactName')).toBe(true);
    expect(result.errors.some(e => e.field === 'contactEmail' && e.message.includes('valid email'))).toBe(true);
    // No phone format is required, so a non-empty phone produces no error.
    expect(result.errors.some(e => e.field === 'contactPhone')).toBe(false);
  });

  test('validates contact field maximum length', () => {
    const form = createValidForm();
    form.contactName = 'A'.repeat(256);
    form.contactEmail = 'B'.repeat(256);
    form.contactPhone = 'C'.repeat(256);
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'contactName' && e.message.includes('255'))).toBe(true);
    expect(result.errors.some(e => e.field === 'contactEmail' && e.message.includes('255'))).toBe(true);
    expect(result.errors.some(e => e.field === 'contactPhone' && e.message.includes('255'))).toBe(true);
  });

  test('is non-destructive (does not mutate input data)', () => {
    const form = createValidForm();
    const originalFormJson = JSON.stringify(form);
    
    // Validate the form
    validateForm(form);
    
    // Verify the form data is unchanged
    expect(JSON.stringify(form)).toBe(originalFormJson);
  });

  test('aggregates all validation errors', () => {
    const form = createValidForm();
    // Create multiple validation errors
    form.application = null;
    form.changeNumber = '';
    form.releaseVersion = '';
    form.environment = null;
    form.changeItems = [];
    form.impactItems = [];
    form.contactName = '';
    form.contactEmail = 'invalid';
    form.contactPhone = 'invalid';
    
    const result = validateForm(form);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(5); // Multiple errors collected
  });
});
