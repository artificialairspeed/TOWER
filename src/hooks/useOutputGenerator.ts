/**
 * useOutputGenerator Hook
 * 
 * Orchestrates the output generation workflow:
 * 1. Validates all deployment forms
 * 2. Builds artifact bundles with collision handling
 * 3. Delivers artifacts sequentially
 * 4. Reports results and errors
 * 
 * Task: 17.1
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 13.3, 13.4
 */

import { useState, useCallback } from 'react';
import type { DeploymentFormData, Theme, ValidationResult, DeliveryResult } from '../types/models';
import { validateBatch } from '../utils/validators';
import { buildArtifactBundles } from '../utils/bundleBuilder';
import { deliverArtifacts } from '../utils/sequentialDelivery';

/**
 * Generation state tracking
 */
export type GenerationState = 
  | 'idle'        // Not generating, ready to start
  | 'validating'  // Running validation
  | 'generating'  // Building artifact bundles
  | 'delivering'  // Delivering artifacts
  | 'complete'    // Generation completed (success or partial success)
  | 'error';      // Generation failed at validation stage

/**
 * Return type for useOutputGenerator hook
 */
export interface OutputGeneratorState {
  /** Current generation state */
  state: GenerationState;
  
  /** Validation result (populated if validation fails) */
  validationResult: ValidationResult | null;
  
  /** Delivery result (populated after delivery completes) */
  deliveryResult: DeliveryResult | null;
  
  /** Generate outputs for all forms */
  generateOutputs: (
    forms: DeploymentFormData[],
    theme: Theme | null,
    catalogEmpty: boolean
  ) => Promise<void>;
  
  /** Clear results and reset to idle state */
  clearResults: () => void;
  
  /** Whether generation is in progress */
  isGenerating: boolean;
  
  /** Current progress for multi-form generation */
  progress: {
    current: number;
    total: number;
  } | null;
}

/**
 * Custom hook for orchestrating output generation
 * 
 * Workflow:
 * 1. Validate all forms using validateBatch (Requirements 10.2, 10.3)
 * 2. If validation fails:
 *    - Display all errors per form/field (Requirement 10.3)
 *    - Block generation
 *    - Preserve all entered state
 * 3. If validation passes:
 *    - Build artifact bundles with collision handling (Requirements 10.4, 14.1-14.4)
 *    - Deliver artifacts sequentially (Requirements 10.5, 10.6, 10.7, 13.1, 13.2)
 * 4. Report results:
 *    - Success message
 *    - Popup blocked notice (Requirement 13.3)
 *    - Artifact failure notices (Requirements 10.8, 13.4)
 * 
 * @returns OutputGeneratorState with generation control and results
 */
export function useOutputGenerator(): OutputGeneratorState {
  const [state, setState] = useState<GenerationState>('idle');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  
  /**
   * Generate outputs for all deployment forms
   * 
   * Requirements:
   * - 10.1: Single Generate Outputs control
   * - 10.2: Validate every form before generating any artifact
   * - 10.3: Block generation if any form fails validation, display errors
   * - 10.4-10.7: Generate HTML, PDF, PNG for each form
   * - 10.8: Block delivery if generation fails, display error
   * - 13.3, 13.4: Continue on individual failures, report errors
   */
  const generateOutputs = useCallback(
    async (
      forms: DeploymentFormData[],
      theme: Theme | null,
      catalogEmpty: boolean
    ): Promise<void> => {
      try {
        // Step 1: Validation (Requirements 10.2, 10.3)
        setState('validating');
        setValidationResult(null);
        setDeliveryResult(null);
        setProgress(null);
        
        const validation = validateBatch(forms, theme, catalogEmpty);
        
        if (!validation.isValid) {
          // Validation failed: block generation, display errors, preserve state
          // Requirement 10.3
          setState('error');
          setValidationResult(validation);
          return;
        }
        
        // Step 2: Build artifact bundles (Requirements 10.4, 14.1-14.4)
        setState('generating');
        
        // Theme is guaranteed to be non-null here due to validation
        // TypeScript guard for type safety
        if (!theme) {
          throw new Error('Theme is required but was not validated');
        }
        
        const bundles = buildArtifactBundles(forms, theme);
        
        // Step 3: Deliver artifacts sequentially (Requirements 10.5-10.7, 13.1-13.4)
        setState('delivering');
        
        // Initialize progress tracking for multi-form generation
        const totalArtifacts = forms.length; // 1 artifact per form (PNG opened in a new tab)
        setProgress({ current: 0, total: totalArtifacts });
        
        // Deliver artifacts with progress callback
        const delivery = await deliverArtifacts(bundles, (current) => {
          setProgress({ current, total: totalArtifacts });
        });
        
        // Step 4: Report results
        setState('complete');
        setDeliveryResult(delivery);
        setProgress(null); // Clear progress when complete
        
      } catch (error) {
        // Generation or delivery failed unexpectedly
        // Requirement 10.8: Display error, retain metadata
        setState('error');
        setProgress(null);
        
        // Create a synthetic delivery result for the error case
        setDeliveryResult({
          total: forms.length,
          successful: 0,
          failed: forms.length,
          errors: [{
            formId: '_system',
            artifactType: 'PNG',
            message: `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
            error: error instanceof Error ? error : new Error(String(error))
          }],
          popupBlocked: false
        });
      }
    },
    []
  );
  
  /**
   * Clear results and reset to idle state
   * 
   * Allows the user to dismiss results and prepare for another generation.
   */
  const clearResults = useCallback(() => {
    setState('idle');
    setValidationResult(null);
    setDeliveryResult(null);
    setProgress(null);
  }, []);
  
  // Derived state: whether generation is in progress
  const isGenerating = state === 'validating' || state === 'generating' || state === 'delivering';
  
  return {
    state,
    validationResult,
    deliveryResult,
    generateOutputs,
    clearResults,
    isGenerating,
    progress
  };
}
