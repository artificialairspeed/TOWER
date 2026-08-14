/**
 * DeploymentQueueRow Component Examples
 * 
 * This file demonstrates various usage patterns for the DeploymentQueueRow component.
 */

import { DeploymentQueueRow } from './DeploymentQueueRow';
import { createDefaultForm } from '../data/formFactory';
import { APPLICATION_CATALOG } from '../types/models';
import type { DeploymentFormData, ValidationError } from '../types/models';

/**
 * Example 1: Basic Usage
 * Single queue row with default form data
 */
function BasicExample() {
  const formData = createDefaultForm();
  
  return (
    <DeploymentQueueRow
      formData={formData}
      position={1}
      onUpdate={(updates) => console.log('Form updated:', updates)}
      onReset={() => console.log('Form reset')}
      onRemove={() => console.log('Form removed')}
      canRemove={false}
    />
  );
}

/**
 * Example 2: Queue Row with Application Selected
 * Shows how the row looks with an application and environment selected
 */
function WithApplicationExample() {
  const formData: DeploymentFormData = {
    ...createDefaultForm(),
    application: APPLICATION_CATALOG[0], // Crew Portal
    environment: 'PROD',
    changeNumber: 'CHG12345',
    releaseVersion: 'v1.2.3',
    deploymentDate: new Date('2024-12-25')
  };
  
  return (
    <DeploymentQueueRow
      formData={formData}
      position={1}
      onUpdate={(updates) => console.log('Form updated:', updates)}
      onReset={() => console.log('Form reset')}
      onRemove={() => console.log('Form removed')}
      canRemove={true}
    />
  );
}

/**
 * Example 3: Queue Row with Validation Errors
 * Demonstrates error state display
 */
function WithErrorsExample() {
  const formData = createDefaultForm();
  
  const validationErrors: ValidationError[] = [
    { formId: formData.formId, field: 'changeNumber', message: 'Change number is required' },
    { formId: formData.formId, field: 'contactEmail', message: 'Invalid email format' }
  ];
  
  return (
    <DeploymentQueueRow
      formData={formData}
      position={1}
      onUpdate={(updates) => console.log('Form updated:', updates)}
      onReset={() => console.log('Form reset')}
      onRemove={() => console.log('Form removed')}
      canRemove={true}
      validationErrors={validationErrors}
      onClearFieldError={(field) => console.log('Clear error for:', field)}
    />
  );
}

/**
 * Example 4: Multiple Queue Rows
 * Shows a complete queue with multiple deployments
 */
function MultipleRowsExample() {
  const forms: DeploymentFormData[] = [
    {
      ...createDefaultForm(),
      formId: 'form-1',
      application: APPLICATION_CATALOG[0],
      environment: 'PROD',
      changeNumber: 'CHG12345',
      deploymentDate: new Date('2024-12-25')
    },
    {
      ...createDefaultForm(),
      formId: 'form-2',
      application: APPLICATION_CATALOG[1],
      environment: 'QA',
      changeNumber: 'CHG12346',
      deploymentDate: new Date('2024-12-26')
    },
    {
      ...createDefaultForm(),
      formId: 'form-3',
      // No application selected
      deploymentDate: new Date('2024-12-27')
    }
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {forms.map((formData, index) => (
        <DeploymentQueueRow
          key={formData.formId}
          formData={formData}
          position={index + 1}
          onUpdate={(updates) => console.log(`Form ${formData.formId} updated:`, updates)}
          onReset={() => console.log(`Form ${formData.formId} reset`)}
          onRemove={() => console.log(`Form ${formData.formId} removed`)}
          canRemove={forms.length > 1}
        />
      ))}
    </div>
  );
}

/**
 * Example 5: Mixed State Queue
 * Some rows with errors, some expanded, showing realistic usage
 */
function MixedStateExample() {
  const forms = [
    {
      ...createDefaultForm(),
      formId: 'form-1',
      application: APPLICATION_CATALOG[0],
      environment: 'PROD' as const,
      changeNumber: 'CHG12345',
      deploymentDate: new Date('2024-12-25')
    },
    {
      ...createDefaultForm(),
      formId: 'form-2',
      application: APPLICATION_CATALOG[1],
      environment: 'QA' as const,
      changeNumber: '', // Missing - will have error
      deploymentDate: new Date('2024-12-26')
    },
    {
      ...createDefaultForm(),
      formId: 'form-3',
      application: APPLICATION_CATALOG[2],
      environment: 'DEV' as const,
      changeNumber: 'CHG12347',
      deploymentDate: new Date('2024-12-27')
    }
  ];
  
  const errorsMap: Record<string, ValidationError[]> = {
    'form-2': [
      { formId: 'form-2', field: 'changeNumber', message: 'Change number is required' },
      { formId: 'form-2', field: 'releaseVersion', message: 'Release version is required' }
    ]
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {forms.map((formData, index) => (
        <DeploymentQueueRow
          key={formData.formId}
          formData={formData}
          position={index + 1}
          onUpdate={(updates) => console.log(`Update form ${formData.formId}:`, updates)}
          onReset={() => console.log(`Reset form ${formData.formId}`)}
          onRemove={() => console.log(`Remove form ${formData.formId}`)}
          canRemove={forms.length > 1}
          validationErrors={errorsMap[formData.formId] || []}
          onClearFieldError={(field) => console.log(`Clear error ${field} in ${formData.formId}`)}
        />
      ))}
    </div>
  );
}

/**
 * Example 6: Programmatic Expand/Collapse
 * While the component manages its own expand state internally,
 * you can implement external controls by wrapping the component
 */
function ProgrammaticControlExample() {
  // Note: The DeploymentQueueRow manages its own expanded state internally.
  // If you need external control, consider adding an `isExpanded` prop
  // or using a controlled component pattern.
  
  const formData = {
    ...createDefaultForm(),
    application: APPLICATION_CATALOG[0],
    environment: 'PROD' as const
  };
  
  return (
    <div>
      <p>Click the row to expand/collapse. The component manages this internally.</p>
      <DeploymentQueueRow
        formData={formData}
        position={1}
        onUpdate={(updates) => console.log('Updated:', updates)}
        onReset={() => console.log('Reset')}
        onRemove={() => console.log('Removed')}
        canRemove={true}
      />
    </div>
  );
}

// Export all examples
export {
  BasicExample,
  WithApplicationExample,
  WithErrorsExample,
  MultipleRowsExample,
  MixedStateExample,
  ProgrammaticControlExample
};
