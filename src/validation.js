'use strict';

/**
 * Validate shift time range.
 * @param {string} start - Start time in HH:mm format
 * @param {string} end - End time in HH:mm format
 * @returns {{valid: boolean, error?: string}}
 */
function validateShiftTime(start, end) {
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  
  if (!start || !end) {
    return { valid: false, error: 'Start and end times are required' };
  }
  
  if (!timeRegex.test(start)) {
    return { valid: false, error: 'Start time must be in HH:mm format (00:00-23:59)' };
  }
  
  if (!timeRegex.test(end)) {
    return { valid: false, error: 'End time must be in HH:mm format (00:00-23:59)' };
  }
  
  if (start >= end) {
    return { valid: false, error: 'End time must be after start time' };
  }
  
  return { valid: true };
}

/**
 * Check if two shifts overlap.
 * @param {{start: string, end: string}} shiftA
 * @param {{start: string, end: string}} shiftB
 * @returns {boolean}
 */
function shiftsOverlap(shiftA, shiftB) {
  return shiftA.start < shiftB.end && shiftB.start < shiftA.end;
}

/**
 * Validate a complete shift schedule.
 * @param {Array<{start: string, end: string, name: string}>} shifts
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateSchedule(shifts) {
  const errors = [];
  
  if (!Array.isArray(shifts) || shifts.length === 0) {
    return { valid: false, errors: ['Schedule must contain at least one shift'] };
  }
  
  for (let i = 0; i < shifts.length; i++) {
    const shift = shifts[i];
    
    if (!shift.name) {
      errors.push(`Shift ${i + 1}: Name is required`);
    }
    
    const timeResult = validateShiftTime(shift.start, shift.end);
    if (!timeResult.valid) {
      errors.push(`Shift ${i + 1} (${shift.name || 'unnamed'}): ${timeResult.error}`);
    }
    
    // Check overlap with previous shifts
    for (let j = 0; j < i; j++) {
      if (shiftsOverlap(shifts[j], shift)) {
        errors.push(`Shift ${i + 1} (${shift.name}) overlaps with Shift ${j + 1} (${shifts[j].name})`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

module.exports = { validateShiftTime, shiftsOverlap, validateSchedule };
