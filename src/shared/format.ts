import type { Currency } from './types';

const SYMBOL: Record<Currency, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
};

/**
 * Locale-aware price formatting. EUR uses `de-DE` grouping (€1.234),
 * GBP uses `en-GB` (£1,234), USD uses `en-US` ($1,234).
 * Falls back to a plain join if `toLocaleString` misbehaves in the
 * QuickJS runtime.
 */
export function formatPrice(amount: number, currency: Currency): string {
  const symbol = SYMBOL[currency] ?? '€';
  try {
    const locale = currency === 'EUR' ? 'de-DE' : currency === 'GBP' ? 'en-GB' : 'en-US';
    return `${symbol}${amount.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  } catch {
    return `${symbol}${amount}`;
  }
}
