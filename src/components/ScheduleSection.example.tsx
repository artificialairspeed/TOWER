/**
 * ScheduleSection Component Usage Example
 * 
 * This file demonstrates how to use the ScheduleSection component
 * with proper state management and validation.
 */

import { useState } from 'react';
import { ScheduleSection } from './ScheduleSection';

export function ScheduleSectionExample() {
  // Initialize state with default values (Requirements 4.2, 4.3, 4.4)
  const [startDateTime, setStartDateTime] = useState<Date>(() => {
    const date = new Date();
    date.setHours(20, 0, 0, 0); // 20:00 (8:00 PM)
    return date;
  });
  
  const [endDateTime, setEndDateTime] = useState<Date>(() => {
    const date = new Date();
    date.setHours(22, 0, 0, 0); // 22:00 (10:00 PM)
    return date;
  });

  const [hasOutage, setHasOutage] = useState(false);

  // Validation logic (Requirement 4.6)
  const getEndDateTimeError = (): string | undefined => {
    if (!startDateTime || !endDateTime) {
      return undefined;
    }
    
    if (endDateTime <= startDateTime) {
      return 'Deployment End must be later than Deployment Start';
    }
    
    return undefined;
  };

  const endDateTimeError = getEndDateTimeError();

  return (
    <div>
      <h2>Schedule Section Example</h2>
      
      <ScheduleSection
        startDateTime={startDateTime}
        endDateTime={endDateTime}
        onStartDateTimeChange={(value) => value && setStartDateTime(value)}
        onEndDateTimeChange={(value) => value && setEndDateTime(value)}
        endDateTimeError={endDateTimeError}
        hasOutage={hasOutage}
        onHasOutageChange={setHasOutage}
      />
      
      {/* Display current values */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}>
        <h3>Current Values:</h3>
        <p><strong>Start:</strong> {startDateTime.toLocaleString()}</p>
        <p><strong>End:</strong> {endDateTime.toLocaleString()}</p>
        <p><strong>Has Outage:</strong> {hasOutage ? 'Yes' : 'No'}</p>
        <p><strong>Validation Status:</strong> {endDateTimeError ? `❌ ${endDateTimeError}` : '✓ Valid'}</p>
      </div>
    </div>
  );
}

/**
 * Example with validation errors
 */
export function ScheduleSectionWithErrorsExample() {
  const [startDateTime, setStartDateTime] = useState<Date>(new Date());
  const [endDateTime, setEndDateTime] = useState<Date>(new Date());
  const [hasOutage, setHasOutage] = useState(false);

  return (
    <div>
      <h2>Schedule Section with Validation Errors</h2>
      
      <ScheduleSection
        startDateTime={startDateTime}
        endDateTime={endDateTime}
        onStartDateTimeChange={(value) => value && setStartDateTime(value)}
        onEndDateTimeChange={(value) => value && setEndDateTime(value)}
        startDateTimeError="Deployment Start is required"
        endDateTimeError="Deployment End must be later than Deployment Start"
        hasOutage={hasOutage}
        onHasOutageChange={setHasOutage}
      />
    </div>
  );
}
