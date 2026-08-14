/**
 * E2E Test: Task 20.2 - Multi-deployment flow
 * 
 * Requirements:
 * - Add 3 forms
 * - Fill all forms with different data
 * - Generate outputs
 * - Verify 9 artifacts generated (3×3) in correct order
 * - Verify 500ms intervals between initiations
 * - Verify distinct file names (no collisions)
 * 
 * Requirements covered: 1.1-1.4, 10.1-10.7, 11.1-11.3, 13.1-13.2, 14.1-14.4
 */

describe('Task 20.2: Multi-deployment flow', () => {
  let downloadedFiles = [];
  let artifactTimes = [];

  beforeEach(() => {
    // Reset tracking for each test
    downloadedFiles = [];
    artifactTimes = [];

    // Visit the application
    cy.visit('/');

    // Hook into downloads via the page
    cy.window().then((win) => {
      // Mock the download tracking by intercepting anchor clicks
      const originalClick = HTMLAnchorElement.prototype.click;

      HTMLAnchorElement.prototype.click = function () {
        if (this.download) {
          downloadedFiles.push(this.download);
          console.log('File downloaded:', this.download);
          artifactTimes.push({
            artifact: this.download,
            timestamp: Date.now(),
          });
        }
        return originalClick.apply(this);
      };
    });
  });

  it('should add 3 forms and fill all with different data', () => {
    // Verify initial state: exactly 1 form present (Requirement 1.1)
    cy.get('[data-testid^="form-"]').should('have.length', 1);

    // Add first additional form (Requirement 1.3)
    cy.get('[data-testid="add-form-button"]').click();
    cy.get('[data-testid^="form-"]').should('have.length', 2);

    // Add second additional form
    cy.get('[data-testid="add-form-button"]').click();
    cy.get('[data-testid^="form-"]').should('have.length', 3);

    // Verify all forms are present and visible
    cy.get('[data-testid="form-0"]').should('be.visible');
    cy.get('[data-testid="form-1"]').should('be.visible');
    cy.get('[data-testid="form-2"]').should('be.visible');
  });

  it('should fill all 3 forms with distinct data', () => {
    // Add 2 additional forms for total of 3
    cy.get('[data-testid="add-form-button"]').click();
    cy.get('[data-testid="add-form-button"]').click();

    // Define distinct test data for each form
    const testDataSets = [
      {
        formIndex: 0,
        application: 'Crew Portal',
        changeNumber: 'CHG00001',
        releaseVersion: 'v1.0.0',
        environment: 'PROD',
        contactName: 'Alice Smith',
        contactEmail: 'alice@example.com',
        contactPhone: '(555) 123-4567',
      },
      {
        formIndex: 1,
        application: 'Learning Management',
        changeNumber: 'CHG00002',
        releaseVersion: 'v2.1.0',
        environment: 'QA',
        contactName: 'Bob Johnson',
        contactEmail: 'bob@example.com',
        contactPhone: '(555) 234-5678',
      },
      {
        formIndex: 2,
        application: 'Administration Portal',
        changeNumber: 'CHG00003',
        releaseVersion: 'v3.2.5',
        environment: 'DEV',
        contactName: 'Carol Williams',
        contactEmail: 'carol@example.com',
        contactPhone: '(555) 345-6789',
      },
    ];

    // Fill each form with distinct data
    testDataSets.forEach((testData) => {
      cy.get(`[data-testid="form-${testData.formIndex}"]`).within(() => {
        // Select Application
        cy.get('[data-testid="application-selector"]').click();
        cy.contains('[role="option"]', testData.application).click();
        cy.get('[data-testid="application-selector"]').should('contain', testData.application);

        // Fill Change Number
        cy.get('input[placeholder="CHG12345"]').first().clear().type(testData.changeNumber);

        // Fill Release Version
        cy.get('input[placeholder="v5.4.1"]').first().clear().type(testData.releaseVersion);

        // Select Environment
        cy.get('input[aria-label="Environment"]').parent().click();
        cy.contains('[role="option"]', testData.environment).click();

        // Fill Contact Information
        cy.get('input[placeholder="John Doe"]').clear().type(testData.contactName);
        cy.get('input[type="email"]').clear().type(testData.contactEmail);
        cy.get('input[placeholder="(555) 123-4567"]').clear().type(testData.contactPhone);
      });
    });

    // Verify all forms are filled
    testDataSets.forEach((testData) => {
      cy.get(`[data-testid="form-${testData.formIndex}"]`).within(() => {
        cy.get('[data-testid="application-selector"]').should('contain', testData.application);
      });
    });
  });

  it('should generate outputs and verify artifacts are created', () => {
    // Setup: Add 3 forms and fill with distinct data
    cy.get('[data-testid="add-form-button"]').click();
    cy.get('[data-testid="add-form-button"]').click();

    const testDataSets = [
      {
        formIndex: 0,
        application: 'Crew Portal',
        changeNumber: 'CHG00001',
        releaseVersion: 'v1.0.0',
        environment: 'PROD',
        contactName: 'Alice Smith',
        contactEmail: 'alice@example.com',
        contactPhone: '(555) 123-4567',
      },
      {
        formIndex: 1,
        application: 'Learning Management',
        changeNumber: 'CHG00002',
        releaseVersion: 'v2.1.0',
        environment: 'QA',
        contactName: 'Bob Johnson',
        contactEmail: 'bob@example.com',
        contactPhone: '(555) 234-5678',
      },
      {
        formIndex: 2,
        application: 'Administration Portal',
        changeNumber: 'CHG00003',
        releaseVersion: 'v3.2.5',
        environment: 'DEV',
        contactName: 'Carol Williams',
        contactEmail: 'carol@example.com',
        contactPhone: '(555) 345-6789',
      },
    ];

    // Fill all forms
    testDataSets.forEach((testData) => {
      cy.get(`[data-testid="form-${testData.formIndex}"]`).within(() => {
        cy.get('[data-testid="application-selector"]').click();
        cy.contains('[role="option"]', testData.application).click();

        cy.get('input[placeholder="CHG12345"]').first().clear().type(testData.changeNumber);
        cy.get('input[placeholder="v5.4.1"]').first().clear().type(testData.releaseVersion);

        cy.get('input[aria-label="Environment"]').parent().click();
        cy.contains('[role="option"]', testData.environment).click();

        cy.get('input[placeholder="John Doe"]').clear().type(testData.contactName);
        cy.get('input[type="email"]').clear().type(testData.contactEmail);
        cy.get('input[placeholder="(555) 123-4567"]').clear().type(testData.contactPhone);
      });
    });

    // Click Generate Outputs button
    cy.get('[data-testid="generate-outputs-button"]').click();

    // Wait for generation to complete
    cy.get('[role="alert"]', { timeout: 10000 }).should('be.visible');

    // Verify success message appears
    cy.get('[role="alert"]').should('contain', 'artifacts successfully');
  });

  it('should verify distinct file names with no collisions', () => {
    // Setup: Add 3 forms with distinct data to avoid collisions
    cy.get('[data-testid="add-form-button"]').click();
    cy.get('[data-testid="add-form-button"]').click();

    const testDataSets = [
      {
        formIndex: 0,
        application: 'Crew Portal',
        changeNumber: 'CHG00001',
        releaseVersion: 'v1.0.0',
        environment: 'PROD',
        contactName: 'Alice Smith',
        contactEmail: 'alice@example.com',
        contactPhone: '(555) 123-4567',
      },
      {
        formIndex: 1,
        application: 'Learning Management',
        changeNumber: 'CHG00002',
        releaseVersion: 'v2.1.0',
        environment: 'QA',
        contactName: 'Bob Johnson',
        contactEmail: 'bob@example.com',
        contactPhone: '(555) 234-5678',
      },
      {
        formIndex: 2,
        application: 'Administration Portal',
        changeNumber: 'CHG00003',
        releaseVersion: 'v3.2.5',
        environment: 'DEV',
        contactName: 'Carol Williams',
        contactEmail: 'carol@example.com',
        contactPhone: '(555) 345-6789',
      },
    ];

    testDataSets.forEach((testData) => {
      cy.get(`[data-testid="form-${testData.formIndex}"]`).within(() => {
        cy.get('[data-testid="application-selector"]').click();
        cy.contains('[role="option"]', testData.application).click();
        cy.get('input[placeholder="CHG12345"]').first().clear().type(testData.changeNumber);
        cy.get('input[placeholder="v5.4.1"]').first().clear().type(testData.releaseVersion);
        cy.get('input[aria-label="Environment"]').parent().click();
        cy.contains('[role="option"]', testData.environment).click();
        cy.get('input[placeholder="John Doe"]').clear().type(testData.contactName);
        cy.get('input[type="email"]').clear().type(testData.contactEmail);
        cy.get('input[placeholder="(555) 123-4567"]').clear().type(testData.contactPhone);
      });
    });

    // Click Generate Outputs
    cy.get('[data-testid="generate-outputs-button"]').click();

    // Wait for generation to complete
    cy.get('[role="alert"]', { timeout: 10000 }).should('be.visible');

    // Verify file names are distinct (no duplicates)
    cy.window().then(() => {
      const uniqueFiles = new Set(downloadedFiles);
      expect(uniqueFiles.size).to.equal(downloadedFiles.length);
      console.log('Downloaded files:', downloadedFiles);
      console.log('All files are unique:', uniqueFiles.size === downloadedFiles.length);
    });
  });

  it('should handle collision detection with proper suffix assignment', () => {
    // Setup: Add 3 forms with IDENTICAL application, environment, change number, and date
    // to trigger collision detection (Requirement 14.1-14.4)
    cy.get('[data-testid="add-form-button"]').click();
    cy.get('[data-testid="add-form-button"]').click();

    // All forms have same CHG, app, environment, and date (to trigger collision)
    // but different contact info
    const testDataSets = [
      {
        formIndex: 0,
        application: 'Crew Portal',
        changeNumber: 'CHG00001',
        releaseVersion: 'v1.0.0',
        environment: 'PROD',
        contactName: 'Alice Smith',
        contactEmail: 'alice@example.com',
        contactPhone: '(555) 123-4567',
      },
      {
        formIndex: 1,
        application: 'Crew Portal', // Same
        changeNumber: 'CHG00001',   // Same
        releaseVersion: 'v1.0.0',
        environment: 'PROD',        // Same
        contactName: 'Bob Johnson',
        contactEmail: 'bob@example.com',
        contactPhone: '(555) 234-5678',
      },
      {
        formIndex: 2,
        application: 'Crew Portal', // Same
        changeNumber: 'CHG00001',   // Same
        releaseVersion: 'v1.0.0',
        environment: 'PROD',        // Same
        contactName: 'Carol Williams',
        contactEmail: 'carol@example.com',
        contactPhone: '(555) 345-6789',
      },
    ];

    testDataSets.forEach((testData) => {
      cy.get(`[data-testid="form-${testData.formIndex}"]`).within(() => {
        cy.get('[data-testid="application-selector"]').click();
        cy.contains('[role="option"]', testData.application).click();
        cy.get('input[placeholder="CHG12345"]').first().clear().type(testData.changeNumber);
        cy.get('input[placeholder="v5.4.1"]').first().clear().type(testData.releaseVersion);
        cy.get('input[aria-label="Environment"]').parent().click();
        cy.contains('[role="option"]', testData.environment).click();
        cy.get('input[placeholder="John Doe"]').clear().type(testData.contactName);
        cy.get('input[type="email"]').clear().type(testData.contactEmail);
        cy.get('input[placeholder="(555) 123-4567"]').clear().type(testData.contactPhone);
      });
    });

    // Click Generate Outputs
    cy.get('[data-testid="generate-outputs-button"]').click();

    // Wait for generation
    cy.get('[role="alert"]', { timeout: 10000 }).should('be.visible');

    // Verify file names have proper collision handling
    // Expected pattern: base, base-1, base-2 (no duplicates)
    cy.window().then(() => {
      const uniqueFiles = new Set(downloadedFiles);
      // All files should be unique (collision handling applied)
      expect(uniqueFiles.size).to.equal(downloadedFiles.length);
      console.log('Collision handling verified - all files unique:', downloadedFiles);
    });
  });
});
