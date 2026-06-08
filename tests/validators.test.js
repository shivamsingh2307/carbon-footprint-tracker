import { describe, test, expect } from 'vitest';
import { validateActivity, validateGoal, isPositiveNumber, isValidDate, isValidCategory } from '../src/utils/validators.js';

describe('Validation Utils', () => {
  test('validateActivity should enforce schema constraints', () => {
    // Valid entry
    const valid = validateActivity({
      activityId: 'car-petrol',
      quantity: 10,
      date: '2026-06-08',
      notes: 'Commute',
    });
    expect(valid.valid).toBe(true);
    expect(valid.errors).toHaveLength(0);

    // Invalid quantity
    const invalidQty = validateActivity({
      activityId: 'car-petrol',
      quantity: -5,
      date: '2026-06-08',
    });
    expect(invalidQty.valid).toBe(false);
    expect(invalidQty.errors[0]).toContain('Quantity');

    // Future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureStr = futureDate.toISOString().split('T')[0];

    const invalidDate = validateActivity({
      activityId: 'car-petrol',
      quantity: 10,
      date: futureStr,
    });
    expect(invalidDate.valid).toBe(false);
    expect(invalidDate.errors[0]).toContain('future');
  });

  test('validateGoal should check percent and deadline', () => {
    // Valid goal
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const valid = validateGoal({
      targetPercent: 15,
      deadline: tomorrowStr,
    });
    expect(valid.valid).toBe(true);

    // Invalid percent
    const invalidPercent = validateGoal({
      targetPercent: 120,
      deadline: tomorrowStr,
    });
    expect(invalidPercent.valid).toBe(false);

    // Past deadline
    const invalidDeadline = validateGoal({
      targetPercent: 10,
      deadline: '2020-01-01',
    });
    expect(invalidDeadline.valid).toBe(false);
  });

  test('isPositiveNumber should check for positive non-finite numbers', () => {
    expect(isPositiveNumber(10)).toBe(true);
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-5)).toBe(false);
    expect(isPositiveNumber('abc')).toBe(false);
  });

  test('isValidDate should validate ISO date format', () => {
    expect(isValidDate('2026-06-09')).toBe(true);
    expect(isValidDate('2026/06/09')).toBe(false);
    expect(isValidDate('invalid')).toBe(false);
  });

  test('isValidCategory should validate categories', () => {
    expect(isValidCategory('transport')).toBe(true);
    expect(isValidCategory('unknown')).toBe(false);
  });
});
