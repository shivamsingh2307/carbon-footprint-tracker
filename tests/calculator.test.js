import { describe, test, expect, beforeEach } from 'vitest';
import { calculateEmission, getDailyTotal, getPeriodTotal, getDailyAverage, getCategoryBreakdown } from '../src/services/CalculatorService.js';
import { STORAGE_KEYS } from '../src/utils/constants.js';

describe('Calculator Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('calculateEmission should compute accurate CO2 equivalent', () => {
    // car-petrol has co2ePerUnit = 0.21
    expect(calculateEmission('car-petrol', 10)).toBe(2.1);
    // solar has co2ePerUnit = 0.0
    expect(calculateEmission('solar', 500)).toBe(0);
    // Invalid/negative inputs
    expect(calculateEmission('car-petrol', -10)).toBe(0);
    expect(calculateEmission('non-existent', 10)).toBe(0);
  });

  test('getDailyTotal and getPeriodTotal should return sum of emissions', () => {
    const mockActivities = [
      { id: '1', date: '2026-06-08', activityId: 'car-petrol', quantity: 10, emission: 2.1, category: 'transport' },
      { id: '2', date: '2026-06-08', activityId: 'meal-mixed', quantity: 1, emission: 2.5, category: 'food' },
      { id: '3', date: '2026-06-07', activityId: 'electricity', quantity: 100, emission: 23.3, category: 'energy' },
    ];
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mockActivities));

    expect(getDailyTotal('2026-06-08')).toBe(4.6);
    expect(getDailyTotal('2026-06-07')).toBe(23.3);
    expect(getDailyTotal('2026-06-06')).toBe(0);
  });

  test('getCategoryBreakdown should group correctly by category', () => {
    const mockActivities = [
      { id: '1', date: '2026-06-08', activityId: 'car-petrol', quantity: 10, emission: 2.0, category: 'transport' },
      { id: '2', date: '2026-06-08', activityId: 'meal-mixed', quantity: 1, emission: 3.0, category: 'food' },
    ];
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mockActivities));

    const breakdown = getCategoryBreakdown(7);
    const transportBreakdown = breakdown.find(b => b.category === 'transport');
    const foodBreakdown = breakdown.find(b => b.category === 'food');

    expect(transportBreakdown.total).toBe(2.0);
    expect(foodBreakdown.total).toBe(3.0);
    expect(transportBreakdown.percentage).toBe(40);
    expect(foodBreakdown.percentage).toBe(60);
  });
});
