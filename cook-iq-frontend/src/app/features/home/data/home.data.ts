import { CTAContent, Feature, SiteStat, Step, Testimonial } from "../models/home.models";

export const SITE_STATS: SiteStat[] = [
  {
    value: 1,
    display: '1M+',
    label: 'Recipes Generated',
    suffix: 'M+',
  },
  {
    value: 10,
    display: '10',
    label: 'Free Scans / Mo',
  },
  {
    value: 4.9,
    display: '4.9',
    label: 'App Store Rating',
    isDecimal: true,
  },
  {
    value: 0,
    display: '₹0',
    label: 'To Get Started',
    prefix: '₹',
  },
];

export const FEATURES: Feature[] = [
  {
    icon: 'camera', tag: '10 scans free / mo', num: '01', theme: 'forest',
    title: 'Pantry Vision',
    desc: 'Point. Shoot. Know. Our AI reads your fridge in seconds — no typing, no guessing.',
  },
  {
    icon: 'chef-hat', tag: '5 meals free / mo', num: '02', theme: 'spice',
    title: 'AI Chef Brain',
    desc: 'Leftover pasta? Half an onion? We conjure restaurant-level meals from whatever you have.',
  },
  {
    icon: 'search', tag: 'Unlimited searches', num: '03', theme: 'gold',
    title: 'Infinite Search',
    desc: 'Filter by cuisine, cook time, dietary need, or mood. Find your next obsession in seconds.',
  },
  {
    icon: 'book-open', tag: '3 saves free / mo', num: '04', theme: 'sage',
    title: 'Digital Cookbook',
    desc: 'Save, curate, and share. Export your personal cookbook as a beautiful PDF.',
  },
];

export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    step: '01',
    title: 'Scan',
    desc: 'Point your camera at your fridge or pantry.',
    detail: 'AI identifies every ingredient in seconds.',
  },
  {
    step: '02',
    title: 'Select',
    desc: 'Browse curated recipes built from what you have.',
    detail: 'Filter by time, mood, or dietary preference.',
  },
  {
    step: '03',
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
    initials: 'P',
    delay: '0s',
  },
  {
    text: 'The AI suggested a dish I never would have thought of — it became my family\'s favourite.',
    name: 'Marcus L.',
    location: 'London',
    initials: 'M',
    delay: '0.12s',
  },
  {
    text: 'Finally, an app that treats cooking like the creative act it actually is.',
    name: 'Sofia R.',
    location: 'Barcelona',
    initials: 'S',
    delay: '0.24s',
  },
];

export const CTA_CONTENT: CTAContent = {
  badge: '✦ Free. No credit card.',
  title: 'Ready to eat smarter tonight?',
  subtitle: 'Join 10,000+ cooks who stopped wasting food and started enjoying every meal.',
  primaryBtn: 'Start Cooking Free',
  secondaryBtn: 'Browse Recipes',
};