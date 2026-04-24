import { describe, expect, it } from 'vitest';
import { t } from '@shared/locales';

describe('t', () => {
  it('returns the requested locale when defined', () => {
    expect(t('viewDeal', 'en')).toBe('View deal');
    expect(t('viewDeal', 'de')).toBe('Angebot ansehen');
    expect(t('viewDeal', 'es')).toBe('Ver oferta');
    expect(t('viewDeal', 'fr')).toBe("Voir l'offre");
  });

  it('substitutes single-placeholder templates', () => {
    expect(t('kmToCenter', 'en', { n: '3.4' })).toBe('3.4 km to center');
    expect(t('kmToCenter', 'de', { n: '3.4' })).toBe('3.4 km zum Zentrum');
  });

  it('substitutes multi-variable templates independently', () => {
    expect(t('promotedBy', 'fr', { name: 'Vrbo' })).toBe('Proposé par Vrbo');
  });

  it('leaves unknown placeholders as curly-braced tokens', () => {
    // forNights expects {n}; omitting it should preserve the token verbatim.
    expect(t('forNights', 'en')).toBe('for {n} nights, incl. fees');
  });

  it('handles numeric plural inputs', () => {
    expect(t('forNights', 'de', { n: 7 })).toBe('für 7 Nächte, inkl. Gebühren');
  });
});
