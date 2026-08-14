/**
 * Utils module exports
 * 
 * Centralized exports for all utility functions used throughout the application.
 */

export { 
  generateDeploymentTitle, 
  formatPhoneNumber,
  generateNotificationHeader,
  formatSchedule,
  formatYYYYMMDD,
  escapeHtml,
  renderChangeItems,
  renderImpactItems,
  renderOutageSection,
  injectTemplate
} from './formatters';
export { templateProvider, TemplateProvider } from './templateProvider';
export type { Theme } from './templateProvider';
export {
  isValidEmail,
  isValidPhone,
  trimInput,
  isNonEmpty,
  isWithinLength,
  validateForm,
  validateBatch
} from './validators';
export {
  generateBaseFileName,
  detectCollisions,
  disambiguateFileNames
} from './fileNaming';
export { useTheme } from './hooks';
export {
  generateHTML,
  generatePNG,
  openHTMLTab,
  openAndDownloadPNG
} from './artifactGeneration';
export { buildArtifactBundles } from './bundleBuilder';
export { deliverArtifacts } from './sequentialDelivery';
export {
  buildArtifactBundlesWithRecovery,
  formatGenerationError,
  getErrorSummary,
  groupErrorsByForm,
  type BundleBuildResult
} from './errorRecovery';
