import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

// Zoom in on enter (once)
export const zoomInAnimation = trigger('zoomIn', [
    transition(':enter', [
        style({ transform: 'scale(0.4)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
    ])
]);

// Fade in on enter
export const fadeInAnimation = trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
    ])
]);


// Slide in from bottom
export const slideInUpAnimation = trigger('slideInUp', [
    transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
    ])
]);


// Update your fadeInLeftAnimation for better effect
export const fadeInLeftAnimation = trigger('fadeInLeft', [
    transition(':enter', [
        style({ transform: 'translateX(-40px)', opacity: 0 }),
        animate('500ms ease-out',
            style({ transform: 'translateX(0)', opacity: 1 }))
    ])
]);

// Add this stagger animation for grid items
export const staggerAnimation = trigger('stagger', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
                animate('300ms ease-out',
                    style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ], { optional: true })
    ])
]);