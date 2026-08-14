/**
 * Snapshot Tests for All Major Components
 * 
 * Tests rendering consistency across all major components in various states.
 * Validates visual consistency across form states, input variations, and error conditions.
 * 
 * Requirement: (rendering consistency verification)
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Component imports
import { ApplicationSelector } from './ApplicationSelector';
import { DeploymentInfoSection } from './DeploymentInfoSection';
import { ScheduleSection } from './ScheduleSection';
import { ChangeItemsSection } from './ChangeItemsSection';
import { ImpactSection } from './ImpactSection';
import { ContactSection } from './ContactSection';
import { DeploymentForm } from './DeploymentForm';
import { FormManager } from './FormManager';

// Type imports
import type { Application, ChangeItem, ImpactItem, DeploymentFormData } from '../types/models';

// Test data helpers
const createMockApplication = (
  id: string,
  name: string,
  header: string = `${name} Deployment Notification`
): Application => ({
  id,
  name,
  notificationHeader: header
});

const createMockChangeItem = (id: string, jiraNumber: string, description: string): ChangeItem => ({
  id,
  jiraNumber,
  description
});

const createMockImpactItem = (id: string, text: string): ImpactItem => ({
  id,
  text
});

const createMockFormData = (overrides: Partial<DeploymentFormData> = {}): DeploymentFormData => ({
  formId: 'form-1',
  application: null,
  changeNumber: '',
  releaseVersion: '',
  environment: null,
  deploymentDate: new Date('2025-01-15'),
  startDateTime: new Date('2025-01-15T20:00:00'),
  endDateTime: new Date('2025-01-15T22:00:00'),
  hasOutage: false,
  changeItems: [createMockChangeItem('ci-1', '', '')],
  impactItems: [createMockImpactItem('ii-1', '')],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  ...overrides
});

const mockApplicationCatalog: Application[] = [
  createMockApplication('app-1', 'AO Crew Training'),
  createMockApplication('app-2', 'Crew Portal'),
  createMockApplication('app-3', 'Crew Mobile'),
  createMockApplication('app-4', 'Learning Management'),
  createMockApplication('app-5', 'Administration Portal')
];

// Theme provider wrapper for rendering components
const withTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ApplicationSelector Component Snapshots', () => {
  it('should match snapshot: without catalog (empty)', () => {
    const { container } = render(
      withTheme(
        <ApplicationSelector
          value={null}
          onChange={vi.fn()}
          catalog={[]}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with full catalog available', () => {
    const { container } = render(
      withTheme(
        <ApplicationSelector
          value={null}
          onChange={vi.fn()}
          catalog={mockApplicationCatalog}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with application selected', () => {
    const selectedApp = mockApplicationCatalog[0];
    const { container } = render(
      withTheme(
        <ApplicationSelector
          value={selectedApp}
          onChange={vi.fn()}
          catalog={mockApplicationCatalog}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with error displayed', () => {
    const { container } = render(
      withTheme(
        <ApplicationSelector
          value={null}
          onChange={vi.fn()}
          catalog={mockApplicationCatalog}
          error="Application is required"
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('DeploymentInfoSection Component Snapshots', () => {
  it('should match snapshot: empty form', () => {
    const { container } = render(
      withTheme(
        <DeploymentInfoSection
          changeNumber=""
          releaseVersion=""
          environment={null}
          onChangeNumberChange={vi.fn()}
          onReleaseVersionChange={vi.fn()}
          onEnvironmentChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: filled with valid data', () => {
    const { container } = render(
      withTheme(
        <DeploymentInfoSection
          changeNumber="CHG12345"
          releaseVersion="v5.4.1"
          environment="PROD"
          onChangeNumberChange={vi.fn()}
          onReleaseVersionChange={vi.fn()}
          onEnvironmentChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with validation errors', () => {
    const { container } = render(
      withTheme(
        <DeploymentInfoSection
          changeNumber=""
          releaseVersion=""
          environment={null}
          onChangeNumberChange={vi.fn()}
          onReleaseVersionChange={vi.fn()}
          onEnvironmentChange={vi.fn()}
          changeNumberError="Change Number is required"
          releaseVersionError="Release Version is required"
          environmentError="Environment is required"
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ScheduleSection Component Snapshots', () => {
  it('should match snapshot: with default values', () => {
    const { container } = render(
      withTheme(
        <ScheduleSection
          startDateTime={new Date('2025-01-15T20:00:00')}
          endDateTime={new Date('2025-01-15T22:00:00')}
          onStartDateTimeChange={vi.fn()}
          onEndDateTimeChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with filled schedule', () => {
    const { container } = render(
      withTheme(
        <ScheduleSection
          startDateTime={new Date('2025-03-15T08:00:00')}
          endDateTime={new Date('2025-03-15T14:00:00')}
          onStartDateTimeChange={vi.fn()}
          onEndDateTimeChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with time validation error', () => {
    const { container } = render(
      withTheme(
        <ScheduleSection
          startDateTime={new Date('2025-01-15T22:00:00')}
          endDateTime={new Date('2025-01-15T20:00:00')}
          onStartDateTimeChange={vi.fn()}
          onEndDateTimeChange={vi.fn()}
          endDateTimeError="End time must be later than start time"
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ChangeItemsSection Component Snapshots', () => {
  it('should match snapshot: with single item', () => {
    const { container } = render(
      withTheme(
        <ChangeItemsSection
          changeItems={[createMockChangeItem('ci-1', 'JIRA-123', 'Fix critical bug')]}
          onChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with multiple items (5 items)', () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      createMockChangeItem(`ci-${i + 1}`, `JIRA-${100 + i}`, `Change item ${i + 1} description`)
    );
    const { container } = render(
      withTheme(
        <ChangeItemsSection
          changeItems={items}
          onChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: at maximum capacity (multiple items)', () => {
    const items = Array.from({ length: 50 }, (_, i) =>
      createMockChangeItem(`ci-${i + 1}`, `JIRA-${i + 1}`, `Item ${i + 1}`)
    );
    const { container } = render(
      withTheme(
        <ChangeItemsSection
          changeItems={items}
          onChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with validation errors', () => {
    const { container } = render(
      withTheme(
        <ChangeItemsSection
          changeItems={[
            createMockChangeItem('ci-1', '', ''),
            createMockChangeItem('ci-2', 'JIRA-124', '')
          ]}
          onChange={vi.fn()}
          errors={{
            'ci-1': { jiraNumber: 'Jira Number is required', description: 'Description is required' },
            'ci-2': { description: 'Description is required' }
          }}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ImpactSection Component Snapshots', () => {
  it('should match snapshot: with single item', () => {
    const { container } = render(
      withTheme(
        <ImpactSection
          impactItems={[createMockImpactItem('ii-1', 'Users will experience brief downtime')]}
          onImpactItemsChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with multiple items (5 items)', () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      createMockImpactItem(`ii-${i + 1}`, `Impact ${i + 1}: This is a detailed impact description`)
    );
    const { container } = render(
      withTheme(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: at maximum capacity (multiple items)', () => {
    const items = Array.from({ length: 50 }, (_, i) =>
      createMockImpactItem(`ii-${i + 1}`, `Impact item ${i + 1}`)
    );
    const { container } = render(
      withTheme(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with validation errors', () => {
    const { container } = render(
      withTheme(
        <ImpactSection
          impactItems={[
            createMockImpactItem('ii-1', ''),
            createMockImpactItem('ii-2', 'a'.repeat(501))
          ]}
          onImpactItemsChange={vi.fn()}
          errors={{
            'impactItems[0].text': 'Impact text is required',
            'impactItems[1].text': 'Impact text must not exceed 500 characters'
          }}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ContactSection Component Snapshots', () => {
  it('should match snapshot: empty form', () => {
    const { container } = render(
      withTheme(
        <ContactSection
          contactName=""
          contactEmail=""
          contactPhone=""
          onContactNameChange={vi.fn()}
          onContactEmailChange={vi.fn()}
          onContactPhoneChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: filled with valid data', () => {
    const { container } = render(
      withTheme(
        <ContactSection
          contactName="John Doe"
          contactEmail="john.doe@example.com"
          contactPhone="(555) 123-4567"
          onContactNameChange={vi.fn()}
          onContactEmailChange={vi.fn()}
          onContactPhoneChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: with format errors', () => {
    const { container } = render(
      withTheme(
        <ContactSection
          contactName="John Doe"
          contactEmail="invalid-email"
          contactPhone="555-123-4567"
          onContactNameChange={vi.fn()}
          onContactEmailChange={vi.fn()}
          onContactPhoneChange={vi.fn()}
          contactEmailError="Please enter a valid email address"
          contactPhoneError="Please enter phone number as (###) ###-####"
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('DeploymentForm Component Snapshots', () => {
  it('should match snapshot: complete form with all sections (default state)', () => {
    // Use a fixed form ID to avoid snapshot changes due to dynamic IDs
    const formData = createMockFormData({ formId: 'form-1-stable' });
    const { container } = render(
      withTheme(
        <DeploymentForm
          formData={formData}
          formNumber={1}
          onUpdate={vi.fn()}
          onReset={vi.fn()}
          onRemove={vi.fn()}
          canRemove={false}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('FormManager Component Snapshots', () => {
  it('should match snapshot: with single form (initial state)', () => {
    const form = createMockFormData({ formId: 'form-1-stable' });
    const { container } = render(
      withTheme(
        <FormManager
          forms={[form]}
          canAddForm={true}
          canRemoveForm={false}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Component Snapshots - Theme Consistency', () => {
  it('should verify ApplicationSelector snapshot consistency with light theme', () => {
    const lightTheme = createTheme({
      palette: { mode: 'light' }
    });

    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ApplicationSelector
          value={mockApplicationCatalog[0]}
          onChange={vi.fn()}
          catalog={mockApplicationCatalog}
        />
      </ThemeProvider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should verify ApplicationSelector snapshot consistency with dark theme', () => {
    const darkTheme = createTheme({
      palette: { mode: 'dark' }
    });

    const { container } = render(
      <ThemeProvider theme={darkTheme}>
        <ApplicationSelector
          value={mockApplicationCatalog[0]}
          onChange={vi.fn()}
          catalog={mockApplicationCatalog}
        />
      </ThemeProvider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Component Snapshots - Edge Cases', () => {
  it('should match snapshot: long text in contact fields', () => {
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(3);
    const { container } = render(
      withTheme(
        <ContactSection
          contactName={longText.slice(0, 255)}
          contactEmail="test@example.com"
          contactPhone="(555) 123-4567"
          onContactNameChange={vi.fn()}
          onContactEmailChange={vi.fn()}
          onContactPhoneChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: special characters in contact fields', () => {
    const { container } = render(
      withTheme(
        <ContactSection
          contactName={'John "Doe" O\'Brien'}
          contactEmail="john+tag@example.co.uk"
          contactPhone="(555) 123-4567"
          onContactNameChange={vi.fn()}
          onContactEmailChange={vi.fn()}
          onContactPhoneChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: ChangeItemsSection with max-length fields', () => {
    const items = [
      createMockChangeItem(
        'ci-1',
        'x'.repeat(50),
        'y'.repeat(500)
      )
    ];
    const { container } = render(
      withTheme(
        <ChangeItemsSection
          changeItems={items}
          onChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot: ImpactSection with max-length text', () => {
    const items = [
      createMockImpactItem('ii-1', 'a'.repeat(500))
    ];
    const { container } = render(
      withTheme(
        <ImpactSection
          impactItems={items}
          onImpactItemsChange={vi.fn()}
        />
      )
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
