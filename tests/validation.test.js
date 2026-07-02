'use strict';

const { validateShiftTime, shiftsOverlap, validateSchedule } = require('../src/validation');

// Simple test runner
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Tests for validateShiftTime
console.log('\nvalidateShiftTime:');
assertEqual(validateShiftTime('09:00', '17:00'), { valid: true }, 'valid time range');
assertEqual(validateShiftTime('', '17:00'), { valid: false, error: 'Start and end times are required' }, 'empty start');
assertEqual(validateShiftTime('09:00', ''), { valid: false, error: 'Start and end times are required' }, 'empty end');
assertEqual(validateShiftTime('25:00', '17:00'), { valid: false, error: 'Start time must be in HH:mm format (00:00-23:59)' }, 'invalid start hour');
assertEqual(validateShiftTime('09:00', '17:60'), { valid: false, error: 'End time must be in HH:mm format (00:00-23:59)' }, 'invalid end minute');
assertEqual(validateShiftTime('17:00', '09:00'), { valid: false, error: 'End time must be after start time' }, 'end before start');

// Tests for shiftsOverlap
console.log('\nshiftsOverlap:');
assert(shiftsOverlap({ start: '09:00', end: '12:00' }, { start: '11:00', end: '14:00' }) === true, 'overlapping shifts');
assert(shiftsOverlap({ start: '09:00', end: '12:00' }, { start: '12:00', end: '14:00' }) === false, 'adjacent shifts (no overlap)');
assert(shiftsOverlap({ start: '09:00', end: '10:00' }, { start: '10:00', end: '11:00' }) === false, 'back-to-back shifts');

// Tests for validateSchedule
console.log('\nvalidateSchedule:');
assertEqual(validateSchedule([]), { valid: false, errors: ['Schedule must contain at least one shift'] }, 'empty schedule');
assertEqual(validateSchedule(null), { valid: false, errors: ['Schedule must contain at least one shift'] }, 'null schedule');

const validSchedule = [
  { name: 'Morning', start: '09:00', end: '12:00' },
  { name: 'Afternoon', start: '12:00', end: '17:00' }
];
assertEqual(validateSchedule(validSchedule), { valid: true, errors: [] }, 'valid schedule');

const overlappingSchedule = [
  { name: 'Morning', start: '09:00', end: '13:00' },
  { name: 'Afternoon', start: '12:00', end: '17:00' }
];
const overlapResult = validateSchedule(overlappingSchedule);
assert(overlapResult.valid === false, 'overlapping schedule detected');
assert(overlapResult.errors.length > 0, 'overlap error reported');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
