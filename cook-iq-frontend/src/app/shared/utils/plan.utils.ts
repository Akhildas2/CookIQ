export type PlanName = 'free' | 'pro' | 'premium' | 'loading';

/* ICONS */
export const PLAN_ICONS: Record<PlanName, string> = {
    free: 'eco',
    pro: 'bolt',
    premium: 'workspace_premium',
    loading: 'hourglass_empty'
};

/* BADGE STYLE (with background) */
export const PLAN_BADGE_CLASSES: Record<PlanName, string> = {
    free: 'bg-blue-100 text-blue-800 border-blue-300',

    pro: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',

    premium:
        'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300',

    loading:
        'bg-gray-100 text-gray-400 border-gray-200 animate-pulse'
};

/* TEXT COLOR ONLY (for price, headings, etc.) */
export const PLAN_TEXT_COLORS: Record<PlanName, string> = {
    free: 'text-blue-700',

    pro: 'text-green-700',

    premium: 'text-orange-600',

    loading: 'text-gray-400'
};

/* ICON */
export function getPlanIcon(plan: PlanName | string): string {
    return PLAN_ICONS[plan as PlanName] ?? 'star';
}

/* BADGE STYLE */
export function getPlanBadgeClass(plan: PlanName | string): string {
    return PLAN_BADGE_CLASSES[plan as PlanName] ??
        'bg-gray-100 text-gray-700 border-gray-300';
}

/* TEXT COLOR ONLY */
export function getPlanTextColor(plan: PlanName | string): string {
    return PLAN_TEXT_COLORS[plan as PlanName] ?? 'text-gray-700';
}