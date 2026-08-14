// Cypress support file for E2E tests

// Suppress specific errors that we don't want to fail the test
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Error reading')
  ) {
    return false;
  }
  return true;
});
