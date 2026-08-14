import React from 'react';
import {
  Container,
  Box,
  Alert,
  AlertTitle,
  Typography,
  Snackbar,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  FlightTakeoff as AppIcon,
  CloudDownload as GenerateIcon,
} from '@mui/icons-material';
import { FormManager } from './components/FormManager';
import { AppThemeProvider } from './theme/AppThemeProvider';
import { useValidationErrors } from './hooks/useValidationErrors';
import { useFormManager } from './hooks/useFormManager';
import { useOutputGenerator } from './hooks/useOutputGenerator';
import { APPLICATION_CATALOG } from './types/models';
import { templateProvider } from './utils/templateProvider';
import { validateFieldOnBlur } from './utils/validators';

/**
 * Main application component
 *
 * Provides the overall structure of the portal:
 * 1. Header with title
 * 2. Empty catalog warning (if applicable)
 * 3. Form manager with all deployment forms
 * 4. Generate Outputs action + result notifications
 *
 * The portal UI (and all generated artifacts) are dark-mode only.
 *
 * Form state is owned here and passed down to FormManager so that a single
 * source of truth drives both editing and output generation.
 *
 * Requirements:
 * - 2.7, 2.8: Empty catalog handling
 * - 10.1-10.8: Output generation workflow
 * - 13.3, 13.4: Error reporting and recovery
 */
function App() {
  // Portal UI is always in Dark Mode (app + outputs)
  const theme = 'Dark Mode' as const;

  // Form management hook — single source of truth (Requirements: 1.1-1.11)
  const {
    forms,
    lastAddedFormId,
    addForm,
    removeForm,
    updateForm,
    canAddForm,
    canRemoveForm,
  } = useFormManager();

  // Validation error management hook
  const { getAllErrors, clearFieldError, setErrors, setFieldError } = useValidationErrors();

  // Output generation hook (Requirements: 10.1-10.8, 13.1-13.4)
  const {
    state: generationState,
    validationResult,
    deliveryResult,
    generateOutputs,
    clearResults,
    isGenerating,
    progress,
  } = useOutputGenerator();

  // Check if application catalog is empty (Requirements: 2.7, 2.8)
  const isCatalogEmpty = APPLICATION_CATALOG.length === 0;

  /**
   * Handle field blur validation — validates a single field immediately
   * and sets/clears errors in real time as the user leaves fields.
   */
  const handleBlurValidate = React.useCallback(
    (formId: string, field: string, value: string) => {
      const error = validateFieldOnBlur(field, value);
      if (error) {
        setFieldError(formId, field, error);
      } else {
        clearFieldError(formId, field);
      }
    },
    [setFieldError, clearFieldError]
  );

  // Template load state (Requirement: 1.6). `templatesReady` tracks whether the
  // HTML templates have been successfully loaded; `templateError` holds a
  // user-visible message when loading fails so the UI can surface it with a
  // retry affordance (rendered in task 3.2).
  const [templateError, setTemplateError] = React.useState<string | null>(null);
  const [templatesReady, setTemplatesReady] = React.useState<boolean>(
    templateProvider.isLoaded()
  );

  // Load HTML templates so that artifact generation (which uses the synchronous
  // generateHTML) has templates available when the user clicks Generate Flight
  // Plan. On failure, surface a recoverable error; because initialize() resets
  // its cached promise on failure, invoking this again starts a fresh attempt
  // without a full page reload (Requirement 1.6). Safe to call repeatedly; it's
  // a no-op once loaded.
  const loadTemplates = React.useCallback(() => {
    setTemplateError(null);
    templateProvider
      .initialize()
      .then(() => setTemplatesReady(true))
      .catch((error) => {
        console.error('Failed to load HTML templates:', error);
        setTemplateError('Failed to load templates. Please retry.');
      });
  }, []);

  // Trigger template loading whenever templates are not yet ready.
  React.useEffect(() => {
    if (!templatesReady) {
      loadTemplates();
    }
  }, [templatesReady, loadTemplates]);

  /**
   * Handle Generate Outputs button click.
   * Generates from the same `forms` the user is editing.
   */
  const handleGenerateOutputs = async () => {
    await generateOutputs(forms, theme, isCatalogEmpty);
  };

  // Update validation errors when validation fails
  React.useEffect(() => {
    if (validationResult && !validationResult.isValid) {
      setErrors(validationResult.errors);
    }
  }, [validationResult, setErrors]);

  const generationSucceeded = deliveryResult?.failed === 0;

  return (
    <AppThemeProvider theme={theme}>
      {/* App Header */}
      <Box
        component="header"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2.5,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AppIcon color="primary" sx={{ fontSize: { xs: 48, sm: 56 } }} aria-hidden="true" />
              <Box>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                  TOWER
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Takeoff Notifications for Technology Deployments
                </Typography>
              </Box>
            </Box>

            {/* Generate Flight Plan - Requirement: 10.1 */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', sm: 'flex-end' },
                gap: 0.5,
                ml: 'auto',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  isGenerating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <GenerateIcon />
                  )
                }
                onClick={handleGenerateOutputs}
                disabled={isCatalogEmpty || isGenerating}
                aria-label={
                  isCatalogEmpty
                    ? 'Cannot generate outputs: application catalog is empty'
                    : isGenerating
                    ? 'Generating outputs, please wait'
                    : 'Generate HTML, PDF, and PNG outputs for all forms'
                }
                aria-busy={isGenerating}
                data-testid="generate-outputs-button"
              >
                {isGenerating ? 'Generating...' : 'Generate Flight Plan'}
              </Button>
              {isCatalogEmpty && (
                <Typography variant="caption" color="error" role="alert">
                  No applications available
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Template load error with in-page retry (Requirement: 1.6).
            Surfaces a user-visible indication that template loading failed and
            provides a Retry affordance that re-invokes loadTemplates. Retry is
            an in-page React state transition (no full page reload); because
            templateProvider.initialize() resets its cached promise on failure,
            each Retry starts a fresh load attempt. The alert mounts only after
            an async fetch failure, so aria-live/aria-atomic ensure screen
            readers announce it when it appears (Property 1: template load
            failure is always recoverable). */}
        {templateError && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={loadTemplates}
                aria-label="Retry loading templates"
              >
                Retry
              </Button>
            }
          >
            <AlertTitle>Template load failed</AlertTitle>
            {templateError}
          </Alert>
        )}

        {/* Empty Catalog Warning - Requirements: 2.7, 2.8 */}
        {isCatalogEmpty && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>No applications available</AlertTitle>
            The application catalog is empty or failed to load. Output generation is disabled until
            applications are available.
          </Alert>
        )}

        {/* Concise validation summary. Detailed, per-field errors are shown
            inline on each form row, so this is a short call to action only. */}
        {validationResult && !validationResult.isValid && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <AlertTitle>Validation failed</AlertTitle>
            {validationResult.errors.length} issue
            {validationResult.errors.length !== 1 ? 's' : ''} need
            {validationResult.errors.length === 1 ? 's' : ''} attention. Expand the highlighted
            form{forms.length > 1 ? 's' : ''} to review and correct the fields before generating
            outputs.
          </Alert>
        )}

        {/* Form Manager — single source of truth for form state */}
        <FormManager
          forms={forms}
          lastAddedFormId={lastAddedFormId}
          onAddForm={addForm}
          onRemoveForm={removeForm}
          onUpdateForm={updateForm}
          canAddForm={canAddForm}
          canRemoveForm={canRemoveForm}
          validationErrors={getAllErrors()}
          onClearFieldError={clearFieldError}
          onBlurValidate={handleBlurValidate}
          isGenerating={isGenerating}
          progress={progress}
        />

        {/* Success / partial-failure notification (Requirements: 10.8, 13.3, 13.4)
            Success auto-hides; anything with failures stays until dismissed so
            the user can read the error details. */}
        <Snackbar
          open={
            generationState === 'complete' ||
            (generationState === 'error' && deliveryResult !== null)
          }
          autoHideDuration={generationSucceeded ? 6000 : null}
          onClose={(_event, reason) => {
            // Don't let a click-away dismiss a failure message
            if (reason === 'clickaway' && !generationSucceeded) return;
            clearResults();
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={clearResults}
            severity={generationSucceeded ? 'success' : 'warning'}
            variant="filled"
            sx={{ width: '100%', maxWidth: 560 }}
            role="alert"
            aria-live="polite"
          >
            {deliveryResult && (
              <>
                <AlertTitle sx={{ fontWeight: 'bold' }}>
                  {generationSucceeded
                    ? `${deliveryResult.successful} Flight Plans Dispatched`
                    : `Generated ${deliveryResult.successful} of ${deliveryResult.total} artifacts`}
                </AlertTitle>

                {deliveryResult.popupBlocked && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Please allow pop-ups to view HTML notifications
                  </Typography>
                )}

                {deliveryResult.errors.length > 0 && (
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                    {deliveryResult.errors.map((error, index) => (
                      <li key={index}>
                        Failed to generate {error.artifactType} for form {error.formId}:{' '}
                        {error.message}
                      </li>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Alert>
        </Snackbar>
      </Container>
    </AppThemeProvider>
  );
}

export default App;
