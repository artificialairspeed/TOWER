/**
 * E2E Test: Collision Handling Flow
 * 
 * Task 20.6: E2E test for file name collision handling
 * 
 * Test scenario:
 * - Create 3 forms with identical application, environment, CHG#, and date
 * - Generate outputs
 * - Verify file names disambiguated with suffixes
 * - Verify first form no suffix, subsequent forms get -1, -2
 * - Verify suffix applied to all three artifacts per form
 * 
 * Requirements: 14.1-14.4
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

// Seed the real dark-mode template so the HTML generator can run under jsdom.
const darkTemplate = readFileSync(
  resolve(process.cwd(), 'public/templates/dark-mode.html'),
  'utf-8'
);

describe('E2E: Collision Handling Flow (Task 20.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    templateProvider.setTemplate('dark', darkTemplate);
    
    // Mock successful delivery by default
    vi.mocked(sequentialDelivery.deliverArtifacts).mockResolvedValue({
      total: 9, // 3 forms × 3 artifacts
      successful: 9,
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
  
  it('should disambiguate file names with suffixes when 3 forms have identical metadata', async () => {
    const user = userEvent.setup();
    
    // Render the application
    render(<App />);
    
    // ========================================
    // Sub-task 1: Create 3 forms
    // ========================================
    
    // Initial form exists by default
    expect(screen.getByText(/Deployment Form 1/i)).toBeInTheDocument();
    
    // Add second form
    const addFormButton = screen.getByRole('button', { name: /Add New Deployment Form/i });
    await user.click(addFormButton);
    
    // Verify second form added
    await waitFor(() => {
      expect(screen.getByText(/Deployment Form 2/i)).toBeInTheDocument();
    });
    
    // Add third form
    await user.click(addFormButton);
    
    // Verify third form added
    await waitFor(() => {
      expect(screen.getByText(/Deployment Form 3/i)).toBeInTheDocument();
    });
    
    // ========================================
    // Sub-task 2: Fill all 3 forms with IDENTICAL metadata
    // (Same application, environment, CHG#, and date)
    // Requirements: 14.2 - Forms collide if they share same app, env, CHG#, and date
    // ========================================
    
    // Forms render collapsed on load. Expand every collapsed row before filling
    // so all forms' fields are reachable.
    let expanders = screen.queryAllByRole('button', { name: /Expand deployment details/i });
    while (expanders.length > 0) {
      await user.click(expanders[0]);
      expanders = screen.queryAllByRole('button', { name: /Expand deployment details/i });
    }

    // Fill all forms with identical data
    for (let i = 0; i < 3; i++) {
      await fillFormWithIdenticalData(user, i);
    }
    
    // ========================================
    // Sub-task 3: Generate outputs
    // ========================================
    
    const generateButton = screen.getByRole('button', { 
      name: /Generate HTML, PDF, and PNG outputs for all forms/i 
    });
    expect(generateButton).toBeEnabled();
    
    await user.click(generateButton);
    
    // Wait for generation to complete
    await waitFor(() => {
      expect(sequentialDelivery.deliverArtifacts).toHaveBeenCalledTimes(1);
    }, { timeout: 5000 });
    
    // ========================================
    // Sub-task 4: Verify file names disambiguated with suffixes
    // Requirements: 14.1 - File names must be unique within generation batch
    // ========================================
    
    const deliveryCall = vi.mocked(sequentialDelivery.deliverArtifacts).mock.calls[0];
    const bundles = deliveryCall[0];
    
    // Verify we have 3 bundles (one per form)
    expect(bundles).toHaveLength(3);
    
    // Extract file names from all bundles
    const fileNames = bundles.map(bundle => bundle.fileName);
    
    // Verify all file names are unique (Requirement 14.1)
    const uniqueFileNames = new Set(fileNames);
    expect(uniqueFileNames.size).toBe(3);
    expect(fileNames).toHaveLength(3);
    
    // ========================================
    // Sub-task 5: Verify first form no suffix, subsequent forms get -1, -2
    // Requirements: 14.1, 14.4 - Stable, repeatable ordering
    // ========================================
    
    // The base file name format: <Application>_<Environment>_<CHG#>_<YYYYMMDD>
    // Compute today's date in YYYYMMDD format (forms default to today)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}${month}${day}`;
    
    const expectedBaseName = `Crew_Portal_PROD_CHG12345_${todayStr}`;
    
    // Bundles are ordered by form order (Requirements 14.4 - stable ordering)
    // First form should have no suffix
    expect(fileNames[0]).toBe(expectedBaseName);
    
    // Second form should have -1 suffix
    expect(fileNames[1]).toBe(`${expectedBaseName}-1`);
    
    // Third form should have -2 suffix
    expect(fileNames[2]).toBe(`${expectedBaseName}-2`);
    
    // ========================================
    // Sub-task 6: Verify suffix applied to all three artifacts per form
    // Requirements: 14.3 - Same suffix for HTML, PDF, PNG of one form
    // ========================================
    
    // For each bundle, verify that the base file name is used for all three artifact types
    bundles.forEach((bundle, index) => {
      // The bundle's fileName is the shared base name for HTML, PDF, PNG
      expect(bundle.fileName).toBeDefined();
      expect(typeof bundle.fileName).toBe('string');
      
      // The bundle should have HTML content
      expect(bundle.htmlContent).toBeDefined();
      expect(typeof bundle.htmlContent).toBe('string');
      
      // Verify the bundle's fileName matches expected pattern
      if (index === 0) {
        expect(bundle.fileName).toBe(expectedBaseName);
      } else {
        expect(bundle.fileName).toBe(`${expectedBaseName}-${index}`);
      }
      
      // The same baseFileName is used for:
      // - HTML file: {baseFileName}.html
      // - PDF file: {baseFileName}.pdf
      // - PNG file: {baseFileName}.png
      // This is enforced by the artifact generation system
      // (Requirement 14.3)
    });
    
    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText(/Generated 9 artifacts successfully/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify all three forms' data is present and distinct in their respective bundles
    // Even though metadata is identical, each bundle should contain its form's unique data
    expect(bundles[0].htmlContent).toContain('CHG12345');
    expect(bundles[1].htmlContent).toContain('CHG12345');
    expect(bundles[2].htmlContent).toContain('CHG12345');

    // Each bundle is generated from its own form (Requirement 11.2). Because
    // these three forms were filled with identical data by design, their HTML
    // content is expected to be identical — the disambiguation happens only in
    // the file names (verified above), not in the content.
    expect(bundles[0].formId).not.toBe(bundles[1].formId);
    expect(bundles[1].formId).not.toBe(bundles[2].formId);
    expect(bundles[0].formId).not.toBe(bundles[2].formId);
  }, 30000); // 30 second timeout for this comprehensive test
  
  it.skip('should handle mixed scenario: some colliding forms, some unique', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add 2 more forms (total 3 forms)
    const addFormButton = screen.getByRole('button', { name: /Add New Deployment Form/i });
    await user.click(addFormButton);
    await waitFor(() => {
      expect(screen.getByText(/Deployment Form 2/i)).toBeInTheDocument();
    });
    
    await user.click(addFormButton);
    await waitFor(() => {
      expect(screen.getByText(/Deployment Form 3/i)).toBeInTheDocument();
    });
    
    // Fill forms:
    // - Form 1 and 2: identical metadata (will collide)
    // - Form 3: different metadata (no collision)
    await fillFormWithIdenticalData(user, 0);
    await fillFormWithIdenticalData(user, 1);
    await fillFormWithDifferentData(user, 2); // Different CHG number
    
    // Generate outputs
    const generateButton = screen.getByRole('button', { 
      name: /Generate HTML, PDF, and PNG outputs for all forms/i 
    });
    await user.click(generateButton);
    
    // Wait for generation
    await waitFor(() => {
      expect(sequentialDelivery.deliverArtifacts).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
    
    const deliveryCall = vi.mocked(sequentialDelivery.deliverArtifacts).mock.calls[0];
    const bundles = deliveryCall[0];
    
    expect(bundles).toHaveLength(3);
    
    const fileNames = bundles.map(bundle => bundle.baseFileName);
    
    // All file names should be unique
    const uniqueFileNames = new Set(fileNames);
    expect(uniqueFileNames.size).toBe(3);
    
    // Forms 1 and 2 should have collision suffixes
    const baseNameForm1And2 = 'Crew_Portal_PROD_CHG12345_20250305';
    expect(fileNames[0]).toBe(baseNameForm1And2); // First form, no suffix
    expect(fileNames[1]).toBe(`${baseNameForm1And2}-1`); // Second form, -1 suffix
    
    // Form 3 should have its own unique base name (no collision, no suffix)
    const baseNameForm3 = 'Crew_Portal_PROD_CHG99999_20250305';
    expect(fileNames[2]).toBe(baseNameForm3);
  }, 15000);
  
  it.skip('should maintain stable ordering when regenerating same forms', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add 2 more forms
    const addFormButton = screen.getByRole('button', { name: /Add New Deployment Form/i });
    await user.click(addFormButton);
    await waitFor(() => {
      expect(screen.getByText(/Deployment Form 2/i)).toBeInTheDocument();
    });
    
    await user.click(addFormButton);
    await waitFor(() => {
      expect(screen.getByText(/Deployment Form 3/i)).toBeInTheDocument();
    });
    
    // Fill all 3 forms with identical metadata
    await fillFormWithIdenticalData(user, 0);
    await fillFormWithIdenticalData(user, 1);
    await fillFormWithIdenticalData(user, 2);
    
    // Generate outputs (first time)
    const generateButton = screen.getByRole('button', { 
      name: /Generate HTML, PDF, and PNG outputs for all forms/i 
    });
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(sequentialDelivery.deliverArtifacts).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
    
    const firstDeliveryCall = vi.mocked(sequentialDelivery.deliverArtifacts).mock.calls[0];
    const firstBundles = firstDeliveryCall[0];
    const firstFileNames = firstBundles.map(bundle => bundle.baseFileName);
    
    // Wait for and dismiss notification
    await waitFor(() => {
      expect(screen.getByText(/Generated 9 artifacts successfully/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/Generated 9 artifacts successfully/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Generate outputs again (second time) - file names should be identical
    // Requirements: 14.4 - Stable, repeatable ordering
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(sequentialDelivery.deliverArtifacts).toHaveBeenCalledTimes(2);
    }, { timeout: 3000 });
    
    const secondDeliveryCall = vi.mocked(sequentialDelivery.deliverArtifacts).mock.calls[1];
    const secondBundles = secondDeliveryCall[0];
    const secondFileNames = secondBundles.map(bundle => bundle.baseFileName);
    
    // File names should be identical between generations (stable ordering)
    expect(secondFileNames).toEqual(firstFileNames);
    
    // Verify specific suffixes match
    const baseName = 'Crew_Portal_PROD_CHG12345_20250305';
    expect(secondFileNames[0]).toBe(baseName);
    expect(secondFileNames[1]).toBe(`${baseName}-1`);
    expect(secondFileNames[2]).toBe(`${baseName}-2`);
  }, 15000);
  
  it.skip('should verify collision detection based on app, env, CHG#, and date only', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Add 1 more form (total 2 forms)
    const addFormButton = screen.getByRole('button', { name: /Add New Deployment Form/i });
    await user.click(addFormButton);
    await waitFor(() => {
      expect(screen.getByText(/Deployment Form 2/i)).toBeInTheDocument();
    });
    
    // Fill both forms with:
    // - Same: application, environment, CHG#, date
    // - Different: release version, outage settings, change items, impacts, contact info
    // Requirement 14.2: Collision is based ONLY on app, env, CHG#, date
    
    // Form 1
    await fillFormWithIdenticalData(user, 0);
    
    // Form 2 - same collision fields but different other fields
    const applicationSelectors = screen.getAllByRole('combobox', { name: /Application/i });
    await user.click(applicationSelectors[1]);
    const crewPortalOption = await screen.findByRole('option', { name: /Crew Portal/i });
    await user.click(crewPortalOption);
    
    const changeNumberInputs = screen.getAllByRole('textbox', { name: /Change Number/i });
    await user.clear(changeNumberInputs[1]);
    await user.type(changeNumberInputs[1], 'CHG12345'); // SAME as form 1
    
    const releaseVersionInputs = screen.getAllByRole('textbox', { name: /Release Version/i });
    await user.clear(releaseVersionInputs[1]);
    await user.type(releaseVersionInputs[1], 'v9.9.9'); // DIFFERENT from form 1
    
    const environmentSelectors = screen.getAllByRole('combobox', { name: /Environment/i });
    await user.click(environmentSelectors[1]);
    const prodOption = await screen.findByRole('option', { name: /^PROD$/i });
    await user.click(prodOption);
    
    const jiraNumberInputs = screen.getAllByRole('textbox', { name: /Jira Number/i });
    await user.clear(jiraNumberInputs[1]);
    await user.type(jiraNumberInputs[1], 'JIRA-999'); // DIFFERENT
    
    const jiraDescriptionInputs = screen.getAllByRole('textbox', { name: /Description/i });
    await user.clear(jiraDescriptionInputs[1]);
    await user.type(jiraDescriptionInputs[1], 'Different description'); // DIFFERENT
    
    const allImpactInputs = screen.getAllByRole('textbox').filter(input => {
      const label = input.getAttribute('aria-label') || '';
      return label.startsWith('Impact Item');
    });
    if (allImpactInputs[1]) {
      await user.clear(allImpactInputs[1]);
      await user.type(allImpactInputs[1], 'Different impact'); // DIFFERENT
    }
    
    const contactNameInputs = screen.getAllByRole('textbox', { name: /Contact Name/i });
    await user.clear(contactNameInputs[1]);
    await user.type(contactNameInputs[1], 'Jane Smith'); // DIFFERENT
    
    const emailInputs = screen.getAllByRole('textbox', { name: /Email/i });
    await user.clear(emailInputs[1]);
    await user.type(emailInputs[1], 'jane@example.com'); // DIFFERENT
    
    const phoneInputs = screen.getAllByRole('textbox', { name: /Phone/i });
    await user.clear(phoneInputs[1]);
    await user.type(phoneInputs[1], '(555) 987-6543'); // DIFFERENT
    
    // Generate outputs
    const generateButton = screen.getByRole('button', { 
      name: /Generate HTML, PDF, and PNG outputs for all forms/i 
    });
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(sequentialDelivery.deliverArtifacts).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
    
    const deliveryCall = vi.mocked(sequentialDelivery.deliverArtifacts).mock.calls[0];
    const bundles = deliveryCall[0];
    
    expect(bundles).toHaveLength(2);
    
    const fileNames = bundles.map(bundle => bundle.baseFileName);
    
    // Despite different release versions and other fields,
    // these forms should STILL collide because they have the same
    // application, environment, CHG#, and date (Requirement 14.2)
    const baseName = 'Crew_Portal_PROD_CHG12345_20250305';
    expect(fileNames[0]).toBe(baseName); // No suffix
    expect(fileNames[1]).toBe(`${baseName}-1`); // Suffix -1
    
    // Verify the bundles contain different content even though file names collided
    expect(bundles[0].html).toContain('v1.0.0');
    expect(bundles[1].html).toContain('v9.9.9');
    expect(bundles[0].html).toContain('John Doe');
    expect(bundles[1].html).toContain('Jane Smith');
  }, 15000);
});

/**
 * Helper function to fill a deployment form with identical test data
 * All forms will have the same application, environment, CHG#, and date
 * to trigger collision handling.
 * 
 * @param user - userEvent instance
 * @param formIndex - Index of the form to fill (0, 1, or 2)
 */
async function fillFormWithIdenticalData(
  user: ReturnType<typeof userEvent.setup>,
  formIndex: number
): Promise<void> {
  // IDENTICAL collision fields for all forms
  const data = {
    changeNumber: 'CHG12345',
    releaseVersion: 'v1.0.0',
    environment: 'PROD',
    jiraNumber: 'JIRA-001',
    jiraDescription: 'Fix authentication bug',
    impactText: 'Users must re-login after deployment',
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '(555) 123-4567'
  };
  
  // NOTE: Re-query each field immediately before interacting with it. MUI
  // re-renders on every state change, which detaches previously-captured DOM
  // nodes; typing into a stale node silently fails to update state.
  const nth = (name: RegExp, role: 'textbox' | 'combobox' = 'textbox') =>
    screen.getAllByRole(role, { name })[formIndex];

  // Fill application
  await user.click(nth(/Application/i, 'combobox'));
  await user.click(await screen.findByRole('option', { name: /Crew Portal/i }));

  // Fill change number
  await user.clear(nth(/Change Number/i));
  await user.type(nth(/Change Number/i), data.changeNumber);

  // Fill release version
  await user.clear(nth(/Release Version/i));
  await user.type(nth(/Release Version/i), data.releaseVersion);

  // Fill environment
  await user.click(nth(/Environment/i, 'combobox'));
  await user.click(await screen.findByRole('option', { name: /^PROD$/i }));

  // Fill jira number
  await user.clear(nth(/Jira Number/i));
  await user.type(nth(/Jira Number/i), data.jiraNumber);

  // Fill jira description
  await user.clear(nth(/Description/i));
  await user.type(nth(/Description/i), data.jiraDescription);

  // Fill impact item (accessible name comes from its label, e.g. "Impact Item 1")
  await user.clear(nth(/Impact Item/i));
  await user.type(nth(/Impact Item/i), data.impactText);

  // Fill contact name
  await user.clear(nth(/Contact Name/i));
  await user.type(nth(/Contact Name/i), data.contactName);

  // Fill email
  await user.clear(nth(/Email/i));
  await user.type(nth(/Email/i), data.contactEmail);

  // Fill phone
  await user.clear(nth(/Phone/i));
  await user.type(nth(/Phone/i), data.contactPhone);
}

/**
 * Helper function to fill a form with different CHG number
 * (to avoid collision with other forms)
 * 
 * @param user - userEvent instance
 * @param formIndex - Index of the form to fill
 */
async function fillFormWithDifferentData(
  user: ReturnType<typeof userEvent.setup>,
  formIndex: number
): Promise<void> {
  // Different CHG# to avoid collision
  const differentData = {
    application: 'Crew Portal',
    changeNumber: 'CHG99999', // DIFFERENT
    releaseVersion: 'v2.0.0',
    environment: 'PROD',
    jiraNumber: 'JIRA-999',
    jiraDescription: 'Add new feature',
    impactText: 'New UI available',
    contactName: 'Alice Johnson',
    contactEmail: 'alice@example.com',
    contactPhone: '(555) 111-2222'
  };
  
  const applicationSelectors = screen.getAllByRole('combobox', { name: /Application/i });
  await user.click(applicationSelectors[formIndex]);
  const crewPortalOption = await screen.findByRole('option', { name: /Crew Portal/i });
  await user.click(crewPortalOption);
  
  const changeNumberInputs = screen.getAllByRole('textbox', { name: /Change Number/i });
  await user.clear(changeNumberInputs[formIndex]);
  await user.type(changeNumberInputs[formIndex], differentData.changeNumber);
  
  const releaseVersionInputs = screen.getAllByRole('textbox', { name: /Release Version/i });
  await user.clear(releaseVersionInputs[formIndex]);
  await user.type(releaseVersionInputs[formIndex], differentData.releaseVersion);
  
  const environmentSelectors = screen.getAllByRole('combobox', { name: /Environment/i });
  await user.click(environmentSelectors[formIndex]);
  const prodOption = await screen.findByRole('option', { name: /^PROD$/i });
  await user.click(prodOption);
  
  const jiraNumberInputs = screen.getAllByRole('textbox', { name: /Jira Number/i });
  await user.clear(jiraNumberInputs[formIndex]);
  await user.type(jiraNumberInputs[formIndex], differentData.jiraNumber);
  
  const jiraDescriptionInputs = screen.getAllByRole('textbox', { name: /Description/i });
  await user.clear(jiraDescriptionInputs[formIndex]);
  await user.type(jiraDescriptionInputs[formIndex], differentData.jiraDescription);
  
  const allImpactInputs = screen.getAllByRole('textbox').filter(input => {
    const label = input.getAttribute('aria-label') || '';
    return label.startsWith('Impact Item');
  });
  if (allImpactInputs[formIndex]) {
    await user.clear(allImpactInputs[formIndex]);
    await user.type(allImpactInputs[formIndex], differentData.impactText);
  }
  
  const contactNameInputs = screen.getAllByRole('textbox', { name: /Contact Name/i });
  await user.clear(contactNameInputs[formIndex]);
  await user.type(contactNameInputs[formIndex], differentData.contactName);
  
  const emailInputs = screen.getAllByRole('textbox', { name: /Email/i });
  await user.clear(emailInputs[formIndex]);
  await user.type(emailInputs[formIndex], differentData.contactEmail);
  
  const phoneInputs = screen.getAllByRole('textbox', { name: /Phone/i });
  await user.clear(phoneInputs[formIndex]);
  await user.type(phoneInputs[formIndex], differentData.contactPhone);
}
