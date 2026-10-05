import { Callout, CTAContent, Feature, RecipeMatch, SiteStat, Step, Testimonial } from "../models/home.models";

export const SITE_STATS: SiteStat[] = [
  { value: 10, label: 'Free scans every month' },
  { value: 5, label: 'Free AI meals every month' },
  { text: 'Unlimited', label: 'Recipe searches' },
  { value: 0, prefix: '₹', label: 'To get started' },
];

export const FEATURES: Feature[] = [
  {
    icon: 'scan-line',
    tag: 'Ingredient vision',
    theme: 'forest',
    title: 'Scan your kitchen.',
    desc: 'Show CookIQ what is already in your fridge or pantry. AI identifies your ingredients and turns them into a starting point for dinner.',
  },
  {
    icon: 'chef-hat',
    tag: 'AI reasoning',
    theme: 'spice',
    title: 'Think like a chef.',
    desc: 'CookIQ combines ingredients, cuisine, preferences and context to build recipes that make sense together.',
  },
  {
    icon: 'sparkles',
    tag: 'Personalized',
    theme: 'gold',
    title: 'Recipes that fit you.',
    desc: 'Your time, diet, taste and available ingredients shape every recommendation — not the other way around.',
  },
  {
    icon: 'sliders-horizontal',
    tag: 'Adaptive cooking',
    theme: 'sage',
    title: 'Make it work.',
    desc: 'Missing an ingredient? Short on time? Adjust the recipe without starting over.',
  },
  {
    icon: 'book-open',
    tag: 'Your collection',
    theme: 'forest',
    title: 'Build your cookbook.',
    desc: 'Save the recipes worth making again, organize your favourites and build a cookbook around the way you actually cook.',
  },
  {
    icon: 'leaf',
    tag: 'Less waste',
    theme: 'spice',
    title: 'Use what you have.',
    desc: 'Cook with ingredients before they are forgotten, discover new combinations and make better use of what is already in your kitchen.',
  },
];

export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    title: 'Scan',
    desc: 'Point your camera at your fridge or pantry.',
    detail: 'AI identifies every ingredient in seconds.',
  },
  {
    title: 'Select',
    desc: 'Browse curated recipes built from what you have.',
    detail: 'Filter by time, mood, or dietary preference.',
  },
  {
    title: 'Savor',
    desc: 'Cook with confidence using guided steps.',
    detail: 'Rate, save, and share your masterpiece.',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    text: 'I used to throw away half my groceries every week. Now I waste almost nothing.',
    name: 'Priya M.',
    location: 'Bangalore',
    category: 'Less waste',
    avatarUrl: '/assets/testimonials/priya.jpg',
    postUrl: '#',
    timestamp: '2 days ago',
    handle: '@priya',
  },
  {
    text: 'The AI suggested a dish I never would have thought of — it became my family’s favourite.',
    name: 'Marcus L.',
    location: 'London',
    category: 'Quick dinner',
    avatarUrl: '/assets/testimonials/marcus.jpg',
    postUrl: '#',
    timestamp: '5 days ago',
    handle: '@marcus',
  },
  {
    text: 'Finally, an app that treats cooking like the creative act it actually is.',
    name: 'Sofia R.',
    location: 'Barcelona',
    category: 'Creative cooking',
    avatarUrl: '/assets/testimonials/sofia.jpg',
    postUrl: '#',
    timestamp: '1 week ago',
    handle: '@sofia',
  },
  {
    text: 'I opened my fridge with no idea what to cook. CookIQ turned those random ingredients into a proper dinner.',
    name: 'Daniel K.',
    location: 'Melbourne',
    category: 'Pantry ideas',
    avatarUrl: '/assets/testimonials/daniel.jpg',
    postUrl: '#',
    timestamp: '3 days ago',
    handle: '@daniel',
  },
  {
    text: 'It feels less like following a recipe and more like having a smart cooking partner beside me.',
    name: 'Anil S.',
    location: 'Dubai',
    category: 'AI cooking',
    avatarUrl: '/assets/testimonials/anil.jpg',
    postUrl: '#',
    timestamp: '6 days ago',
    handle: '@anil',
  },
];

export const CTA_CONTENT: CTAContent = {
  eyebrow: 'THE SMARTER WAY TO COOK',

  title: {
    first: 'Your kitchen',
    highlight: 'has more to say.',
  },

  description:
    "Turn the ingredients you already have into meals you'll actually want to cook.",

  benefits: [
    {
      icon: 'sparkles',
      label: 'AI-powered recipes',
    },
    {
      icon: 'scan-line',
      label: 'Smart ingredient scanning',
    },
    {
      icon: 'clock',
      label: 'Cook with what you have',
    },
  ],

  primaryAction: {
    label: 'Get CookIQ Plus',
  },

  secondaryAction: {
    label: 'Start cooking free',
    route: '/dashboard',
  },

  trust: [
    {
      icon: 'check',
      label: 'Free to start',
    },
    {
      icon: 'zap',
      label: 'No commitment',
    },
    {
      icon: 'shield',
      label: 'Secure checkout',
    },
  ],

  visual: {
    aiLabel: 'COOKIQ AI',
    aiStatus: 'Ready to cook',

    recipeLabel: 'YOUR NEXT MEAL',
    recipeTitle: 'Rustic Tomato Basil Pasta',

    recipeMeta: [
      {
        icon: 'clock',
        label: '25 min',
      },
      {
        icon: 'star',
        label: '98%',
      },
    ],
  },

  bottomStatement: {
    items: [
      'Less planning.',
      'Less waste.',
    ],
    highlight: 'Better meals.',
  },
};

export const HERO_WORDS = ['leftovers', 'pantry staples', 'random bits', 'anything'] as const;
export const HERO_TRUST = ['Free to start', '10 scans a month', 'No credit card'];

// Recalibrated coordinates for crisp layout & line geometry
export const HERO_CALLOUTS: Callout[] = [
  { label: 'Vine tomatoes', note: 'Ripe · 4 pcs', pin: { x: 38, y: 44 }, anchor: { x: 12, y: 30 }, side: 'left' },
  { label: 'Garlic cloves', note: '3 cloves', pin: { x: 42, y: 64 }, anchor: { x: 12, y: 72 }, side: 'left' },
  { label: 'Fresh basil', note: 'Small bunch', pin: { x: 58, y: 36 }, anchor: { x: 88, y: 30 }, side: 'right' },
  { label: 'Olive oil', note: 'Extra virgin', pin: { x: 62, y: 54 }, anchor: { x: 88, y: 62 }, side: 'right' },
];

export const HERO_REASONING = 'Uses 6 of your 9 ingredients';
export const HERO_MATCH: RecipeMatch = {
  title: 'Rustic Tomato Basil Pasta',
  score: 98,
  minutes: 25,
  servings: 2,
  diet: 'Vegetarian',
  image: '/assets/recipes/pasta-dish.png',
};