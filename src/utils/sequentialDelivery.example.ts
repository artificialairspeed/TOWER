/**
 * Example Usage: Sequential Delivery Pacer
 * 
 * This file demonstrates how to use the sequential delivery pacer to deliver
 * HTML tabs and PDF/PNG downloads with 500ms intervals.
 * 
 * Task: 16.2
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

import { deliverArtifacts } from './sequentialDelivery';
import { buildArtifactBundles } from './bundleBuilder';
import type { DeploymentFormData, Theme } from '../types/models';

/**
 * Example 1: Basic sequential delivery for a single form
 * 
 * This is the simplest use case: generate and deliver artifacts for one form.
 */
export async function example1_SingleFormDelivery(
  form: DeploymentFormData,
  theme: Theme
) {
  console.log('Example 1: Single Form Delivery');
  console.log('================================\n');

  // Step 1: Build artifact bundles (generates HTML content and file names)
  const bundles = buildArtifactBundles([form], theme);
  console.log(`Built ${bundles.length} artifact bundle(s)`);

  // Step 2: Deliver artifacts sequentially
  console.log('Starting sequential delivery...');
  const result = await deliverArtifacts(bundles);

  // Step 3: Check results
  console.log(`\nDelivery complete!`);
  console.log(`- Total artifacts: ${result.total} (should be 3)`);
  console.log(`- Successful: ${result.successful}`);
  console.log(`- Failed: ${result.failed}`);
  console.log(`- Popup blocked: ${result.popupBlocked}`);

  if (result.errors.length > 0) {
    console.log('\nErrors encountered:');
    result.errors.forEach(error => {
      console.log(`  - ${error.artifactType} for form ${error.formId}: ${error.message}`);
    });
  }

  return result;
}

/**
 * Example 2: Multiple forms with sequential delivery
 * 
 * This demonstrates the main use case: multiple deployment forms
 * generating 3 artifacts each, all delivered sequentially with 500ms intervals.
 * 
 * Requirements: 13.1, 13.2
 */
export async function example2_MultipleFormsDelivery(
  forms: DeploymentFormData[],
  theme: Theme
) {
  console.log('Example 2: Multiple Forms Delivery');
  console.log('===================================\n');

  // Step 1: Build artifact bundles for all forms
  const bundles = buildArtifactBundles(forms, theme);
  console.log(`Built ${bundles.length} artifact bundles`);
  console.log(`Total artifacts to deliver: ${bundles.length * 3}`);
  console.log(`Estimated delivery time: ${(bundles.length * 3 - 1) * 500}ms\n`);

  // Step 2: Deliver artifacts sequentially
  // The pacer will:
  // 1. Open HTML tab for form 1
  // 2. Wait 500ms
  // 3. Download PDF for form 1
  // 4. Wait 500ms
  // 5. Download PNG for form 1
  // 6. Wait 500ms
  // 7. Open HTML tab for form 2
  // ... and so on
  console.log('Starting sequential delivery with 500ms intervals...');
  const startTime = Date.now();
  const result = await deliverArtifacts(bundles);
  const duration = Date.now() - startTime;

  // Step 3: Report results
  console.log(`\nDelivery complete in ${duration}ms!`);
  console.log(`- Delivered: ${result.successful}/${result.total} artifacts`);
  console.log(`- Failed: ${result.failed}`);

  if (result.popupBlocked) {
    console.log('\n⚠️  Some HTML tabs were blocked by the browser');
    console.log('   Please allow pop-ups and try again');
  }

  return result;
}

/**
 * Example 3: Error handling - continue on failures
 * 
 * This demonstrates the robust error handling: if one artifact fails,
 * the pacer continues with the remaining artifacts.
 * 
 * Requirements: 13.3, 13.4
 */
export async function example3_ErrorHandling(
  forms: DeploymentFormData[],
  theme: Theme
) {
  console.log('Example 3: Error Handling');
  console.log('=========================\n');

  const bundles = buildArtifactBundles(forms, theme);
  
  console.log('Delivering artifacts with potential failures...');
  const result = await deliverArtifacts(bundles);

  // Analyze results
  console.log(`\nDelivery Results:`);
  console.log(`- Total: ${result.total}`);
  console.log(`- Successful: ${result.successful}`);
  console.log(`- Failed: ${result.failed}`);

  if (result.failed > 0) {
    console.log(`\n❌ ${result.failed} artifact(s) failed:`);
    
    // Group errors by type
    const htmlErrors = result.errors.filter(e => e.artifactType === 'HTML');
    const pdfErrors = result.errors.filter(e => e.artifactType === 'PDF');
    const pngErrors = result.errors.filter(e => e.artifactType === 'PNG');

    if (htmlErrors.length > 0) {
      console.log(`\n  HTML Tabs (${htmlErrors.length} failed):`);
      htmlErrors.forEach(err => {
        console.log(`    - Form ${err.formId}: ${err.message}`);
      });
    }

    if (pdfErrors.length > 0) {
      console.log(`\n  PDF Downloads (${pdfErrors.length} failed):`);
      pdfErrors.forEach(err => {
        console.log(`    - Form ${err.formId}: ${err.message}`);
      });
    }

    if (pngErrors.length > 0) {
      console.log(`\n  PNG Downloads (${pngErrors.length} failed):`);
      pngErrors.forEach(err => {
        console.log(`    - Form ${err.formId}: ${err.message}`);
      });
    }
  } else {
    console.log('\n✅ All artifacts delivered successfully!');
  }

  return result;
}

/**
 * Example 4: Maximum capacity - 5 forms
 * 
 * This demonstrates the maximum scenario: 5 forms generating 15 total artifacts,
 * all delivered sequentially with proper spacing.
 */
export async function example4_MaximumCapacity(
  forms: DeploymentFormData[],
  theme: Theme
) {
  console.log('Example 4: Maximum Capacity (5 Forms)');
  console.log('======================================\n');

  if (forms.length !== 5) {
    console.warn(`⚠️  Expected 5 forms, got ${forms.length}`);
  }

  const bundles = buildArtifactBundles(forms, theme);
  console.log(`Processing maximum capacity: ${bundles.length} forms`);
  console.log(`Total artifacts: ${bundles.length * 3}`);
  console.log(`Minimum delivery time: ${(bundles.length * 3 - 1) * 500}ms (${((bundles.length * 3 - 1) * 500) / 1000}s)\n`);

  console.log('Sequential delivery order:');
  bundles.forEach((bundle, i) => {
    const baseDelay = i * 3 * 500; // Each form starts after previous form's 3 artifacts + delays
    console.log(`  Form ${i + 1} (${bundle.formId}):`);
    console.log(`    - HTML tab at ~${baseDelay}ms`);
    console.log(`    - PDF download at ~${baseDelay + 500}ms`);
    console.log(`    - PNG download at ~${baseDelay + 1000}ms`);
  });

  console.log('\nStarting delivery...');
  const result = await deliverArtifacts(bundles);

  console.log(`\nDelivery complete!`);
  console.log(`- Successful: ${result.successful}/15`);
  console.log(`- Failed: ${result.failed}`);

  return result;
}

/**
 * Example 5: User feedback during delivery
 * 
 * This shows how to provide real-time feedback to users during
 * the sequential delivery process.
 */
export async function example5_UserFeedback(
  forms: DeploymentFormData[],
  theme: Theme,
  onProgress?: (message: string) => void
) {
  console.log('Example 5: User Feedback During Delivery');
  console.log('=========================================\n');

  const bundles = buildArtifactBundles(forms, theme);
  const totalArtifacts = bundles.length * 3;

  onProgress?.(`Starting delivery of ${totalArtifacts} artifacts...`);

  // Start delivery
  const result = await deliverArtifacts(bundles);

  // Provide final feedback
  if (result.successful === totalArtifacts) {
    onProgress?.(`✅ All ${totalArtifacts} artifacts delivered successfully!`);
  } else if (result.failed > 0) {
    onProgress?.(
      `⚠️  Delivered ${result.successful}/${totalArtifacts} artifacts. ${result.failed} failed.`
    );
  }

  if (result.popupBlocked) {
    onProgress?.(
      '⚠️  Some HTML tabs were blocked. Please allow pop-ups and try again.'
    );
  }

  return result;
}

/**
 * Example 6: Integration with validation
 * 
 * This shows the typical integration pattern: validate forms first,
 * then build bundles, then deliver sequentially.
 */
export async function example6_CompleteWorkflow(
  forms: DeploymentFormData[],
  theme: Theme,
  catalogEmpty: boolean
) {
  console.log('Example 6: Complete Workflow');
  console.log('============================\n');

  // Step 1: Import validation (would be done at top in real code)
  const { validateBatch } = await import('./validators');

  // Step 2: Validate all forms
  console.log('Step 1: Validating forms...');
  const validation = validateBatch(forms, theme, catalogEmpty);

  if (!validation.isValid) {
    console.error(`❌ Validation failed with ${validation.errors.length} error(s):`);
    validation.errors.forEach(error => {
      console.error(`  - Form ${error.formId}, field ${error.field}: ${error.message}`);
    });
    throw new Error('Validation failed. Cannot proceed with artifact generation.');
  }
  console.log('✅ All forms validated successfully\n');

  // Step 3: Build artifact bundles
  console.log('Step 2: Building artifact bundles...');
  const bundles = buildArtifactBundles(forms, theme);
  console.log(`✅ Built ${bundles.length} bundles\n`);

  // Step 4: Deliver artifacts sequentially
  console.log('Step 3: Delivering artifacts sequentially...');
  const result = await deliverArtifacts(bundles);
  console.log(`✅ Delivery complete: ${result.successful}/${result.total} artifacts delivered\n`);

  // Step 5: Return results for UI to display
  return {
    validation,
    bundles,
    delivery: result,
    success: result.failed === 0
  };
}
