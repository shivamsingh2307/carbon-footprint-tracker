import { describe, test, expect, beforeEach } from 'vitest';
import { generateInsights } from '../src/services/InsightsEngine.js';
import { STORAGE_KEYS } from '../src/utils/constants.js';

describe('Insights Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('generateInsights should return welcome tip for new users', () => {
    const insights = generateInsights(30);
    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('welcome');
  });

  test('generateInsights should return recommendations for high-impact areas', () => {
    const mockActivities = [
      { id: '1', date: '2026-06-08', activityId: 'car-petrol', quantity: 200, emission: 42.0, category: 'transport' },
      { id: '2', date: '2026-06-07', activityId: 'meal-high-meat', quantity: 10, emission: 60.0, category: 'food' },
    ];
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mockActivities));

    const insights = generateInsights(30);
    expect(insights.length).toBeGreaterThan(1);
    
    // Should have top category insight and switch-car insight
    const ids = insights.map(i => i.id);
    expect(ids.some(id => id.startsWith('top-category-'))).toBe(true);
    expect(ids).toContain('transport-car-switch');
    expect(ids).toContain('food-reduce-meat');
  });
});
