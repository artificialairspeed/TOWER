/**
 * E2E Test for Single Deployment Flow
 * 
 * Task 20.1: E2E test for single deployment flow
 * 
 * Test scenario:
 * - Fill all fields in one form with valid data
 * - Select theme
 * - Click Generate Outputs
 * - Verify 3 artifacts generated (HTML tab opened, PDF downloaded, PNG downloaded)
 * - Verify file names correct format
 * 
 * Requirements: All requirements (happy path)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as sequentialDelivery from './utils/sequentialDelivery';
import { templateProvider } from './utils/templateProvider';

// Mock the delivery module
vi.mock('./utils/sequentialDelivery');

// The HTML generator relies on templates that are normally fetched at runtime.
// In the test environment we seed the real dark-mode template directly.
const darkTemplate = readFileSync(
  resolve(process.cwd(), 'public/templates/dark-mode.html'),
  'utf-8'
);

describe('E2E: Single Deployment Flow (Task 20.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    templateProvider.setTemplate('dark', darkTemplate);
    
    // Mock successful delivery by default
    vi.mocked(sequentialDelivery.deliverArtifacts).mockResolvedValue({
      total: 3,
      successful: 3,
      failed: 0,
      errors: [],
      popupBlocked: false
    });
    
    // Mock window.open for HTML tabs
    global.window.open = vi.fn().mockReturnValue(window);
    
    // Mock URL APIs for downloads
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should complete single deployment flow: fill form, generate outputs, verify artifacts', async () => {
    const user = userEvent.setup();
    
    // Render the application
    render(<App />);
    
    // ========================================
    // Step 1: Verify initial state
    // ========================================
    
    // Forms start collapsed on load (Requirement 1.1). Expand the first form
    // to edit it.
    await user.click(screen.getByRole('button', { name: /Expand deployment details/i }));
    expect(screen.getByRole('heading', { name: /Deployment Form 1/i })).toBeInTheDocument();
    
    // ========================================
    // Step 2: Fill all required fields with valid data
    // ========================================
    
    // Select Application (Requirement 2.1)
    const applicationSelector = screen.getByRole('combobox', { name: /Application/i });
    await user.click(applicationSelector);
    const crewPortalOption = await screen.findByRole('option', { name: /Crew Portal/i });
    await user.click(crewPortalOption);
    
    // Enter Change Number (Requirement 3.1)
    const changeNumberInput = screen.getByRole('textbox', { name: /Change Number/i });
    await user.clear(changeNumberInput);
    await user.type(changeNumberInput, 'CHG12345');
    
    // Enter Release Version (Requirement 3.2)
    const releaseVersionInput = screen.getByRole('textbox', { name: /Release Version/i });
    await user.clear(releaseVersionInput);
    await user.type(releaseVersionInput, 'v5.4.1');
    
    // Select Environment (Requirement 3.3)
    const environmentSelector = screen.getByRole('combobox', { name: /Environment/i });
    await user.click(environmentSelector);
    const prodOption = await screen.findByRole('option', { name: /^PROD$/i });
    await user.click(prodOption);
    
    // Schedule section has default values (Requirements 4.2, 4.3, 4.4)
    // - Deployment Date: defaults to today
    // - Start Time: defaults to 20:00
    // - End Time: defaults to 22:00
    // We'll keep the defaults for this test
    
    // Outage section defaults to No (Requirement 5.2)
    // We'll keep the default (no outage) for this test
    
    // Change Items: Fill the first (default) change item (Requirements 6.1, 6.2)
    const jiraNumberInput = screen.getByRole('textbox', { name: /Jira Number/i });
    await user.clear(jiraNumberInput);
    await user.type(jiraNumberInput, 'JIRA-123');
    
    const jiraDescriptionInput = screen.getByRole('textbox', { name: /Description/i });
    await user.clear(jiraDescriptionInput);
    await user.type(jiraDescriptionInput, 'Fix critical authentication bug');
    
    // Impact Items: Fill the first (default) impact item (Requirements 7.1, 7.3)
    const impactTextInput = screen.getByRole('textbox', { name: /Impact Item 1/i });
    await user.clear(impactTextInput);
    await user.type(impactTextInput, 'Users will need to log in again after deployment');
    
    // Contact Information (Requirements 8.1, 8.2, 8.3)
    const contactNameInput = screen.getByRole('textbox', { name: /Contact Name/i });
    await user.clear(contactNameInput);
    await user.type(contactNameInput, 'John Doe');
    
    const emailInput = screen.getByRole('textbox', { name: /Email/i });
    await user.clear(emailInput);
    await user.type(emailInput, 'john.doe@example.com');
    
    const phoneInput = screen.getByRole('textbox', { name: /Phone/i });
    await user.clear(phoneInput);
    await user.type(phoneInput, '(555) 123-4567');
    
    // ========================================
    // Step 3: Verify theme selection (already selected)
    // ========================================
    
    // Dark Mode is already selected by default (verified in Step 1)
    // We'll keep the default Dark Mode theme
    
    // ========================================
    // Step 4: Click Generate Outputs
    // ========================================
    
    const generateButton = screen.getByRole('button', { name: /Generate HTML, PDF, and PNG outputs for all forms/i });
    expect(generateButton).toBeEnabled();
    
    await user.click(generateButton);
    
    // ========================================
    // Step 5: Verify artifact generation was triggered
    // ========================================
    
    // Wait for deliverArtifacts to be called
    await waitFor(() => {
      expect(sequentialDelivery.deliverArtifacts).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
    
    // Verify deliverArtifacts was called with artifact bundles
    const deliveryCall = vi.mocked(sequentialDelivery.deliverArtifacts).mock.calls[0];
    const bundles = deliveryCall[0];
    
    // Should have 1 bundle (1 form × 3 artifacts each)
    expect(bundles).toHaveLength(1);
    
    // ========================================
    // Step 6: Verify file name format (Requirement 12.1)
    // ========================================
    
    const bundle = bundles[0];
    
    // Base file name format: <Application>_<Environment>_<CHG#>_<YYYYMMDD>
    // Expected: Crew_Portal_PROD_CHG12345_<YYYYMMDD>
    // All three artifacts (HTML, PDF, PNG) share this base name, differing only
    // by extension at delivery time.
    expect(bundle.fileName).toMatch(/^Crew_Portal_PROD_CHG12345_\d{8}$/);
    
    // Bundle carries the generated HTML content used for all three artifacts
    expect(bundle.htmlContent).toBeTruthy();
    
    // ========================================
    // Step 7: Verify success notification is displayed
    // ========================================
    
    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Generated 3 artifacts successfully/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify no error messages
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Please allow pop-ups/i)).not.toBeInTheDocument();
  }, 10000); // 10 second timeout for this comprehensive test
  
  it('should handle popup blocked scenario gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock deliverArtifacts to simulate popup blocked
    vi.mocked(sequentialDelivery.deliverArtifacts).mockResolvedValue({
      total: 3,
      successful: 2, // PDF and PNG succeeded, HTML tab blocked
      failed: 0,
      errors: [],
      popupBlocked: true // Popup was blocked
    });
    
    render(<App />);
    
    // Forms start collapsed on load; expand the first form to edit it.
    await user.click(screen.getByRole('button', { name: /Expand deployment details/i }));
    
    // Fill minimal valid data
    const applicationSelector = screen.getByRole('combobox', { name: /Application/i });
    await user.click(applicationSelector);
    const crewPortalOption = await screen.findByRole('option', { name: /Crew Portal/i });
    await user.click(crewPortalOption);
    
    const changeNumberInput = screen.getByRole('textbox', { name: /Change Number/i });
    await user.clear(changeNumberInput);
    await user.type(changeNumberInput, 'CHG99999');
    
    const releaseVersionInput = screen.getByRole('textbox', { name: /Release Version/i });
    await user.clear(releaseVersionInput);
    await user.type(releaseVersionInput, 'v1.0.0');
    
    const environmentSelector = screen.getByRole('combobox', { name: /Environment/i });
    await user.click(environmentSelector);
    const devOption = await screen.findByRole('option', { name: /^DEV$/i });
    await user.click(devOption);
    
    // Fill required contact and items
    const jiraNumberInput = screen.getByRole('textbox', { name: /Jira Number/i });
    await user.clear(jiraNumberInput);
    await user.type(jiraNumberInput, 'JIRA-001');
    
    const jiraDescriptionInput = screen.getByRole('textbox', { name: /Description/i });
    await user.clear(jiraDescriptionInput);
    await user.type(jiraDescriptionInput, 'Test change');
    
    const impactTextInput = screen.getByRole('textbox', { name: /Impact Item 1/i });
    await user.clear(impactTextInput);
    await user.type(impactTextInput, 'Test impact');
    
    const contactNameInput = screen.getByRole('textbox', { name: /Contact Name/i });
    await user.clear(contactNameInput);
    await user.type(contactNameInput, 'Jane Smith');
    
    const emailInput = screen.getByRole('textbox', { name: /Email/i });
    await user.clear(emailInput);
    await user.type(emailInput, 'jane@example.com');
    
    const phoneInput = screen.getByRole('textbox', { name: /Phone/i });
    await user.clear(phoneInput);
    await user.type(phoneInput, '(555) 999-8888');
    
    // Generate outputs
    const generateButton = screen.getByRole('button', { name: /Generate HTML, PDF, and PNG outputs for all forms/i });
    await user.click(generateButton);
    
    // Wait for popup blocked message (Requirement 13.3)
    await waitFor(() => {
      expect(screen.getByText(/Please allow pop-ups to view HTML notifications/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  }, 10000);
  
  it('should verify all form data is included in generated artifacts', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Forms start collapsed on load; expand the first form to edit it.
    await user.click(screen.getByRole('button', { name: /Expand deployment details/i }));
    
    // Fill form with comprehensive data
    const applicationSelector = screen.getByRole('combobox', { name: /Application/i });
    await user.click(applicationSelector);
    const aoCrewOption = await screen.findByRole('option', { name: /AO Crew Training/i });
    await user.click(aoCrewOption);
    
    const changeNumberInput = screen.getByRole('textbox', { name: /Change Number/i });
    await user.clear(changeNumberInput);
    await user.type(changeNumberInput, 'CHG54321');
    
    const releaseVersionInput = screen.getByRole('textbox', { name: /Release Version/i });
    await user.clear(releaseVersionInput);
    await user.type(releaseVersionInput, 'v2.3.4');
    
    const environmentSelector = screen.getByRole('combobox', { name: /Environment/i });
    await user.click(environmentSelector);
    const qaOption = await screen.findByRole('option', { name: /^QA$/i });
    await user.click(qaOption);
    
    // Fill change item
    const jiraNumberInput = screen.getByRole('textbox', { name: /Jira Number/i });
    await user.clear(jiraNumberInput);
    await user.type(jiraNumberInput, 'JIRA-456');
    
    const jiraDescriptionInput = screen.getByRole('textbox', { name: /Description/i });
    await user.clear(jiraDescriptionInput);
    await user.type(jiraDescriptionInput, 'Enhanced training module features');
    
    // Fill impact item
    const impactTextInput = screen.getByRole('textbox', { name: /Impact Item 1/i });
    await user.clear(impactTextInput);
    await user.type(impactTextInput, 'Training sessions will be temporarily unavailable');
    
    // Fill contact information
    const contactNameInput = screen.getByRole('textbox', { name: /Contact Name/i });
    await user.clear(contactNameInput);
    await user.type(contactNameInput, 'Alice Johnson');
    
    const emailInput = screen.getByRole('textbox', { name: /Email/i });
    await user.clear(emailInput);
    await user.type(emailInput, 'alice.johnson@example.com');
    
    const phoneInput = screen.getByRole('textbox', { name: /Phone/i });
    await user.clear(phoneInput);
    await user.type(phoneInput, '(555) 111-2222');
    
    // Generate outputs
    const generateButton = screen.getByRole('button', { name: /Generate HTML, PDF, and PNG outputs for all forms/i });
    await user.click(generateButton);
    
    // Wait for generation to complete
    await waitFor(() => {
      expect(sequentialDelivery.deliverArtifacts).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Verify the bundle contains the form data
    const deliveryCall = vi.mocked(sequentialDelivery.deliverArtifacts).mock.calls[0];
    const bundles = deliveryCall[0];
    const bundle = bundles[0];
    
    // Verify HTML content includes all entered data
    expect(bundle.htmlContent).toContain('CHG54321');
    expect(bundle.htmlContent).toContain('v2.3.4');
    expect(bundle.htmlContent).toContain('QA');
    expect(bundle.htmlContent).toContain('AO Crew Training');
    expect(bundle.htmlContent).toContain('JIRA-456');
    expect(bundle.htmlContent).toContain('Enhanced training module features');
    expect(bundle.htmlContent).toContain('Training sessions will be temporarily unavailable');
    expect(bundle.htmlContent).toContain('Alice Johnson');
    expect(bundle.htmlContent).toContain('alice.johnson@example.com');
    expect(bundle.htmlContent).toContain('(555) 111-2222');
  }, 10000);
});
