/**
 * Emission Factors Database
 *
 * CO₂ equivalent emissions per unit of activity.
 * Sources: EPA, DEFRA 2024, Our World in Data, IEA.
 *
 * All values are in kg CO₂e per unit.
 * @module emissionFactors
 */

/** @enum {string} Activity categories */
export const CATEGORIES = Object.freeze({
  TRANSPORT: 'transport',
  FOOD: 'food',
  ENERGY: 'energy',
  HOME: 'home',
  SHOPPING: 'shopping',
  WASTE: 'waste',
});

/**
 * @typedef {Object} EmissionFactor
 * @property {string} id - Unique identifier
 * @property {string} category - Category key from CATEGORIES
 * @property {string} name - Human-readable activity name
 * @property {string} unit - Unit of measurement
 * @property {number} co2ePerUnit - kg CO₂e per unit
 * @property {string} icon - Emoji icon
 * @property {string} description - Brief description
 */

/** @type {ReadonlyArray<EmissionFactor>} */
export const EMISSION_FACTORS = Object.freeze([
  // ====== TRANSPORT ======
  {
    id: 'car-petrol',
    category: CATEGORIES.TRANSPORT,
    name: 'Car (Petrol)',
    unit: 'km',
    co2ePerUnit: 0.21,
    icon: '🚗',
    description: 'Average petrol car, single occupant',
  },
  {
    id: 'car-diesel',
    category: CATEGORIES.TRANSPORT,
    name: 'Car (Diesel)',
    unit: 'km',
    co2ePerUnit: 0.17,
    icon: '🚙',
    description: 'Average diesel car, single occupant',
  },
  {
    id: 'car-electric',
    category: CATEGORIES.TRANSPORT,
    name: 'Car (Electric)',
    unit: 'km',
    co2ePerUnit: 0.05,
    icon: '⚡',
    description: 'Battery electric vehicle',
  },
  {
    id: 'bus',
    category: CATEGORIES.TRANSPORT,
    name: 'Bus',
    unit: 'km',
    co2ePerUnit: 0.089,
    icon: '🚌',
    description: 'Average local bus',
  },
  {
    id: 'train',
    category: CATEGORIES.TRANSPORT,
    name: 'Train',
    unit: 'km',
    co2ePerUnit: 0.041,
    icon: '🚆',
    description: 'National rail average',
  },
  {
    id: 'bicycle',
    category: CATEGORIES.TRANSPORT,
    name: 'Bicycle',
    unit: 'km',
    co2ePerUnit: 0.0,
    icon: '🚲',
    description: 'Zero direct emissions',
  },
  {
    id: 'walking',
    category: CATEGORIES.TRANSPORT,
    name: 'Walking',
    unit: 'km',
    co2ePerUnit: 0.0,
    icon: '🚶',
    description: 'Zero direct emissions',
  },
  {
    id: 'flight-short',
    category: CATEGORIES.TRANSPORT,
    name: 'Flight (Short-haul)',
    unit: 'km',
    co2ePerUnit: 0.255,
    icon: '✈️',
    description: 'Flights under 3 hours, economy',
  },
  {
    id: 'flight-long',
    category: CATEGORIES.TRANSPORT,
    name: 'Flight (Long-haul)',
    unit: 'km',
    co2ePerUnit: 0.195,
    icon: '🛫',
    description: 'Flights over 3 hours, economy',
  },
  {
    id: 'motorcycle',
    category: CATEGORIES.TRANSPORT,
    name: 'Motorcycle',
    unit: 'km',
    co2ePerUnit: 0.103,
    icon: '🏍️',
    description: 'Average motorcycle',
  },

  // ====== FOOD ======
  {
    id: 'meal-vegan',
    category: CATEGORIES.FOOD,
    name: 'Vegan Meal',
    unit: 'meal',
    co2ePerUnit: 0.7,
    icon: '🥗',
    description: 'Fully plant-based meal',
  },
  {
    id: 'meal-vegetarian',
    category: CATEGORIES.FOOD,
    name: 'Vegetarian Meal',
    unit: 'meal',
    co2ePerUnit: 1.4,
    icon: '🧀',
    description: 'Includes dairy/eggs, no meat',
  },
  {
    id: 'meal-mixed',
    category: CATEGORIES.FOOD,
    name: 'Mixed Meal',
    unit: 'meal',
    co2ePerUnit: 2.5,
    icon: '🍽️',
    description: 'Includes poultry or fish',
  },
  {
    id: 'meal-high-meat',
    category: CATEGORIES.FOOD,
    name: 'Beef/Lamb Meal',
    unit: 'meal',
    co2ePerUnit: 6.0,
    icon: '🥩',
    description: 'Red meat as main protein',
  },
  {
    id: 'coffee',
    category: CATEGORIES.FOOD,
    name: 'Coffee (Latte)',
    unit: 'cup',
    co2ePerUnit: 0.55,
    icon: '☕',
    description: 'Milk-based coffee drink',
  },
  {
    id: 'food-waste',
    category: CATEGORIES.FOOD,
    name: 'Food Waste',
    unit: 'kg',
    co2ePerUnit: 2.5,
    icon: '🗑️',
    description: 'Food sent to landfill',
  },

  // ====== ENERGY ======
  {
    id: 'electricity',
    category: CATEGORIES.ENERGY,
    name: 'Electricity',
    unit: 'kWh',
    co2ePerUnit: 0.233,
    icon: '💡',
    description: 'Grid average (varies by region)',
  },
  {
    id: 'natural-gas',
    category: CATEGORIES.ENERGY,
    name: 'Natural Gas',
    unit: 'kWh',
    co2ePerUnit: 0.184,
    icon: '🔥',
    description: 'Gas heating/cooking',
  },
  {
    id: 'solar',
    category: CATEGORIES.ENERGY,
    name: 'Solar Energy',
    unit: 'kWh',
    co2ePerUnit: 0.0,
    icon: '☀️',
    description: 'Zero operational emissions',
  },
  {
    id: 'heating-oil',
    category: CATEGORIES.ENERGY,
    name: 'Heating Oil',
    unit: 'litre',
    co2ePerUnit: 2.54,
    icon: '🛢️',
    description: 'Home heating oil',
  },

  // ====== HOME ======
  {
    id: 'shower-short',
    category: CATEGORIES.HOME,
    name: 'Shower (5 min)',
    unit: 'session',
    co2ePerUnit: 1.0,
    icon: '🚿',
    description: 'Gas-heated hot water, 5 minutes',
  },
  {
    id: 'shower-long',
    category: CATEGORIES.HOME,
    name: 'Shower (10 min)',
    unit: 'session',
    co2ePerUnit: 2.0,
    icon: '🛁',
    description: 'Gas-heated hot water, 10 minutes',
  },
  {
    id: 'laundry-warm',
    category: CATEGORIES.HOME,
    name: 'Laundry (Warm)',
    unit: 'load',
    co2ePerUnit: 0.6,
    icon: '👕',
    description: 'Washing machine at 40°C',
  },
  {
    id: 'laundry-cold',
    category: CATEGORIES.HOME,
    name: 'Laundry (Cold)',
    unit: 'load',
    co2ePerUnit: 0.3,
    icon: '🧊',
    description: 'Washing machine cold wash',
  },
  {
    id: 'tumble-dryer',
    category: CATEGORIES.HOME,
    name: 'Tumble Dryer',
    unit: 'load',
    co2ePerUnit: 1.0,
    icon: '🌀',
    description: 'One dryer cycle',
  },
  {
    id: 'dishwasher',
    category: CATEGORIES.HOME,
    name: 'Dishwasher',
    unit: 'load',
    co2ePerUnit: 0.77,
    icon: '🍽️',
    description: 'One dishwasher cycle',
  },
  {
    id: 'streaming',
    category: CATEGORIES.HOME,
    name: 'Video Streaming',
    unit: 'hour',
    co2ePerUnit: 0.036,
    icon: '📺',
    description: 'HD streaming on WiFi',
  },

  // ====== SHOPPING ======
  {
    id: 'clothing-new',
    category: CATEGORIES.SHOPPING,
    name: 'New Clothing Item',
    unit: 'item',
    co2ePerUnit: 10.0,
    icon: '👗',
    description: 'Average new garment',
  },
  {
    id: 'clothing-secondhand',
    category: CATEGORIES.SHOPPING,
    name: 'Secondhand Clothing',
    unit: 'item',
    co2ePerUnit: 0.5,
    icon: '♻️',
    description: 'Thrift/secondhand garment',
  },
  {
    id: 'electronics-phone',
    category: CATEGORIES.SHOPPING,
    name: 'New Smartphone',
    unit: 'item',
    co2ePerUnit: 70.0,
    icon: '📱',
    description: 'Manufacturing + shipping',
  },
  {
    id: 'electronics-laptop',
    category: CATEGORIES.SHOPPING,
    name: 'New Laptop',
    unit: 'item',
    co2ePerUnit: 350.0,
    icon: '💻',
    description: 'Manufacturing + shipping',
  },
  {
    id: 'general-goods',
    category: CATEGORIES.SHOPPING,
    name: 'General Purchase',
    unit: '£10 spent',
    co2ePerUnit: 5.0,
    icon: '🛍️',
    description: 'Average manufactured goods',
  },

  // ====== WASTE ======
  {
    id: 'recycling',
    category: CATEGORIES.WASTE,
    name: 'Recycling',
    unit: 'kg',
    co2ePerUnit: -0.5,
    icon: '♻️',
    description: 'Avoided emissions from recycling',
  },
  {
    id: 'landfill',
    category: CATEGORIES.WASTE,
    name: 'Landfill Waste',
    unit: 'kg',
    co2ePerUnit: 0.58,
    icon: '🏭',
    description: 'Waste sent to landfill',
  },
  {
    id: 'composting',
    category: CATEGORIES.WASTE,
    name: 'Composting',
    unit: 'kg',
    co2ePerUnit: -0.1,
    icon: '🌱',
    description: 'Avoided emissions from composting',
  },
]);

/**
 * Category metadata for UI display.
 * @type {ReadonlyArray<Object>}
 */
export const CATEGORY_META = Object.freeze([
  { id: CATEGORIES.TRANSPORT, name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: CATEGORIES.FOOD, name: 'Food', icon: '🍽️', color: '#f59e0b' },
  { id: CATEGORIES.ENERGY, name: 'Energy', icon: '⚡', color: '#eab308' },
  { id: CATEGORIES.HOME, name: 'Home', icon: '🏠', color: '#8b5cf6' },
  { id: CATEGORIES.SHOPPING, name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: CATEGORIES.WASTE, name: 'Waste', icon: '♻️', color: '#10b981' },
]);

/**
 * Lookup an emission factor by ID.
 * @param {string} id
 * @returns {EmissionFactor|undefined}
 */
export function getFactorById(id) {
  return EMISSION_FACTORS.find((f) => f.id === id);
}

/**
 * Get all factors for a given category.
 * @param {string} category - Category key from CATEGORIES
 * @returns {EmissionFactor[]}
 */
export function getFactorsByCategory(category) {
  return EMISSION_FACTORS.filter((f) => f.category === category);
}
