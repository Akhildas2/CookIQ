export interface SiteStat {
    value: number;
    display: string;
    label: string;
    prefix?: string;
    suffix?: string;
    isDecimal?: boolean;
}

export interface Feature {
    icon: string;
    tag: string;
    title: string;
    desc: string;
    num: string;
    theme: 'forest' | 'spice' | 'gold' | 'sage';
}

export interface Step {
    step: string;
    title: string;
    desc: string;
    detail: string;
}

export interface Testimonial {
    text: string;
    name: string;
    location: string;
    initials: string;
    delay: string;
}

export interface CTAContent {
    badge: string;
    title: string;
    subtitle: string;
    primaryBtn: string;
    secondaryBtn: string;
}