import type { Currency } from './types';
import type { Locale } from './locales';
import { LOCALE_TO_INTL } from './locales';

const SYMBOL: Record<Currency, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
};

/**
 * Locale-aware price formatting.
 *   en-GB → £1,234, de-DE → €1.234, es-ES → 1.234 €, fr-FR → 1 234 €
 * Falls back to a plain join if toLocaleString misbehaves in the
 * QuickJS runtime.
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  locale: Locale = 'en',
): string {
  const intl = LOCALE_TO_INTL[locale] ?? 'en-GB';
  const symbol = SYMBOL[currency] ?? '€';
  let value: string;
  try {
    value = amount.toLocaleString(intl, { maximumFractionDigits: 0 });
  } catch {
    value = String(amount);
  }
  // Most locales prefix the symbol. FR and ES traditionally suffix the
  // Euro symbol with a thin space; keep it simple for PoC.
  if (locale === 'fr' || locale === 'es') {
    return currency === 'EUR' ? `${value} ${symbol}` : `${symbol}${value}`;
  }
  return `${symbol}${value}`;
}
