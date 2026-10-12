
export interface NavItem {
    label: string;
    route: string;
    icon: string;
    exact?: boolean;
}

export const PUBLIC_NAV_ITEMS: NavItem[] = [
    {
        label: 'Home',
        route: '/',
        icon: 'home',
        exact: true,
    },
    {
        label: 'Recipes',
        route: '/app/recipes',
        icon: 'restaurant',
    },
    {
        label: 'AI Cook',
        route: '/ai',
        icon: 'auto_awesome',
    },
];

export const ACCOUNT_NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        route: '/dashboard',
        icon: 'dashboard',
        exact: true,
    },
    {
        label: 'My Pantry',
        route: '/app/pantry',
        icon: 'kitchen',
    },
    {
        label: 'My Recipes',
        route: '/app/my-recipes',
        icon: 'bookmark',
    },
    {
        label: 'Profile',
        route: '/profile',
        icon: 'person',
    },
    {
        label: 'Settings',
        route: '/settings',
        icon: 'settings',
    },
];