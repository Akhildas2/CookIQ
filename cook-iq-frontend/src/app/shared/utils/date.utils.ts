export function formatPeriodEnd(timestamp?: number): string | null {
    if (!timestamp) return null;

    return new Date(timestamp).toLocaleDateString(
        'en-IN',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    );

}