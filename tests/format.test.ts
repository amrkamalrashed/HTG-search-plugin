import { describe, expect, it } from 'vitest';
import { formatPrice } from '@shared/format';

describe('formatPrice', () => {
  it('formats EUR with prefix for en/de', () => {
    expect(formatPrice(1234, 'EUR', 'en')).toBe('€1,234');
    expect(formatPrice(1234, 'EUR', 'de')).toBe('€1.234');
  });

  it('formats EUR with suffix for fr and es', () => {
    // fr-FR uses a narrow no-break space as the thousands separator;
    // es-ES suppresses the separator for 4-digit numbers by default and
    // only starts grouping at 5 digits, so we test with 12 345.
    expect(formatPrice(12345, 'EUR', 'fr')).toBe('12 345 €');
    expect(formatPrice(12345, 'EUR', 'es')).toBe('12.345 €');
  });

  it('keeps GBP/USD as prefix across all locales', () => {
    expect(formatPrice(850, 'GBP', 'en')).toBe('£850');
    expect(formatPrice(850, 'GBP', 'fr')).toBe('£850');
    expect(formatPrice(1000, 'USD', 'de')).toBe('$1.000');
  });

  it('drops fractional digits', () => {
    expect(formatPrice(1234.56, 'EUR', 'en')).toBe('€1,235');
  });
});
