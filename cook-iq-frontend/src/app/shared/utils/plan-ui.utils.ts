import { BillingPlan } from "../../features/billing/models/plan.model";

export function getButtonLabel(plan: BillingPlan, action: string, billingCycle: 'monthly' | 'yearly'): string {

    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const labels: Record<string, string> = {

        current: 'Current Plan',

        upgrade: `Upgrade to ${cap(plan.name)}`,

        downgrade: `Switch to ${cap(plan.name)}`,

        subscribe: plan.name === 'free' ? 'Your Default' : 'Get Started',

        'cycle-change': billingCycle === 'yearly' ? 'Switch to Yearly' : 'Switch to Monthly'
    };

    return labels[action] ?? '';
}


export function getButtonClass(isLoading: boolean, isCurrent: boolean, subscriptionLoading: boolean): string {

    if (isLoading) {
        return 'border-2 border-green-500 text-green-700 bg-transparent cursor-wait';
    }

    if (subscriptionLoading) {
        return 'border-2 border-green-500 text-green-700 bg-transparent opacity-80';
    }

    if (isCurrent) {
        return 'border-2 border-green-600 text-green-700 bg-white cursor-default';
    }

    return 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg active:scale-95';
}