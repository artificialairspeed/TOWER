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
  const [deploymentDate, setDeploymentDate] = useState<Date>(new Date());
  
  const [startTime, setStartTime] = useState<Date>(() => {
    const time = new Date();
    time.setHours(20, 0, 0, 0); // 20:00 (8:00 PM)
    return time;
  });
  
  const [endTime, setEndTime] = useState<Date>(() => {
    const time = new Date();
    time.setHours(22, 0, 0, 0); // 22:00 (10:00 PM)
    return time;
  });

  // Validation logic (Requirement 4.6)
  const getTimeOrderError = (): string | undefined => {
    if (!deploymentDate || !startTime || !endTime) {
      return undefined;
    }
    
    // Compare times on the same deployment date
    const startDateTime = new Date(deploymentDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes());
    
    const endDateTime = new Date(deploymentDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes());
    
    if (endDateTime <= startDateTime) {
      return 'End Time must be later than Start Time';
    }
    
    return undefined;
  };

  const timeOrderError = getTimeOrderError();

  return (
    <div>
      <h2>Schedule Section Example</h2>
      
      <ScheduleSection
        deploymentDate={deploymentDate}
        startTime={startTime}
        endTime={endTime}
        onDeploymentDateChange={(date) => date && setDeploymentDate(date)}
        onStartTimeChange={(time) => time && setStartTime(time)}
        onEndTimeChange={(time) => time && setEndTime(time)}
        timeOrderError={timeOrderError}
      />
      
      {/* Display current values */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}>
        <h3>Current Values:</h3>
        <p><strong>Deployment Date:</strong> {deploymentDate.toLocaleDateString()}</p>
        <p><strong>Start Time:</strong> {startTime.toLocaleTimeString()}</p>
        <p><strong>End Time:</strong> {endTime.toLocaleTimeString()}</p>
        <p><strong>Validation Status:</strong> {timeOrderError ? `❌ ${timeOrderError}` : '✓ Valid'}</p>
      </div>
    </div>
  );
}

/**
 * Example with validation errors
 */
export function ScheduleSectionWithErrorsExample() {
  const [deploymentDate, setDeploymentDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  return (
    <div>
      <h2>Schedule Section with Validation Errors</h2>
      
      <ScheduleSection
        deploymentDate={deploymentDate}
        startTime={startTime}
        endTime={endTime}
        onDeploymentDateChange={(date) => date && setDeploymentDate(date)}
        onStartTimeChange={(time) => time && setStartTime(time)}
        onEndTimeChange={(time) => time && setEndTime(time)}
        deploymentDateError="Deployment date is required"
        timeOrderError="End Time must be later than Start Time"
      />
    </div>
  );
}

/**
 * Example integrated with form validation
 */
export function ScheduleSectionWithFormValidationExample() {
  const [deploymentDate, setDeploymentDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errors = {
      deploymentDate: !deploymentDate ? 'Deployment date is required' : undefined,
      startTime: !startTime ? 'Start time is required' : undefined,
      endTime: !endTime ? 'End time is required' : undefined,
      timeOrder: undefined as string | undefined,
    };

    if (deploymentDate && startTime && endTime) {
      const start = new Date(deploymentDate);
      start.setHours(startTime.getHours(), startTime.getMinutes());
      
      const end = new Date(deploymentDate);
      end.setHours(endTime.getHours(), endTime.getMinutes());
      
      if (end <= start) {
        errors.timeOrder = 'End Time must be later than Start Time';
      }
    }

    return errors;
  };

  const errors = submitted ? validate() : { deploymentDate: undefined, startTime: undefined, endTime: undefined, timeOrder: undefined };

  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validate();
    const isValid = !Object.values(validationErrors).some(e => e);
    
    if (isValid) {
      alert('Form is valid! Schedule saved successfully.');
    } else {
      alert('Please correct the validation errors before submitting.');
    }
  };

  return (
    <div>
      <h2>Schedule Section with Form Validation</h2>
      
      <ScheduleSection
        deploymentDate={deploymentDate || new Date()}
        startTime={startTime || new Date()}
        endTime={endTime || new Date()}
        onDeploymentDateChange={setDeploymentDate}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        deploymentDateError={errors.deploymentDate}
        startTimeError={errors.startTime}
        endTimeError={errors.endTime}
        timeOrderError={errors.timeOrder}
      />
      
      <button 
        onClick={handleSubmit}
        style={{ 
          marginTop: '1rem', 
          padding: '0.5rem 1rem', 
          background: '#1976d2', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Validate & Submit
      </button>
    </div>
  );
}
