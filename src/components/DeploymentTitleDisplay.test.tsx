/**
 * Tests for DeploymentTitleDisplay Component
 * 
 * Verifies:
 * - Title updates within 500ms of field changes (debounced)
 * - Title shows empty when required fields are missing
 * - Title displays correctly when all fields are present
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DeploymentTitleDisplay } from './DeploymentTitleDisplay';
import { DeploymentFormData, Application } from '../types/models';

describe('DeploymentTitleDisplay', () => {
  beforeEach(() => {
    // Use fake timers to control the debounce timing
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  const createMockFormData = (overrides?: Partial<DeploymentFormData>): DeploymentFormData => {
    const defaultApp: Application = {
      id: 'crew-portal',
      name: 'Crew Portal',
      notificationHeader: 'Crew Portal Deployment Notification'
    };

    return {
      formId: 'test-form-1',
      application: defaultApp,
      changeNumber: 'CHG12345',
      releaseVersion: 'v5.4.1',
      environment: 'PROD',
      deploymentTitle: '',
      deploymentDate: new Date('2025-03-05'),
      startTime: new Date('2025-03-05T20:00:00'),
      endTime: new Date('2025-03-05T22:00:00'),
      hasOutage: false,
      outageStartDate: null,
      outageStartTime: null,
      outageEndDate: null,
      outageEndTime: null,
      changeItems: [{ id: '1', jiraNumber: 'JIRA-123', description: 'Test change' }],
      impactItems: [{ id: '1', text: 'Test impact' }],
      contactName: 'John Doe',
      contactEmail: 'john@example.com',
      contactPhone: '(555) 123-4567',
      ...overrides
    };
  };

  it('should display empty title initially (before debounce completes)', () => {
    const data = createMockFormData();
    render(<DeploymentTitleDisplay data={data} />);

    // Before the debounce timer fires, the field should be empty
    const titleField = screen.getByLabelText('Deployment Title');
    expect(titleField).toHaveValue('');
  });

  it('should display computed title after 500ms debounce', async () => {
    const data = createMockFormData();
    render(<DeploymentTitleDisplay data={data} />);

    // Fast-forward time by 500ms and flush all pending timers
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Check the value
    const titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });

  it('should show empty when application is missing', async () => {
    const data = createMockFormData({ application: null });
    render(<DeploymentTitleDisplay data={data} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('');
  });

  it('should show empty when change number is missing', async () => {
    const data = createMockFormData({ changeNumber: '' });
    render(<DeploymentTitleDisplay data={data} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('');
  });

  it('should show empty when release version is missing', async () => {
    const data = createMockFormData({ releaseVersion: '' });
    render(<DeploymentTitleDisplay data={data} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('');
  });

  it('should show empty when environment is missing', async () => {
    const data = createMockFormData({ environment: null });
    render(<DeploymentTitleDisplay data={data} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('');
  });

  it('should update title when change number changes', async () => {
    const data = createMockFormData({ changeNumber: 'CHG12345' });
    const { rerender } = render(<DeploymentTitleDisplay data={data} />);

    // Fast-forward to initial title
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    
    let titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');

    // Update change number
    const updatedData = createMockFormData({ changeNumber: 'CHG99999' });
    rerender(<DeploymentTitleDisplay data={updatedData} />);

    // Fast-forward another 500ms for debounce
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG99999] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });

  it('should update title when release version changes', async () => {
    const data = createMockFormData({ releaseVersion: 'v5.4.1' });
    const { rerender } = render(<DeploymentTitleDisplay data={data} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    
    let titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');

    // Update release version
    const updatedData = createMockFormData({ releaseVersion: 'v6.0.0' });
    rerender(<DeploymentTitleDisplay data={updatedData} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [Crew Portal: v6.0.0 - Deploy Product to PROD]');
  });

  it('should update title when environment changes', async () => {
    const data = createMockFormData({ environment: 'PROD' });
    const { rerender } = render(<DeploymentTitleDisplay data={data} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    
    let titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');

    // Update environment
    const updatedData = createMockFormData({ environment: 'QA' });
    rerender(<DeploymentTitleDisplay data={updatedData} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to QA]');
  });

  it('should update title when application changes', async () => {
    const crewPortalApp: Application = {
      id: 'crew-portal',
      name: 'Crew Portal',
      notificationHeader: 'Crew Portal Deployment Notification'
    };
    const data = createMockFormData({ application: crewPortalApp });
    const { rerender } = render(<DeploymentTitleDisplay data={data} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    
    let titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');

    // Update application
    const aoCrewApp: Application = {
      id: 'ao-crew-training',
      name: 'AO Crew Training',
      notificationHeader: 'AO Crew Training Deployment Notification'
    };
    const updatedData = createMockFormData({ application: aoCrewApp });
    rerender(<DeploymentTitleDisplay data={updatedData} />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG12345] — [AO Crew Training: v5.4.1 - Deploy Product to PROD]');
  });

  it('should debounce rapid changes (only show final value)', async () => {
    const data = createMockFormData({ changeNumber: 'CHG11111' });
    const { rerender } = render(<DeploymentTitleDisplay data={data} />);

    // Make rapid changes without advancing timers
    rerender(<DeploymentTitleDisplay data={createMockFormData({ changeNumber: 'CHG22222' })} />);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    
    rerender(<DeploymentTitleDisplay data={createMockFormData({ changeNumber: 'CHG33333' })} />);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    
    rerender(<DeploymentTitleDisplay data={createMockFormData({ changeNumber: 'CHG44444' })} />);
    
    // Now advance the full 500ms from the last change
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Should only show the final value (CHG44444)
    const titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    expect(titleField.value).toBe('[CHG44444] — [Crew Portal: v5.4.1 - Deploy Product to PROD]');
  });

  it('should be read-only', () => {
    const data = createMockFormData();
    render(<DeploymentTitleDisplay data={data} />);

    const titleField = screen.getByLabelText('Deployment Title') as HTMLInputElement;
    // Check the readonly attribute directly on the input element
    expect(titleField.hasAttribute('readonly')).toBe(true);
  });

  it('should have helper text explaining auto-generation', () => {
    const data = createMockFormData();
    render(<DeploymentTitleDisplay data={data} />);

    expect(screen.getByText(/automatically generated/i)).toBeInTheDocument();
  });
});
