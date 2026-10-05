export interface SiteStat {
  label: string;
  value?: number;      // omit for static text stats
  prefix?: string;
  suffix?: string;
  decimals?: number;
  text?: string;       // shown as-is, no count-up (e.g. "Unlimited")
}

export interface Feature {
  icon: string;
  tag: string;
  title: string;
  desc: string;
  theme: 'forest' | 'spice' | 'gold' | 'sage';
}

export interface Step {
  title: string;
  desc: string;
  detail: string;
}

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  category: string;
  avatarUrl: string;
  postUrl: string;
  timestamp: string;
  handle: string;
}

export interface CTAContent {
  eyebrow: string;

  title: {
    first: string;
    highlight: string;
  };

  description: string;

  benefits: {
    icon: string;
    label: string;
  }[];

  primaryAction: {
    label: string;
  };

  secondaryAction: {
    label: string;
    route: string;
  };

  trust: {
    icon: string;
    label: string;
  }[];

  visual: {
    aiLabel: string;
    aiStatus: string;

    recipeLabel: string;
    recipeTitle: string;

    recipeMeta: {
      icon: string;
      label: string;
    }[];
  };

  bottomStatement: {
    items: string[];
    highlight: string;
  };
}


export interface Point { x: number; y: number }

export interface Callout {
  label: string;
  note: string;
  pin: Point;
  anchor: Point;
  side: 'left' | 'right';
}

export interface RecipeMatch {
  title: string;
  score: number;
  minutes: number;
  servings: number;
  diet: string;
  image: string;
}

export type SectionHeaderVariant =
  | 'default'
  | 'process'
  | 'split';