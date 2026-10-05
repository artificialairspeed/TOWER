/**
 * useOutputGenerator Hook
 *
 * Orchestrates the output generation workflow for the deployment form:
 * 1. Validates the form
 * 2. Builds the artifact bundle
 * 3. Delivers the artifact
 * 4. Reports results and errors
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 13.3, 13.4
 */

import { useState, useCallback } from 'react';
import type { DeploymentFormData, ValidationResult, DeliveryResult } from '../types/models';
import { validateForGeneration } from '../utils/validators';
import { buildArtifactBundle } from '../utils/bundleBuilder';
import { deliverArtifact } from '../utils/artifactDelivery';

/**
 * Generation state tracking
 */
export type GenerationState =
  | 'idle'        // Not generating, ready to start
  | 'validating'  // Running validation
  | 'generating'  // Building the artifact bundle
  | 'delivering'  // Delivering the artifact
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

  /** Generate outputs for the form */
  generateOutputs: (form: DeploymentFormData, catalogEmpty: boolean) => Promise<void>;

  /** Clear results and reset to idle state */
  clearResults: () => void;

  /** Whether generation is in progress */
  isGenerating: boolean;
}

/**
 * Custom hook for orchestrating output generation
 *
 * Workflow:
 * 1. Validate the form using validateForGeneration (Requirements 10.2, 10.3)
 * 2. If validation fails:
 *    - Display all errors per field (Requirement 10.3)
 *    - Block generation
 *    - Preserve all entered state
 * 3. If validation passes:
 *    - Build the artifact bundle (Requirement 10.4)
 *    - Deliver the artifact (Requirements 10.5, 10.6, 10.7, 13.1, 13.2)
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

  /**
   * Generate outputs for the deployment form
   *
   * Requirements:
   * - 10.1: Single Generate Outputs control
   * - 10.2: Validate the form before generating any artifact
   * - 10.3: Block generation if the form fails validation, display errors
   * - 10.4-10.7: Generate the artifact for the form
   * - 10.8: Block delivery if generation fails, display error
   * - 13.3, 13.4: Report errors
   */
  const generateOutputs = useCallback(
    async (form: DeploymentFormData, catalogEmpty: boolean): Promise<void> => {
      try {
        // Step 1: Validation (Requirements 10.2, 10.3)
        setState('validating');
        setValidationResult(null);
        setDeliveryResult(null);

        const validation = validateForGeneration(form, catalogEmpty);

        if (!validation.isValid) {
          // Validation failed: block generation, display errors, preserve state
          // Requirement 10.3
          setState('error');
          setValidationResult(validation);
          return;
        }

        // Step 2: Build the artifact bundle (Requirement 10.4)
        setState('generating');

        const bundle = buildArtifactBundle(form);

        // Step 3: Deliver the artifact (Requirements 10.5-10.7, 13.1-13.4)
        setState('delivering');

        const delivery = await deliverArtifact(bundle);

        // Step 4: Report results
        setState('complete');
        setDeliveryResult(delivery);

      } catch (error) {
        // Generation or delivery failed unexpectedly
        // Requirement 10.8: Display error, retain metadata
        setState('error');

        // Create a synthetic delivery result for the error case
        setDeliveryResult({
          total: 1,
          successful: 0,
          failed: 1,
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
  }, []);

  // Derived state: whether generation is in progress
  const isGenerating = state === 'validating' || state === 'generating' || state === 'delivering';

  return {
    state,
    validationResult,
    deliveryResult,
    generateOutputs,
    clearResults,
    isGenerating
  };
}
