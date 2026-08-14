import { describe, test, expect } from 'vitest';
import {
  generateBaseFileName,
  detectCollisions,
  disambiguateFileNames,
} from './fileNaming';
import { DeploymentFormData, Application } from '../types/models';

// Helper to create a minimal deployment form for testing
function createTestForm(
  overrides: Partial<DeploymentFormData>
): DeploymentFormData {
  const defaultApp: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification',
  };

  return {
    formId: 'test-form-1',
    application: defaultApp,
    changeNumber: 'CHG12345',
    releaseVersion: 'v1.0.0',
    environment: 'PROD',
    deploymentTitle: '',
    deploymentDate: new Date(2025, 2, 15), // March 15, 2025 in local time
    startTime: new Date(2025, 2, 15, 20, 0, 0), // 8:00 PM local time
    endTime: new Date(2025, 2, 15, 22, 0, 0), // 10:00 PM local time
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    changeItems: [],
    impactItems: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    ...overrides,
  };
}

describe('fileNaming', () => {
  describe('generateBaseFileName', () => {
    test('generates correct format with all components present', () => {
      const form = createTestForm({});
      const baseName = generateBaseFileName(form);
      expect(baseName).toBe('Crew_Portal_PROD_CHG12345_20250315');
    });

    test('replaces spaces with underscores in application name', () => {
      const app: Application = {
        id: 'ao-crew-training',
        name: 'AO Crew Training',
        notificationHeader: 'AO Crew Training Deployment Notification',
      };
      const form = createTestForm({ application: app });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBe('AO_Crew_Training_PROD_CHG12345_20250315');
    });

    test('replaces spaces with underscores in change number', () => {
      const form = createTestForm({ changeNumber: 'CHG 12345' });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBe('Crew_Portal_PROD_CHG_12345_20250315');
    });

    test('formats date as YYYYMMDD', () => {
      const form = createTestForm({ deploymentDate: new Date(2025, 11, 31) }); // Dec 31, 2025
      const baseName = generateBaseFileName(form);
      expect(baseName).toBe('Crew_Portal_PROD_CHG12345_20251231');
    });

    test('returns null when application is missing', () => {
      const form = createTestForm({ application: null });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBeNull();
    });

    test('returns null when environment is missing', () => {
      const form = createTestForm({ environment: null });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBeNull();
    });

    test('returns null when change number is missing', () => {
      const form = createTestForm({ changeNumber: '' });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBeNull();
    });

    test('handles different environments correctly', () => {
      const prodForm = createTestForm({ environment: 'PROD' });
      expect(generateBaseFileName(prodForm)).toContain('_PROD_');

      const qaForm = createTestForm({ environment: 'QA' });
      expect(generateBaseFileName(qaForm)).toContain('_QA_');

      const itestForm = createTestForm({ environment: 'ITEST' });
      expect(generateBaseFileName(itestForm)).toContain('_ITEST_');

      const devForm = createTestForm({ environment: 'DEV' });
      expect(generateBaseFileName(devForm)).toContain('_DEV_');
    });

    test('returns null when deploymentDate is missing', () => {
      const form = createTestForm({ deploymentDate: null as any });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBeNull();
    });

    test('handles multiple spaces in application name', () => {
      const app: Application = {
        id: 'test-app',
        name: 'Application With  Multiple   Spaces',
        notificationHeader: 'Test Notification',
      };
      const form = createTestForm({ application: app });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBe('Application_With__Multiple___Spaces_PROD_CHG12345_20250315');
    });

    test('handles edge case dates correctly', () => {
      // Test January 1st
      const jan1Form = createTestForm({ deploymentDate: new Date(2025, 0, 1) });
      expect(generateBaseFileName(jan1Form)).toContain('_20250101');

      // Test December 31st
      const dec31Form = createTestForm({ deploymentDate: new Date(2025, 11, 31) });
      expect(generateBaseFileName(dec31Form)).toContain('_20251231');

      // Test leap year date (Feb 29)
      const leapForm = createTestForm({ deploymentDate: new Date(2024, 1, 29) });
      expect(generateBaseFileName(leapForm)).toContain('_20240229');

      // Test single-digit day and month formatting
      const singleDigitForm = createTestForm({ deploymentDate: new Date(2025, 0, 5) }); // Jan 5
      expect(generateBaseFileName(singleDigitForm)).toContain('_20250105');
    });

    test('generates full correct format with all components', () => {
      const app: Application = {
        id: 'learning-management',
        name: 'Learning Management',
        notificationHeader: 'Learning Management Deployment Notification',
      };
      const form = createTestForm({
        application: app,
        environment: 'QA',
        changeNumber: 'CHG98765',
        deploymentDate: new Date(2025, 5, 20), // June 20, 2025
      });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBe('Learning_Management_QA_CHG98765_20250620');
    });

    test('handles change number with space at start and end', () => {
      const form = createTestForm({ changeNumber: ' CHG 54321 ' });
      const baseName = generateBaseFileName(form);
      // Note: The function doesn't trim, it only replaces spaces with underscores
      expect(baseName).toBe('Crew_Portal_PROD__CHG_54321__20250315');
    });

    test('handles environment with no spaces', () => {
      const form = createTestForm({ environment: 'DEV' });
      const baseName = generateBaseFileName(form);
      expect(baseName).toBe('Crew_Portal_DEV_CHG12345_20250315');
    });
  });

  describe('detectCollisions', () => {
    test('returns empty map for empty form array', () => {
      const collisions = detectCollisions([]);
      expect(collisions.size).toBe(0);
    });

    test('groups single form by its base name', () => {
      const form = createTestForm({ formId: 'form-1' });
      const collisions = detectCollisions([form]);
      
      expect(collisions.size).toBe(1);
      expect(collisions.get('Crew_Portal_PROD_CHG12345_20250315')).toEqual([form]);
    });

    test('groups forms with identical base names', () => {
      const form1 = createTestForm({ formId: 'form-1' });
      const form2 = createTestForm({ formId: 'form-2' });
      const collisions = detectCollisions([form1, form2]);
      
      expect(collisions.size).toBe(1);
      const group = collisions.get('Crew_Portal_PROD_CHG12345_20250315');
      expect(group).toHaveLength(2);
      expect(group).toContain(form1);
      expect(group).toContain(form2);
    });

    test('creates separate groups for different base names', () => {
      const form1 = createTestForm({ formId: 'form-1', changeNumber: 'CHG12345' });
      const form2 = createTestForm({ formId: 'form-2', changeNumber: 'CHG67890' });
      const collisions = detectCollisions([form1, form2]);
      
      expect(collisions.size).toBe(2);
      expect(collisions.get('Crew_Portal_PROD_CHG12345_20250315')).toEqual([form1]);
      expect(collisions.get('Crew_Portal_PROD_CHG67890_20250315')).toEqual([form2]);
    });

    test('classifies forms as colliding only when all components match', () => {
      const baseForm = createTestForm({
        formId: 'base',
        changeNumber: 'CHG12345',
        environment: 'PROD',
        deploymentDate: new Date(2025, 2, 15), // March 15, 2025
      });

      const differentApp: Application = {
        id: 'ao-crew-training',
        name: 'AO Crew Training',
        notificationHeader: 'AO Crew Training Deployment Notification',
      };

      const diffApp = createTestForm({
        formId: 'diff-app',
        application: differentApp,
        changeNumber: 'CHG12345',
        environment: 'PROD',
        deploymentDate: new Date(2025, 2, 15),
      });

      const diffEnv = createTestForm({
        formId: 'diff-env',
        changeNumber: 'CHG12345',
        environment: 'QA',
        deploymentDate: new Date(2025, 2, 15),
      });

      const diffChg = createTestForm({
        formId: 'diff-chg',
        changeNumber: 'CHG67890',
        environment: 'PROD',
        deploymentDate: new Date(2025, 2, 15),
      });

      const diffDate = createTestForm({
        formId: 'diff-date',
        changeNumber: 'CHG12345',
        environment: 'PROD',
        deploymentDate: new Date(2025, 2, 16), // March 16, 2025
      });

      const collisions = detectCollisions([baseForm, diffApp, diffEnv, diffChg, diffDate]);
      
      // Each should be in its own group
      expect(collisions.size).toBe(5);
      expect(collisions.get('Crew_Portal_PROD_CHG12345_20250315')).toEqual([baseForm]);
      expect(collisions.get('AO_Crew_Training_PROD_CHG12345_20250315')).toEqual([diffApp]);
      expect(collisions.get('Crew_Portal_QA_CHG12345_20250315')).toEqual([diffEnv]);
      expect(collisions.get('Crew_Portal_PROD_CHG67890_20250315')).toEqual([diffChg]);
      expect(collisions.get('Crew_Portal_PROD_CHG12345_20250316')).toEqual([diffDate]);
    });

    test('skips forms with incomplete data (null base name)', () => {
      const validForm = createTestForm({ formId: 'valid' });
      const invalidForm = createTestForm({ formId: 'invalid', application: null });
      
      const collisions = detectCollisions([validForm, invalidForm]);
      
      expect(collisions.size).toBe(1);
      expect(collisions.get('Crew_Portal_PROD_CHG12345_20250315')).toEqual([validForm]);
    });

    test('handles three or more forms with same base name', () => {
      const form1 = createTestForm({ formId: 'form-1' });
      const form2 = createTestForm({ formId: 'form-2' });
      const form3 = createTestForm({ formId: 'form-3' });
      const form4 = createTestForm({ formId: 'form-4' });
      
      const collisions = detectCollisions([form1, form2, form3, form4]);
      
      expect(collisions.size).toBe(1);
      const group = collisions.get('Crew_Portal_PROD_CHG12345_20250315');
      expect(group).toHaveLength(4);
      expect(group).toEqual([form1, form2, form3, form4]);
    });
  });

  describe('disambiguateFileNames', () => {
    test('returns empty map for empty form array', () => {
      const fileNames = disambiguateFileNames([]);
      expect(fileNames.size).toBe(0);
    });

    test('assigns base name without suffix for single form', () => {
      const form = createTestForm({ formId: 'form-1' });
      const fileNames = disambiguateFileNames([form]);
      
      expect(fileNames.size).toBe(1);
      expect(fileNames.get('form-1')).toBe('Crew_Portal_PROD_CHG12345_20250315');
    });

    test('assigns base name without suffix to first form in collision', () => {
      const form1 = createTestForm({ formId: 'form-1' });
      const form2 = createTestForm({ formId: 'form-2' });
      
      const fileNames = disambiguateFileNames([form1, form2]);
      
      expect(fileNames.get('form-1')).toBe('Crew_Portal_PROD_CHG12345_20250315');
      expect(fileNames.get('form-2')).toBe('Crew_Portal_PROD_CHG12345_20250315-1');
    });

    test('assigns suffixes -1, -2, -3 to subsequent forms in collision', () => {
      const form1 = createTestForm({ formId: 'form-1' });
      const form2 = createTestForm({ formId: 'form-2' });
      const form3 = createTestForm({ formId: 'form-3' });
      const form4 = createTestForm({ formId: 'form-4' });
      
      const fileNames = disambiguateFileNames([form1, form2, form3, form4]);
      
      expect(fileNames.get('form-1')).toBe('Crew_Portal_PROD_CHG12345_20250315');
      expect(fileNames.get('form-2')).toBe('Crew_Portal_PROD_CHG12345_20250315-1');
      expect(fileNames.get('form-3')).toBe('Crew_Portal_PROD_CHG12345_20250315-2');
      expect(fileNames.get('form-4')).toBe('Crew_Portal_PROD_CHG12345_20250315-3');
    });

    test('uses stable ordering based on form ID', () => {
      // Create forms in different order than their IDs would sort
      const form3 = createTestForm({ formId: 'form-3' });
      const form1 = createTestForm({ formId: 'form-1' });
      const form2 = createTestForm({ formId: 'form-2' });
      
      // Pass in one order
      const fileNames1 = disambiguateFileNames([form3, form1, form2]);
      
      // Pass in different order
      const fileNames2 = disambiguateFileNames([form2, form3, form1]);
      
      // Both should produce the same result (sorted by form ID)
      expect(fileNames1.get('form-1')).toBe('Crew_Portal_PROD_CHG12345_20250315');
      expect(fileNames1.get('form-2')).toBe('Crew_Portal_PROD_CHG12345_20250315-1');
      expect(fileNames1.get('form-3')).toBe('Crew_Portal_PROD_CHG12345_20250315-2');
      
      expect(fileNames2.get('form-1')).toBe('Crew_Portal_PROD_CHG12345_20250315');
      expect(fileNames2.get('form-2')).toBe('Crew_Portal_PROD_CHG12345_20250315-1');
      expect(fileNames2.get('form-3')).toBe('Crew_Portal_PROD_CHG12345_20250315-2');
    });

    test('handles forms without collisions', () => {
      const form1 = createTestForm({ formId: 'form-1', changeNumber: 'CHG11111' });
      const form2 = createTestForm({ formId: 'form-2', changeNumber: 'CHG22222' });
      const form3 = createTestForm({ formId: 'form-3', changeNumber: 'CHG33333' });
      
      const fileNames = disambiguateFileNames([form1, form2, form3]);
      
      // No collisions, so no suffixes
      expect(fileNames.get('form-1')).toBe('Crew_Portal_PROD_CHG11111_20250315');
      expect(fileNames.get('form-2')).toBe('Crew_Portal_PROD_CHG22222_20250315');
      expect(fileNames.get('form-3')).toBe('Crew_Portal_PROD_CHG33333_20250315');
    });

    test('handles mixed collision groups', () => {
      // Two groups: forms 1-3 collide, forms 4-5 collide, form 6 is unique
      const form1 = createTestForm({ formId: 'form-1', changeNumber: 'CHG12345' });
      const form2 = createTestForm({ formId: 'form-2', changeNumber: 'CHG12345' });
      const form3 = createTestForm({ formId: 'form-3', changeNumber: 'CHG12345' });
      const form4 = createTestForm({ formId: 'form-4', changeNumber: 'CHG67890' });
      const form5 = createTestForm({ formId: 'form-5', changeNumber: 'CHG67890' });
      const form6 = createTestForm({ formId: 'form-6', changeNumber: 'CHG99999' });
      
      const fileNames = disambiguateFileNames([form1, form2, form3, form4, form5, form6]);
      
      // First collision group
      expect(fileNames.get('form-1')).toBe('Crew_Portal_PROD_CHG12345_20250315');
      expect(fileNames.get('form-2')).toBe('Crew_Portal_PROD_CHG12345_20250315-1');
      expect(fileNames.get('form-3')).toBe('Crew_Portal_PROD_CHG12345_20250315-2');
      
      // Second collision group
      expect(fileNames.get('form-4')).toBe('Crew_Portal_PROD_CHG67890_20250315');
      expect(fileNames.get('form-5')).toBe('Crew_Portal_PROD_CHG67890_20250315-1');
      
      // Unique form
      expect(fileNames.get('form-6')).toBe('Crew_Portal_PROD_CHG99999_20250315');
    });

    test('skips forms with incomplete data', () => {
      const validForm = createTestForm({ formId: 'valid' });
      const invalidForm = createTestForm({ formId: 'invalid', application: null });
      
      const fileNames = disambiguateFileNames([validForm, invalidForm]);
      
      expect(fileNames.size).toBe(1);
      expect(fileNames.get('valid')).toBe('Crew_Portal_PROD_CHG12345_20250315');
      expect(fileNames.has('invalid')).toBe(false);
    });

    test('suffix applies to all three artifacts for same form', () => {
      // This test verifies the concept that the same suffix is used for HTML, PDF, PNG
      // The actual artifact generation will use the file name from this map
      const form1 = createTestForm({ formId: 'form-1' });
      const form2 = createTestForm({ formId: 'form-2' });
      
      const fileNames = disambiguateFileNames([form1, form2]);
      
      const baseName1 = fileNames.get('form-1')!;
      const baseName2 = fileNames.get('form-2')!;
      
      // Each form gets one base name that will be used for all three artifact types
      expect(baseName1).toBe('Crew_Portal_PROD_CHG12345_20250315');
      expect(baseName2).toBe('Crew_Portal_PROD_CHG12345_20250315-1');
      
      // Artifact generation would create:
      // form-1: baseName1 + '.html', baseName1 + '.pdf', baseName1 + '.png'
      // form-2: baseName2 + '.html', baseName2 + '.pdf', baseName2 + '.png'
    });
  });
});
