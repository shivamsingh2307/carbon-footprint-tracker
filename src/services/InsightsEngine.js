/**
 * InsightsEngine — Generates personalized carbon reduction tips
 * based on user activity patterns.
 * @module InsightsEngine
 */

import { getCategoryBreakdown, getDailyAverage, getCurrentStreak, getComparisonData } from './CalculatorService.js';
import { getActivities } from './StorageService.js';
import { formatCO2 } from '../utils/formatters.js';

/**
 * @typedef {Object} Insight
 * @property {string} id - Unique insight identifier
 * @property {string} icon - Emoji icon
 * @property {string} title - Short title
 * @property {string} text - Detailed suggestion
 * @property {string} [savings] - Estimated annual savings
 * @property {'high'|'medium'|'low'} priority
 */

/**
 * Generate personalized insights based on user data.
 * @param {number} [days=30] - Analysis period
 * @returns {Insight[]} Sorted by priority (high first)
 */
export function generateInsights(days = 30) {
  const activities = getActivities();
  const insights = [];

  if (activities.length === 0) {
    return [getWelcomeInsight()];
  }

  // Analyze patterns
  const breakdown = getCategoryBreakdown(days);
  const dailyAvg = getDailyAverage(days);
  const comparison = getComparisonData(days);
  const streak = getCurrentStreak();

  // 1. Highest category insight
  const topCategory = breakdown[0];
  if (topCategory && topCategory.total > 0) {
    insights.push(getTopCategoryInsight(topCategory));
  }

  // 2. Transport-specific insights
  const transportInsights = analyzeTransport(activities, days);
  insights.push(...transportInsights);

  // 3. Food-specific insights
  const foodInsights = analyzeFood(activities, days);
  insights.push(...foodInsights);

  // 4. Energy insights
  const energyInsights = analyzeEnergy(activities, days);
  insights.push(...energyInsights);

  // 5. Comparison insight
  if (dailyAvg > 0) {
    insights.push(getComparisonInsight(comparison));
  }

  // 6. Streak insight
  if (streak > 0) {
    insights.push(getStreakInsight(streak));
  }

  // 7. General eco-tips (always include 1-2)
  insights.push(...getGeneralTips(activities));

  // Sort by priority and limit
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return insights
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 8);
}

/**
 * Welcome insight for new users.
 * @returns {Insight}
 */
function getWelcomeInsight() {
  return {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome to EcoTrack!',
    text: 'Start by logging your daily activities to get personalized insights and track your carbon footprint over time.',
    priority: 'high',
  };
}

/**
 * Insight about the highest-emission category.
 * @param {Object} category
 * @returns {Insight}
 */
function getTopCategoryInsight(category) {
  const tips = {
    transport: 'Consider carpooling, cycling, or taking public transit for shorter trips.',
    food: 'Swapping one red meat meal per week for plant-based can make a big difference.',
    energy: 'Switching to LED bulbs and reducing standby power can cut energy emissions.',
    home: 'Shorter showers and cold washes can significantly reduce home emissions.',
    shopping: 'Buying secondhand or repairing items extends their lifecycle and saves emissions.',
    waste: 'Composting food scraps and improving recycling reduces landfill methane.',
  };

  return {
    id: `top-category-${category.category}`,
    icon: category.icon,
    title: `${category.name} is your biggest source`,
    text: `${category.name} accounts for ${category.percentage.toFixed(0)}% of your footprint (${formatCO2(category.total)}). ${tips[category.category] || ''}`,
    savings: category.total > 10 ? `Potential: save ${formatCO2(category.total * 0.2)}/month` : undefined,
    priority: 'high',
  };
}

/**
 * Analyze transport activities for specific tips.
 * @param {Object[]} activities
 * @param {number} days
 * @returns {Insight[]}
 */
function analyzeTransport(activities, days) {
  const insights = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  const periodActivities = activities.filter((a) => a.date >= startStr);
  const carTrips = periodActivities.filter((a) => ['car-petrol', 'car-diesel'].includes(a.activityId));
  const flights = periodActivities.filter((a) => ['flight-short', 'flight-long'].includes(a.activityId));

  if (carTrips.length > 5) {
    const totalKm = carTrips.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const carEmissions = carTrips.reduce((sum, a) => sum + (a.emission || 0), 0);
    const cyclingSavings = carEmissions; // 100% savings if switched to cycling

    insights.push({
      id: 'transport-car-switch',
      icon: '🚲',
      title: 'Switch some car trips to cycling',
      text: `You've driven ${totalKm.toFixed(0)} km recently. Switching just 2 trips/week to cycling or walking could save significant emissions.`,
      savings: `Up to ${formatCO2(cyclingSavings * 0.3)}/month`,
      priority: 'high',
    });
  }

  if (flights.length > 0) {
    const flightEmissions = flights.reduce((sum, a) => sum + (a.emission || 0), 0);
    insights.push({
      id: 'transport-flight',
      icon: '✈️',
      title: 'Air travel has high impact',
      text: `Your recent flights generated ${formatCO2(flightEmissions)}. Consider trains for shorter routes — they produce up to 80% fewer emissions.`,
      priority: 'medium',
    });
  }

  return insights;
}

/**
 * Analyze food activities for specific tips.
 * @param {Object[]} activities
 * @param {number} days
 * @returns {Insight[]}
 */
function analyzeFood(activities, days) {
  const insights = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  const periodActivities = activities.filter((a) => a.date >= startStr);
  const meatMeals = periodActivities.filter((a) => a.activityId === 'meal-high-meat');
  const veganMeals = periodActivities.filter((a) => a.activityId === 'meal-vegan');

  if (meatMeals.length > 3) {
    const meatEmissions = meatMeals.reduce((sum, a) => sum + (a.emission || 0), 0);
    const perMealSaving = 6.0 - 0.7; // Difference between beef and vegan meal

    insights.push({
      id: 'food-reduce-meat',
      icon: '🥗',
      title: 'Try more plant-based meals',
      text: `You had ${meatMeals.length} beef/lamb meals. Each swap to a plant-based meal saves ~${perMealSaving.toFixed(1)} kg CO₂e.`,
      savings: `${formatCO2(perMealSaving * 4)}/month by swapping 4 meals`,
      priority: 'high',
    });
  }

  if (veganMeals.length > 5) {
    insights.push({
      id: 'food-vegan-great',
      icon: '🌱',
      title: 'Great plant-based choices!',
      text: `You've had ${veganMeals.length} vegan meals. Keep it up — your food footprint is lower than average!`,
      priority: 'low',
    });
  }

  return insights;
}

/**
 * Analyze energy activities.
 * @param {Object[]} activities
 * @param {number} days
 * @returns {Insight[]}
 */
function analyzeEnergy(activities, days) {
  const insights = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  const periodActivities = activities.filter((a) => a.date >= startStr);
  const electricityEntries = periodActivities.filter((a) => a.activityId === 'electricity');

  if (electricityEntries.length > 0) {
    const totalKwh = electricityEntries.reduce((sum, a) => sum + (a.quantity || 0), 0);
    if (totalKwh > 100) {
      insights.push({
        id: 'energy-electricity',
        icon: '💡',
        title: 'Reduce standby power',
        text: `You've used ${totalKwh.toFixed(0)} kWh of electricity. Unplugging devices on standby can save 5-10% of your electricity use.`,
        savings: `~${formatCO2(totalKwh * 0.233 * 0.07)}/month`,
        priority: 'medium',
      });
    }
  }

  return insights;
}

/**
 * Comparison insight.
 * @param {Object} comparison
 * @returns {Insight}
 */
function getComparisonInsight(comparison) {
  const isBelow = comparison.vsGlobal < 0;
  return {
    id: 'comparison',
    icon: isBelow ? '🌍' : '📊',
    title: isBelow ? 'Below global average!' : 'Room for improvement',
    text: isBelow
      ? `Your daily average (${formatCO2(comparison.userAvg)}) is ${Math.abs(comparison.vsGlobal).toFixed(0)}% below the global average. Great job!`
      : `Your daily average (${formatCO2(comparison.userAvg)}) is ${comparison.vsGlobal.toFixed(0)}% above the global average of ${formatCO2(comparison.globalAvg)}/day.`,
    priority: isBelow ? 'low' : 'medium',
  };
}

/**
 * Streak motivation insight.
 * @param {number} streak
 * @returns {Insight}
 */
function getStreakInsight(streak) {
  const messages = {
    1: 'You logged today — start building a streak!',
    3: 'Amazing! 3-day streak. Consistency is key.',
    7: '🔥 One week streak! You\'re building great habits.',
    14: 'Two weeks strong! Your data is getting more accurate.',
    30: '🏆 One month! You\'re a dedicated eco-tracker.',
  };

  const key = Object.keys(messages)
    .map(Number)
    .filter((k) => streak >= k)
    .pop();

  return {
    id: 'streak',
    icon: '🔥',
    title: `${streak}-day streak`,
    text: messages[key] || `${streak} days of consistent tracking. Keep going!`,
    priority: streak >= 7 ? 'low' : 'medium',
  };
}

/**
 * Get general eco-tips.
 * @param {Object[]} activities
 * @returns {Insight[]}
 */
function getGeneralTips(activities) {
  const allTips = [
    {
      id: 'tip-cold-wash',
      icon: '🧊',
      title: 'Try cold water washing',
      text: 'Washing clothes at 30°C instead of 40°C can reduce energy use per wash by ~40%.',
      priority: 'low',
    },
    {
      id: 'tip-line-dry',
      icon: '☀️',
      title: 'Air-dry your laundry',
      text: 'Skipping the tumble dryer saves about 1 kg CO₂e per load.',
      priority: 'low',
    },
    {
      id: 'tip-local-food',
      icon: '🌽',
      title: 'Choose seasonal & local food',
      text: 'Seasonal produce has a lower transport footprint and is often fresher and cheaper.',
      priority: 'low',
    },
    {
      id: 'tip-reusable',
      icon: '🫙',
      title: 'Bring reusable containers',
      text: 'A reusable bottle, bag, and coffee cup can save hundreds of single-use items per year.',
      priority: 'low',
    },
  ];

  // Return 2 random tips
  const shuffled = allTips.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}
