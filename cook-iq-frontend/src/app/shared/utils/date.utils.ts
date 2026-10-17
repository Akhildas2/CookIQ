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

/** Local date as YYYY-MM-DD (matches <input type="date">). */
export function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}