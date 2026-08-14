/**
 * Unit tests for form factory functions
 * 
 * Tests creation of default DeploymentFormData with proper defaults.
 * Requirements: 1.1, 4.2-4.4, 5.2, 6.1, 7.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDefaultForm, createNewChangeItem, createNewImpactItem } from './formFactory';
import type { DeploymentFormData } from '../types/models';

describe('formFactory', () => {
  describe('createDefaultForm', () => {
    let form: DeploymentFormData;
    let creationDate: Date;

    beforeEach(() => {
      // Capture the date right before form creation
      creationDate = new Date();
      creationDate.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
      form = createDefaultForm();
    });

    it('should generate a unique form ID', () => {
      expect(form.formId).toBeDefined();
      expect(typeof form.formId).toBe('string');
      expect(form.formId).toMatch(/^form-\d+-[a-z0-9]+$/);
    });

    it('should generate unique form IDs for multiple forms', () => {
      const form1 = createDefaultForm();
      const form2 = createDefaultForm();
      const form3 = createDefaultForm();
      
      expect(form1.formId).not.toBe(form2.formId);
      expect(form2.formId).not.toBe(form3.formId);
      expect(form1.formId).not.toBe(form3.formId);
    });

    it('should have no application selected by default', () => {
      expect(form.application).toBeNull();
    });

    it('should have empty changeNumber by default', () => {
      expect(form.changeNumber).toBe('');
    });

    it('should have empty releaseVersion by default', () => {
      expect(form.releaseVersion).toBe('');
    });

    it('should have no environment selected by default', () => {
      expect(form.environment).toBeNull();
    });

    it('should have empty deploymentTitle by default', () => {
      expect(form.deploymentTitle).toBe('');
    });

    it('should set deploymentDate to today (midnight)', () => {
      // Check the date matches today (allowing for small timing differences during test execution)
      const todayStr = creationDate.toDateString();
      const formDateStr = form.deploymentDate.toDateString();
      expect(formDateStr).toBe(todayStr);
      
      // Verify time is set to midnight
      expect(form.deploymentDate.getHours()).toBe(0);
      expect(form.deploymentDate.getMinutes()).toBe(0);
      expect(form.deploymentDate.getSeconds()).toBe(0);
      expect(form.deploymentDate.getMilliseconds()).toBe(0);
    });

    it('should set startTime to 20:00 (8:00 PM) today', () => {
      expect(form.startTime).toBeInstanceOf(Date);
      expect(form.startTime.getHours()).toBe(20);
      expect(form.startTime.getMinutes()).toBe(0);
      expect(form.startTime.getSeconds()).toBe(0);
      expect(form.startTime.getMilliseconds()).toBe(0);
      
      // Verify it's today's date
      const todayStr = creationDate.toDateString();
      const startTimeStr = form.startTime.toDateString();
      expect(startTimeStr).toBe(todayStr);
    });

    it('should set endTime to 22:00 (10:00 PM) today', () => {
      expect(form.endTime).toBeInstanceOf(Date);
      expect(form.endTime.getHours()).toBe(22);
      expect(form.endTime.getMinutes()).toBe(0);
      expect(form.endTime.getSeconds()).toBe(0);
      expect(form.endTime.getMilliseconds()).toBe(0);
      
      // Verify it's today's date
      const todayStr = creationDate.toDateString();
      const endTimeStr = form.endTime.toDateString();
      expect(endTimeStr).toBe(todayStr);
    });

    it('should verify endTime is later than startTime', () => {
      expect(form.endTime.getTime()).toBeGreaterThan(form.startTime.getTime());
    });

    it('should set hasOutage to false by default', () => {
      expect(form.hasOutage).toBe(false);
    });

    it('should set all outage date/time fields to null by default', () => {
      expect(form.outageStartDate).toBeNull();
      expect(form.outageStartTime).toBeNull();
      expect(form.outageEndDate).toBeNull();
      expect(form.outageEndTime).toBeNull();
    });

    it('should create exactly one empty ChangeItem by default', () => {
      expect(form.changeItems).toHaveLength(1);
      expect(form.changeItems[0]).toBeDefined();
    });

    it('should have empty ChangeItem with unique ID', () => {
      const changeItem = form.changeItems[0]!;
      expect(changeItem.id).toBeDefined();
      expect(typeof changeItem.id).toBe('string');
      expect(changeItem.id).toMatch(/^item-\d+-[a-z0-9]+$/);
      expect(changeItem.jiraNumber).toBe('');
      expect(changeItem.description).toBe('');
    });

    it('should create exactly one empty ImpactItem by default', () => {
      expect(form.impactItems).toHaveLength(1);
      expect(form.impactItems[0]).toBeDefined();
    });

    it('should have empty ImpactItem with unique ID', () => {
      const impactItem = form.impactItems[0]!;
      expect(impactItem.id).toBeDefined();
      expect(typeof impactItem.id).toBe('string');
      expect(impactItem.id).toMatch(/^item-\d+-[a-z0-9]+$/);
      expect(impactItem.text).toBe('');
    });

    it('should have empty contactName by default', () => {
      expect(form.contactName).toBe('');
    });

    it('should have empty contactEmail by default', () => {
      expect(form.contactEmail).toBe('');
    });

    it('should have empty contactPhone by default', () => {
      expect(form.contactPhone).toBe('');
    });

    it('should generate unique IDs for ChangeItem and ImpactItem in the same form', () => {
      const changeItemId = form.changeItems[0]!.id;
      const impactItemId = form.impactItems[0]!.id;
      expect(changeItemId).not.toBe(impactItemId);
    });
  });

  describe('createNewChangeItem', () => {
    it('should create a ChangeItem with unique ID', () => {
      const item = createNewChangeItem();
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('string');
      expect(item.id).toMatch(/^item-\d+-[a-z0-9]+$/);
    });

    it('should create a ChangeItem with empty jiraNumber', () => {
      const item = createNewChangeItem();
      expect(item.jiraNumber).toBe('');
    });

    it('should create a ChangeItem with empty description', () => {
      const item = createNewChangeItem();
      expect(item.description).toBe('');
    });

    it('should generate unique IDs for multiple ChangeItems', () => {
      const item1 = createNewChangeItem();
      const item2 = createNewChangeItem();
      const item3 = createNewChangeItem();
      
      expect(item1.id).not.toBe(item2.id);
      expect(item2.id).not.toBe(item3.id);
      expect(item1.id).not.toBe(item3.id);
    });
  });

  describe('createNewImpactItem', () => {
    it('should create an ImpactItem with unique ID', () => {
      const item = createNewImpactItem();
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('string');
      expect(item.id).toMatch(/^item-\d+-[a-z0-9]+$/);
    });

    it('should create an ImpactItem with empty text', () => {
      const item = createNewImpactItem();
      expect(item.text).toBe('');
    });

    it('should generate unique IDs for multiple ImpactItems', () => {
      const item1 = createNewImpactItem();
      const item2 = createNewImpactItem();
      const item3 = createNewImpactItem();
      
      expect(item1.id).not.toBe(item2.id);
      expect(item2.id).not.toBe(item3.id);
      expect(item1.id).not.toBe(item3.id);
    });
  });

  describe('Edge cases and timing', () => {
    it('should handle rapid sequential form creation', () => {
      const forms = Array.from({ length: 5 }, () => createDefaultForm());
      const ids = forms.map(f => f.formId);
      const uniqueIds = new Set(ids);
      
      // All IDs should be unique
      expect(uniqueIds.size).toBe(5);
    });

    it('should handle creation across midnight boundary', () => {
      // Mock date to be just before midnight
      const almostMidnight = new Date();
      almostMidnight.setHours(23, 59, 59, 999);
      
      vi.useFakeTimers();
      vi.setSystemTime(almostMidnight);
      
      const form1 = createDefaultForm();
      
      // Advance to after midnight
      const afterMidnight = new Date(almostMidnight);
      afterMidnight.setDate(afterMidnight.getDate() + 1);
      afterMidnight.setHours(0, 0, 0, 1);
      vi.setSystemTime(afterMidnight);
      
      const form2 = createDefaultForm();
      
      // Forms should have different deployment dates
      expect(form1.deploymentDate.toDateString()).not.toBe(form2.deploymentDate.toDateString());
      
      // But start/end times should still be 20:00 and 22:00
      expect(form1.startTime.getHours()).toBe(20);
      expect(form1.endTime.getHours()).toBe(22);
      expect(form2.startTime.getHours()).toBe(20);
      expect(form2.endTime.getHours()).toBe(22);
      
      vi.useRealTimers();
    });
  });

  describe('Data structure completeness', () => {
    it('should create a form with all required DeploymentFormData fields', () => {
      const form = createDefaultForm();
      
      // Verify all fields exist (TypeScript ensures this at compile time,
      // but we can verify runtime presence)
      const requiredFields = [
        'formId', 'application', 'changeNumber', 'releaseVersion', 'environment',
        'deploymentTitle', 'deploymentDate', 'startTime', 'endTime', 'hasOutage',
        'outageStartDate', 'outageStartTime', 'outageEndDate', 'outageEndTime',
        'changeItems', 'impactItems', 'contactName', 'contactEmail', 'contactPhone'
      ];
      
      requiredFields.forEach(field => {
        expect(form).toHaveProperty(field);
      });
    });
  });
});
