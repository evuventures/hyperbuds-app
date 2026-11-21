/**
 * Formats social counters into compact human-readable form:
 * 0-999 -> "999", 1,000 -> "1K", 1,500 -> "1.5K", 1,000,000 -> "1M", 1,000,000,000 -> "1B".
 */
export function formatCompactCount(value?: number | string | null): string {
  const num = typeof value === 'string' ? Number(value) : Number(value ?? 0);
  if (!Number.isFinite(num) || num <= 0) return '0';
  if (num < 1000) return String(Math.floor(num));

  const formatUnit = (divisor: number, suffix: string) => {
    const scaled = num / divisor;
    const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
    return `${String(rounded).replace(/\.0$/, '')}${suffix}`;
  };

  if (num < 1_000_000) return formatUnit(1_000, 'K');
  if (num < 1_000_000_000) return formatUnit(1_000_000, 'M');
  return formatUnit(1_000_000_000, 'B');
}
