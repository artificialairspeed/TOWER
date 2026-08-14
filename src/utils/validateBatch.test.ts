import { describe, test, expect } from 'vitest';
import { validateBatch } from './validators';
import { createDefaultForm } from '../data/formFactory';
import type { DeploymentFormData } from '../types/models';
import { APPLICATION_CATALOG } from '../types/models';

describe('validateBatch', () => {
  describe('theme validation', () => {
    test('passes when theme is selected', () => {
      const forms: DeploymentFormData[] = [];
      const result = validateBatch(forms, 'Dark Mode', false);
      
      // Should not have theme error (but might have catalog error)
      const themeError = result.errors.find(e => e.field === 'theme');
      expect(themeError).toBeUndefined();
    });

    test('fails when theme is not selected', () => {
      const forms: DeploymentFormData[] = [];
      const result = validateBatch(forms, null, false);
      
      expect(result.isValid).toBe(false);
      const themeError = result.errors.find(e => e.field === 'theme');
      expect(themeError).toBeDefined();
      expect(themeError?.formId).toBe('_session');
      expect(themeError?.message).toContain('select a theme');
    });
  });

  describe('catalog validation', () => {
    test('passes when catalog is not empty', () => {
      const forms: DeploymentFormData[] = [];
      const result = validateBatch(forms, 'Dark Mode', false);
      
      // Should not have catalog error (but might have theme validation if null)
      const catalogError = result.errors.find(e => e.field === 'applicationCatalog');
      expect(catalogError).toBeUndefined();
    });

    test('fails when catalog is empty', () => {
      const forms: DeploymentFormData[] = [];
      const result = validateBatch(forms, 'Dark Mode', true);
      
      expect(result.isValid).toBe(false);
      const catalogError = result.errors.find(e => e.field === 'applicationCatalog');
      expect(catalogError).toBeDefined();
      expect(catalogError?.formId).toBe('_session');
      expect(catalogError?.message).toContain('No applications');
    });
  });

  describe('form validation aggregation', () => {
    test('passes when all forms are valid and session checks pass', () => {
      // Create a valid form
      const form = createDefaultForm();
      form.application = APPLICATION_CATALOG[0]!;
      form.changeNumber = 'CHG12345';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      form.contactName = 'John Doe';
      form.contactEmail = 'john@example.com';
      form.contactPhone = '(555) 123-4567';
      form.changeItems = [{ id: '1', jiraNumber: 'JIRA-123', description: 'Test change' }];
      form.impactItems = [{ id: '1', text: 'Test impact' }];

      const result = validateBatch([form], 'Dark Mode', false);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('fails when any form has validation errors', () => {
      // Create an invalid form (missing required fields)
      const invalidForm = createDefaultForm();
      invalidForm.changeNumber = ''; // Missing required field
      invalidForm.releaseVersion = ''; // Missing required field

      const result = validateBatch([invalidForm], 'Dark Mode', false);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('aggregates errors from multiple forms', () => {
      // Create two invalid forms
      const form1 = createDefaultForm();
      form1.changeNumber = ''; // Invalid
      
      const form2 = createDefaultForm();
      form2.releaseVersion = ''; // Invalid

      const result = validateBatch([form1, form2], 'Dark Mode', false);
      
      expect(result.isValid).toBe(false);
      // Should have errors from both forms
      const form1Errors = result.errors.filter(e => e.formId === form1.formId);
      const form2Errors = result.errors.filter(e => e.formId === form2.formId);
      
      expect(form1Errors.length).toBeGreaterThan(0);
      expect(form2Errors.length).toBeGreaterThan(0);
    });

    test('combines session-level errors with form errors', () => {
      // Create an invalid form AND fail session checks
      const invalidForm = createDefaultForm();
      invalidForm.changeNumber = ''; // Invalid

      const result = validateBatch([invalidForm], null, true);
      
      expect(result.isValid).toBe(false);
      
      // Should have theme error
      const themeError = result.errors.find(e => e.field === 'theme');
      expect(themeError).toBeDefined();
      
      // Should have catalog error
      const catalogError = result.errors.find(e => e.field === 'applicationCatalog');
      expect(catalogError).toBeDefined();
      
      // Should have form errors
      const formErrors = result.errors.filter(e => e.formId === invalidForm.formId);
      expect(formErrors.length).toBeGreaterThan(0);
    });
  });

  describe('empty forms array', () => {
    test('passes with empty forms array when session checks pass', () => {
      const result = validateBatch([], 'Dark Mode', false);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('fails with empty forms array when session checks fail', () => {
      const result = validateBatch([], null, true);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // theme + catalog errors
    });
  });

  describe('requirement compliance', () => {
    test('validates requirement 2.3: application selection check', () => {
      // Requirement 2.3: IF the coordinator attempts output generation while no 
      // application is selected, THEN THE Portal SHALL prevent output generation
      const form = createDefaultForm();
      form.application = null; // No application selected

      const result = validateBatch([form], 'Dark Mode', false);
      
      expect(result.isValid).toBe(false);
      const appError = result.errors.find(e => e.field === 'application');
      expect(appError).toBeDefined();
    });

    test('validates requirement 2.8: empty catalog blocks generation', () => {
      // Requirement 2.8: WHILE the Application_Catalog is empty or has failed to load,
      // THE Portal SHALL prevent output generation
      const result = validateBatch([], 'Dark Mode', true);
      
      expect(result.isValid).toBe(false);
      const catalogError = result.errors.find(e => e.field === 'applicationCatalog');
      expect(catalogError).toBeDefined();
    });

    test('validates requirement 9.4: theme must be selected', () => {
      // Requirement 9.4: IF output generation is requested WHILE no Theme is selected,
      // THEN THE Portal SHALL prevent output generation
      const result = validateBatch([], null, false);
      
      expect(result.isValid).toBe(false);
      const themeError = result.errors.find(e => e.field === 'theme');
      expect(themeError).toBeDefined();
    });

    test('validates requirement 10.2: validates every form before generation', () => {
      // Requirement 10.2: WHEN the coordinator activates the Generate Outputs control,
      // THE Validator SHALL validate every Deployment_Form before any artifact is generated
      const form1 = createDefaultForm();
      form1.changeNumber = '';
      
      const form2 = createDefaultForm();
      form2.releaseVersion = '';

      const result = validateBatch([form1, form2], 'Dark Mode', false);
      
      expect(result.isValid).toBe(false);
      // Both forms should be validated
      expect(result.errors.some(e => e.formId === form1.formId)).toBe(true);
      expect(result.errors.some(e => e.formId === form2.formId)).toBe(true);
    });

    test('validates requirement 10.3: blocks generation if any form fails', () => {
      // Requirement 10.3: IF any Deployment_Form fails validation,
      // THEN THE Portal SHALL block generation for all Deployment_Form instances
      const validForm = createDefaultForm();
      validForm.application = APPLICATION_CATALOG[0]!;
      validForm.changeNumber = 'CHG12345';
      validForm.releaseVersion = 'v1.0.0';
      validForm.environment = 'PROD';
      validForm.contactName = 'John Doe';
      validForm.contactEmail = 'john@example.com';
      validForm.contactPhone = '(555) 123-4567';
      validForm.changeItems = [{ id: '1', jiraNumber: 'JIRA-123', description: 'Test' }];
      validForm.impactItems = [{ id: '1', text: 'Impact' }];

      const invalidForm = createDefaultForm();
      invalidForm.changeNumber = ''; // Invalid

      const result = validateBatch([validForm, invalidForm], 'Dark Mode', false);
      
      // Even though one form is valid, the batch should fail
      expect(result.isValid).toBe(false);
    });
  });
});
