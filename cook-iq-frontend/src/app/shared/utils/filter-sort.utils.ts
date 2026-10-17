/** True when the query is empty or any field contains it (case-insensitive). */
export function matchesQuery(
    query: string,
    ...fields: Array<string | null | undefined>
): boolean {
    const q = query.trim().toLowerCase();
    return !q || fields.some((field) => field?.toLowerCase().includes(q));
}

export function compareText(a: string, b: string): number {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

/** Empty values always sort last. */
export function compareOptionalText(a?: string | null, b?: string | null): number {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return compareText(a, b);
}