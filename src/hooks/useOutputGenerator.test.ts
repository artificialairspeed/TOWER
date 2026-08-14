/**
 * Unit tests for useOutputGenerator hook
 * 
 * Tests the output generation orchestration workflow:
 * - Validation blocking
 * - Bundle building
 * - Sequential delivery
 * - Error handling and reporting
 * 
 * Task: 17.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOutputGenerator } from './useOutputGenerator';
import type { DeploymentFormData, Theme } from '../types/models';
import { createDefaultForm } from '../data/formFactory';
import * as validators from '../utils/validators';
import * as bundleBuilder from '../utils/bundleBuilder';
import * as sequentialDelivery from '../utils/sequentialDelivery';

// Mock the utility modules
vi.mock('../utils/validators');
vi.mock('../utils/bundleBuilder');
vi.mock('../utils/sequentialDelivery');

describe('useOutputGenerator', () => {
  let mockValidateBatch: ReturnType<typeof vi.fn>;
  let mockBuildArtifactBundles: ReturnType<typeof vi.fn>;
  let mockDeliverArtifacts: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up default mock implementations
    mockValidateBatch = vi.fn();
    mockBuildArtifactBundles = vi.fn();
    mockDeliverArtifacts = vi.fn();
    
    vi.mocked(validators.validateBatch).mockImplementation(mockValidateBatch);
    vi.mocked(bundleBuilder.buildArtifactBundles).mockImplementation(mockBuildArtifactBundles);
    vi.mocked(sequentialDelivery.deliverArtifacts).mockImplementation(mockDeliverArtifacts);
  });
  
  describe('Initial state', () => {
    it('should start in idle state with no results', () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      expect(result.current.state).toBe('idle');
      expect(result.current.validationResult).toBeNull();
      expect(result.current.deliveryResult).toBeNull();
      expect(result.current.isGenerating).toBe(false);
    });
  });
  
  describe('Validation blocking (Requirements 10.2, 10.3)', () => {
    it('should block generation when validation fails', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.changeNumber = ''; // Invalid: empty required field
      
      // Mock validation failure
      mockValidateBatch.mockReturnValue({
        isValid: false,
        errors: [
          { formId: form.formId, field: 'changeNumber', message: 'Change Number is required' }
        ]
      });
      
      // Attempt generation
      await result.current.generateOutputs([form], 'Dark Mode', false);
      
      // Wait for state to update
      await waitFor(() => {
        expect(result.current.state).toBe('error');
      });
      
      // Should have validation errors
      expect(result.current.validationResult).not.toBeNull();
      expect(result.current.validationResult?.isValid).toBe(false);
      expect(result.current.validationResult?.errors).toHaveLength(1);
      
      // Should not have attempted bundle building or delivery
      expect(mockBuildArtifactBundles).not.toHaveBeenCalled();
      expect(mockDeliverArtifacts).not.toHaveBeenCalled();
    });
    
    it('should block generation when theme not selected', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.application = { id: 'test', name: 'Test App', notificationHeader: 'Test' };
      form.changeNumber = 'CHG123';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      
      // Mock validation failure due to missing theme
      mockValidateBatch.mockReturnValue({
        isValid: false,
        errors: [
          { formId: '_session', field: 'theme', message: 'Please select a theme' }
        ]
      });
      
      // Attempt generation with null theme
      await result.current.generateOutputs([form], null, false);
      
      // Wait for state to update
      await waitFor(() => {
        expect(result.current.state).toBe('error');
      });
      
      expect(result.current.validationResult?.errors[0]?.field).toBe('theme');
      
      // Should not proceed to generation
      expect(mockBuildArtifactBundles).not.toHaveBeenCalled();
    });
    
    it('should block generation when catalog is empty', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      
      // Mock validation failure due to empty catalog
      mockValidateBatch.mockReturnValue({
        isValid: false,
        errors: [
          { formId: '_session', field: 'applicationCatalog', message: 'No applications available' }
        ]
      });
      
      // Attempt generation with empty catalog
      await result.current.generateOutputs([form], 'Dark Mode', true);
      
      // Wait for state to update
      await waitFor(() => {
        expect(result.current.state).toBe('error');
      });
      
      expect(result.current.validationResult?.errors[0]?.field).toBe('applicationCatalog');
    });
  });
  
  describe('Successful generation workflow (Requirements 10.4-10.7)', () => {
    it('should complete full generation workflow when validation passes', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.application = { id: 'test', name: 'Test App', notificationHeader: 'Test' };
      form.changeNumber = 'CHG123';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      
      // Mock successful validation
      mockValidateBatch.mockReturnValue({
        isValid: true,
        errors: []
      });
      
      // Mock successful bundle building
      const mockBundles = [{
        formId: form.formId,
        htmlContent: '<html>Test</html>',
        fileName: 'Test_App_PROD_CHG123_20250315',
        formData: form
      }];
      mockBuildArtifactBundles.mockReturnValue(mockBundles);
      
      // Mock successful delivery
      mockDeliverArtifacts.mockResolvedValue({
        total: 3,
        successful: 3,
        failed: 0,
        errors: [],
        popupBlocked: false
      });
      
      // Execute generation
      await result.current.generateOutputs([form], 'Dark Mode', false);
      
      // Wait for async completion
      await waitFor(() => {
        expect(result.current.state).toBe('complete');
      });
      
      // Verify validation was called
      expect(mockValidateBatch).toHaveBeenCalledWith([form], 'Dark Mode', false);
      
      // Verify bundle building was called with correct theme
      expect(mockBuildArtifactBundles).toHaveBeenCalledWith([form], 'Dark Mode');
      
      // Verify delivery was called with bundles
      expect(mockDeliverArtifacts).toHaveBeenCalledWith(mockBundles);
      
      // Verify delivery result
      expect(result.current.deliveryResult).not.toBeNull();
      expect(result.current.deliveryResult?.successful).toBe(3);
      expect(result.current.deliveryResult?.failed).toBe(0);
    });
    
    it('should generate N×3 artifacts for N forms', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const forms = [
        createDefaultForm(),
        createDefaultForm(),
        createDefaultForm()
      ];
      
      // Set up valid forms
      forms.forEach((form, index) => {
        form.application = { id: `app-${index}`, name: `App ${index}`, notificationHeader: `Header ${index}` };
        form.changeNumber = `CHG${index}`;
        form.releaseVersion = 'v1.0.0';
        form.environment = 'PROD';
      });
      
      // Mock successful validation
      mockValidateBatch.mockReturnValue({ isValid: true, errors: [] });
      
      // Mock successful bundle building
      const mockBundles = forms.map(form => ({
        formId: form.formId,
        htmlContent: '<html>Test</html>',
        fileName: `App_${form.changeNumber}`,
        formData: form
      }));
      mockBuildArtifactBundles.mockReturnValue(mockBundles);
      
      // Mock successful delivery of all 9 artifacts (3 forms × 3 artifacts)
      mockDeliverArtifacts.mockResolvedValue({
        total: 9,
        successful: 9,
        failed: 0,
        errors: [],
        popupBlocked: false
      });
      
      // Execute generation
      await result.current.generateOutputs(forms, 'Light Mode', false);
      
      await waitFor(() => {
        expect(result.current.state).toBe('complete');
      });
      
      // Verify 3 forms generated 9 artifacts
      expect(result.current.deliveryResult?.total).toBe(9);
      expect(result.current.deliveryResult?.successful).toBe(9);
    });
  });
  
  describe('Partial failure handling (Requirements 10.8, 13.3, 13.4)', () => {
    it('should report popup blocked errors and continue', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.application = { id: 'test', name: 'Test', notificationHeader: 'Test' };
      form.changeNumber = 'CHG123';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      
      mockValidateBatch.mockReturnValue({ isValid: true, errors: [] });
      
      mockBuildArtifactBundles.mockReturnValue([{
        formId: form.formId,
        htmlContent: '<html>Test</html>',
        fileName: 'Test_PROD_CHG123_20250315',
        formData: form
      }]);
      
      // Mock popup blocked (HTML failed, PDF and PNG succeeded)
      mockDeliverArtifacts.mockResolvedValue({
        total: 3,
        successful: 2,
        failed: 1,
        errors: [{
          formId: form.formId,
          artifactType: 'HTML',
          message: 'Popup blocked by browser'
        }],
        popupBlocked: true
      });
      
      await result.current.generateOutputs([form], 'Dark Mode', false);
      
      await waitFor(() => {
        expect(result.current.state).toBe('complete');
      });
      
      // Verify popup blocked was reported
      expect(result.current.deliveryResult?.popupBlocked).toBe(true);
      expect(result.current.deliveryResult?.successful).toBe(2);
      expect(result.current.deliveryResult?.failed).toBe(1);
    });
    
    it('should report artifact generation failures and continue', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.application = { id: 'test', name: 'Test', notificationHeader: 'Test' };
      form.changeNumber = 'CHG123';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      
      mockValidateBatch.mockReturnValue({ isValid: true, errors: [] });
      
      mockBuildArtifactBundles.mockReturnValue([{
        formId: form.formId,
        htmlContent: '<html>Test</html>',
        fileName: 'Test_PROD_CHG123_20250315',
        formData: form
      }]);
      
      // Mock PDF generation failure
      mockDeliverArtifacts.mockResolvedValue({
        total: 3,
        successful: 2,
        failed: 1,
        errors: [{
          formId: form.formId,
          artifactType: 'PDF',
          message: 'PDF generation failed: out of memory'
        }],
        popupBlocked: false
      });
      
      await result.current.generateOutputs([form], 'Dark Mode', false);
      
      await waitFor(() => {
        expect(result.current.state).toBe('complete');
      });
      
      // Verify error was reported
      expect(result.current.deliveryResult?.errors).toHaveLength(1);
      expect(result.current.deliveryResult?.errors[0]?.artifactType).toBe('PDF');
      expect(result.current.deliveryResult?.successful).toBe(2);
    });
    
    it('should handle complete generation failure', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.application = { id: 'test', name: 'Test', notificationHeader: 'Test' };
      form.changeNumber = 'CHG123';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      
      mockValidateBatch.mockReturnValue({ isValid: true, errors: [] });
      
      // Mock bundle building failure
      mockBuildArtifactBundles.mockImplementation(() => {
        throw new Error('Template loading failed');
      });
      
      await result.current.generateOutputs([form], 'Dark Mode', false);
      
      await waitFor(() => {
        expect(result.current.state).toBe('error');
      });
      
      // Verify error state and message
      expect(result.current.deliveryResult?.errors[0]?.message).toContain('Template loading failed');
      expect(result.current.deliveryResult?.successful).toBe(0);
      expect(result.current.deliveryResult?.failed).toBe(3);
    });
  });
  
  describe('State management', () => {
    it('should track generation progress through states', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.application = { id: 'test', name: 'Test', notificationHeader: 'Test' };
      form.changeNumber = 'CHG123';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      
      mockValidateBatch.mockReturnValue({ isValid: true, errors: [] });
      mockBuildArtifactBundles.mockReturnValue([{
        formId: form.formId,
        htmlContent: '<html>Test</html>',
        fileName: 'test',
        formData: form
      }]);
      mockDeliverArtifacts.mockResolvedValue({
        total: 3,
        successful: 3,
        failed: 0,
        errors: [],
        popupBlocked: false
      });
      
      // Initial state
      expect(result.current.state).toBe('idle');
      expect(result.current.isGenerating).toBe(false);
      
      // Start generation (don't await yet)
      const promise = result.current.generateOutputs([form], 'Dark Mode', false);
      
      // Wait for completion
      await promise;
      
      await waitFor(() => {
        expect(result.current.state).toBe('complete');
        expect(result.current.isGenerating).toBe(false);
      });
    });
    
    it('should clear results and reset to idle', async () => {
      const { result } = renderHook(() => useOutputGenerator());
      
      const form = createDefaultForm();
      form.application = { id: 'test', name: 'Test', notificationHeader: 'Test' };
      form.changeNumber = 'CHG123';
      form.releaseVersion = 'v1.0.0';
      form.environment = 'PROD';
      
      mockValidateBatch.mockReturnValue({ isValid: true, errors: [] });
      mockBuildArtifactBundles.mockReturnValue([{
        formId: form.formId,
        htmlContent: '<html>Test</html>',
        fileName: 'test',
        formData: form
      }]);
      mockDeliverArtifacts.mockResolvedValue({
        total: 3,
        successful: 3,
        failed: 0,
        errors: [],
        popupBlocked: false
      });
      
      // Generate outputs
      await result.current.generateOutputs([form], 'Dark Mode', false);
      
      await waitFor(() => {
        expect(result.current.state).toBe('complete');
        expect(result.current.deliveryResult).not.toBeNull();
      });
      
      // Clear results using act
      await waitFor(() => {
        result.current.clearResults();
      });
      
      // Should return to idle state with no results
      await waitFor(() => {
        expect(result.current.state).toBe('idle');
        expect(result.current.validationResult).toBeNull();
        expect(result.current.deliveryResult).toBeNull();
        expect(result.current.isGenerating).toBe(false);
      });
    });
  });
});
