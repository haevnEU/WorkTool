// typescript
export function formatTimestamp(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    if (!Number.isFinite(value)) return 'invalid date';

    const date = new Date(value);
    if (isNaN(date.getTime())) return 'invalid date';

    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}