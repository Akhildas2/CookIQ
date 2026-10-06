import { DashboardQuickAction } from "../models/dashboard.models";

export const DASHBOARD_QUICK_ACTIONS: readonly DashboardQuickAction[] = [
  {
    title: 'Find a recipe',
    description: 'Explore recipes based on what you feel like cooking.',
    icon: 'search',
    route: '/recipes',
    accent: 'spice',
  },
  {
    title: 'Use my pantry',
    description: 'Turn the ingredients you already have into meal ideas.',
    icon: 'chef-hat',
    route: '/pantry',
    accent: 'forest',
  },
  {
    title: 'AI Cook',
    description: 'Let CookIQ help you plan and cook your next meal.',
    icon: 'sparkles',
    route: '/ai-cook',
    accent: 'gold',
  },
  {
    title: 'Scan ingredients',
    description: 'Scan what is around you and discover what you can make.',
    icon: 'scan-line',
    route: '/ai-cook',
    accent: 'sage',
  },
];