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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CloudDownload as GenerateIcon,
  RestartAlt as ClearIcon,
} from '@mui/icons-material';
import { FormManager } from './components/FormManager';
import { AppThemeProvider, darkTokens } from './theme/AppThemeProvider';
import { useValidationErrors } from './hooks/useValidationErrors';
import { useFormManager } from './hooks/useFormManager';
import { useResetConfirmation } from './hooks/useResetConfirmation';
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
 * 3. Form manager with the deployment form
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
  // Form management hook — single source of truth
  const { form, updateForm, clearForm } = useFormManager();

  // Validation error management hook
  const { getAllErrors, clearFieldError, setErrors, setFieldError, clearAllErrors } =
    useValidationErrors();

  // Output generation hook (Requirements: 10.1-10.8, 13.1-13.4)
  const {
    state: generationState,
    validationResult,
    deliveryResult,
    generateOutputs,
    clearResults,
    isGenerating,
  } = useOutputGenerator();

  // Reset handler for "Start New": clearing the form must also clear any
  // outstanding validation state so the user truly returns to a blank slate.
  // This wipes form data, per-field validation errors, and the generation
  // validation summary / delivery results in one step.
  const handleStartNew = React.useCallback(() => {
    clearForm();
    clearAllErrors();
    clearResults();
  }, [clearForm, clearAllErrors, clearResults]);

  // Confirmation flow for clearing the form and starting fresh. The reset is
  // destructive (discards entered + persisted data), so it is gated behind a
  // confirmation dialog.
  const {
    isOpen: isClearConfirmOpen,
    initiateReset: initiateClear,
    confirmReset: confirmClear,
    cancelReset: cancelClear,
  } = useResetConfirmation('form', handleStartNew);

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
   * Generates from the same `form` the user is editing.
   */
  const handleGenerateOutputs = React.useCallback(async () => {
    await generateOutputs(form, isCatalogEmpty);
  }, [generateOutputs, form, isCatalogEmpty]);

  // Update validation errors when validation fails
  React.useEffect(() => {
    if (validationResult && !validationResult.isValid) {
      setErrors(validationResult.errors);
    }
  }, [validationResult, setErrors]);

  const generationSucceeded = deliveryResult?.failed === 0;

  return (
    <AppThemeProvider>
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="img"
                src="/southwest-logo.svg"
                alt="Southwest"
                sx={{
                  height: { xs: 30, sm: 36 },
                  width: 'auto',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  TOWER
                </Typography>
              </Box>
            </Box>

            {/* Header actions: Start New (clear) + Generate Flight Plan */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                ml: 'auto',
              }}
            >
              {/* Clear the form and start fresh */}
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ClearIcon />}
                onClick={initiateClear}
                disabled={isGenerating}
                aria-label="Clear the form and start over"
                data-testid="clear-forms-button"
              >
                Start New
              </Button>

              {/* Generate Flight Plan - Requirement: 10.1 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'flex-start', sm: 'flex-end' },
                  gap: 0.5,
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
                disabled={isCatalogEmpty || isGenerating || !templatesReady}
                aria-label={
                  isCatalogEmpty
                    ? 'Cannot generate outputs: application catalog is empty'
                    : !templatesReady
                    ? 'Cannot generate outputs: the flight plan template is still loading'
                    : isGenerating
                    ? 'Generating outputs, please wait'
                    : 'Generate the deployment notification output'
                }
                aria-busy={isGenerating}
                data-testid="generate-outputs-button"
                sx={{
                  backgroundColor: darkTokens.swaYellow,
                  color: darkTokens.swaYellowContrast,
                  '& .MuiButton-startIcon': {
                    color: darkTokens.swaYellowContrast,
                  },
                  '&:hover': {
                    backgroundColor: darkTokens.swaYellowDark,
                    boxShadow: `0 4px 12px rgba(255, 191, 0, 0.25)`,
                  },
                }}
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
            {validationResult.errors.length === 1 ? 's' : ''} attention. Review and correct the
            highlighted fields before generating outputs.
          </Alert>
        )}

        {/* Form Manager — single source of truth for form state */}
        <FormManager
          form={form}
          onUpdateForm={updateForm}
          validationErrors={getAllErrors()}
          onClearFieldError={clearFieldError}
          onBlurValidate={handleBlurValidate}
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
                <AlertTitle sx={{ fontWeight: 600 }}>
                  {generationSucceeded
                    ? 'Flight Plan Dispatched'
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
                        Failed to generate {error.artifactType}: {error.message}
                      </li>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Alert>
        </Snackbar>

        {/* Clear-form confirmation. Clearing discards all entered data and the
            copy saved in the browser, so the user must confirm before it
            happens. */}
        <Dialog
          open={isClearConfirmOpen}
          onClose={cancelClear}
          aria-labelledby="clear-forms-dialog-title"
          aria-describedby="clear-forms-dialog-description"
        >
          <DialogTitle id="clear-forms-dialog-title">Start a new form?</DialogTitle>
          <DialogContent>
            <DialogContentText id="clear-forms-dialog-description">
              This clears the deployment form and the data saved in your browser,
              returning you to an empty form. This can&apos;t be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelClear} color="inherit" data-testid="clear-forms-cancel">
              Cancel
            </Button>
            <Button
              onClick={confirmClear}
              color="error"
              variant="contained"
              autoFocus
              data-testid="clear-forms-confirm"
            >
              Clear form
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppThemeProvider>
  );
}

export default App;
