
export interface DashboardQuickAction {
    readonly title: string;
    readonly description: string;
    readonly icon: string;
    readonly route: string;
    readonly accent: 'spice' | 'forest' | 'gold' | 'sage';
}