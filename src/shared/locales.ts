export type Locale = 'en' | 'de' | 'es' | 'fr';

export const LOCALES: Array<{ id: Locale; label: string; flag: string }> = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
];

export const LOCALE_TO_INTL: Record<Locale, string> = {
  en: 'en-GB',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
};

/**
 * Central strings table for the canvas card + section renderers.
 * Keep keys short and consistent; use {n} / {name} placeholders for
 * values injected at render time.
 */
export type StringKey =
  | 'viewDeal'
  | 'forNight'
  | 'forNights'
  | 'promotedBy'
  | 'reviews'
  | 'newListing'
  | 'lastMinuteDeal'
  | 'freeCancellation'
  | 'freeCancellationShort'
  | 'freeCancellationFlex'
  | 'nonRefundable'
  | 'kmToCenter'
  | 'guests'
  | 'bedrooms'
  | 'bathrooms'
  | 'beds'
  | 'amenities'
  | 'amenitiesShowAll'
  | 'description'
  | 'about'
  | 'gallery'
  | 'galleryShowAll'
  | 'priceBreakdown'
  | 'perNight'
  | 'nights'
  | 'total'
  | 'cleanlinessFees'
  | 'serviceFee'
  | 'taxes'
  | 'reviewsHeader'
  | 'ratingCleanliness'
  | 'ratingLocation'
  | 'ratingValue'
  | 'ratingCommunication'
  | 'ratingOverall'
  | 'hotel'
  | 'apartment'
  | 'villa'
  | 'cabin'
  | 'chalet'
  | 'cottage'
  | 'studio'
  | 'penthouse'
  | 'castle'
  | 'bungalow'
  | 'house';

export const STRINGS: Record<Locale, Record<StringKey, string>> = {
  en: {
    viewDeal: 'View deal',
    forNight: 'for {n} night, incl. fees',
    forNights: 'for {n} nights, incl. fees',
    promotedBy: 'Promoted by {name}',
    reviews: 'reviews',
    newListing: 'New listing',
    lastMinuteDeal: 'Last-minute deal',
    freeCancellation: 'Free cancellation',
    freeCancellationShort: 'Free cancellation within 24h',
    freeCancellationFlex: 'Flexible cancellation',
    nonRefundable: 'Non-refundable',
    kmToCenter: '{n} km to center',
    guests: 'guests',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    beds: 'beds',
    amenities: 'Amenities',
    amenitiesShowAll: 'Show all {n} amenities',
    description: 'About this property',
    about: 'About',
    gallery: 'Photos',
    galleryShowAll: 'Show all {n} photos',
    priceBreakdown: 'Price details',
    perNight: 'per night',
    nights: 'nights',
    total: 'Total',
    cleanlinessFees: 'Cleaning fee',
    serviceFee: 'Service fee',
    taxes: 'Taxes',
    reviewsHeader: 'Guest reviews',
    ratingCleanliness: 'Cleanliness',
    ratingLocation: 'Location',
    ratingValue: 'Value',
    ratingCommunication: 'Communication',
    ratingOverall: 'Overall',
    hotel: 'Hotel',
    apartment: 'Apartment',
    villa: 'Villa',
    cabin: 'Cabin',
    chalet: 'Chalet',
    cottage: 'Cottage',
    studio: 'Studio',
    penthouse: 'Penthouse',
    castle: 'Castle',
    bungalow: 'Bungalow',
    house: 'House',
  },
  de: {
    viewDeal: 'Angebot ansehen',
    forNight: 'für {n} Nacht, inkl. Gebühren',
    forNights: 'für {n} Nächte, inkl. Gebühren',
    promotedBy: 'Angeboten von {name}',
    reviews: 'Bewertungen',
    newListing: 'Neu inseriert',
    lastMinuteDeal: 'Last-Minute-Angebot',
    freeCancellation: 'Kostenlose Stornierung',
    freeCancellationShort: 'Kostenlose Stornierung innerhalb 24 Std.',
    freeCancellationFlex: 'Flexible Stornierung',
    nonRefundable: 'Nicht erstattungsfähig',
    kmToCenter: '{n} km zum Zentrum',
    guests: 'Gäste',
    bedrooms: 'Schlafzimmer',
    bathrooms: 'Badezimmer',
    beds: 'Betten',
    amenities: 'Ausstattung',
    amenitiesShowAll: 'Alle {n} Ausstattungsmerkmale anzeigen',
    description: 'Über diese Unterkunft',
    about: 'Beschreibung',
    gallery: 'Fotos',
    galleryShowAll: 'Alle {n} Fotos anzeigen',
    priceBreakdown: 'Preisdetails',
    perNight: 'pro Nacht',
    nights: 'Nächte',
    total: 'Gesamtpreis',
    cleanlinessFees: 'Reinigungsgebühr',
    serviceFee: 'Servicegebühr',
    taxes: 'Steuern',
    reviewsHeader: 'Gästebewertungen',
    ratingCleanliness: 'Sauberkeit',
    ratingLocation: 'Lage',
    ratingValue: 'Preis-Leistung',
    ratingCommunication: 'Kommunikation',
    ratingOverall: 'Gesamtbewertung',
    hotel: 'Hotel',
    apartment: 'Wohnung',
    villa: 'Villa',
    cabin: 'Hütte',
    chalet: 'Chalet',
    cottage: 'Ferienhaus',
    studio: 'Studio',
    penthouse: 'Penthouse',
    castle: 'Schloss',
    bungalow: 'Bungalow',
    house: 'Haus',
  },
  es: {
    viewDeal: 'Ver oferta',
    forNight: 'por {n} noche, tasas incluidas',
    forNights: 'por {n} noches, tasas incluidas',
    promotedBy: 'Ofrecido por {name}',
    reviews: 'opiniones',
    newListing: 'Nuevo anuncio',
    lastMinuteDeal: 'Oferta de última hora',
    freeCancellation: 'Cancelación gratuita',
    freeCancellationShort: 'Cancelación gratuita en 24 h',
    freeCancellationFlex: 'Cancelación flexible',
    nonRefundable: 'No reembolsable',
    kmToCenter: 'A {n} km del centro',
    guests: 'huéspedes',
    bedrooms: 'dormitorios',
    bathrooms: 'baños',
    beds: 'camas',
    amenities: 'Servicios',
    amenitiesShowAll: 'Ver los {n} servicios',
    description: 'Acerca de este alojamiento',
    about: 'Descripción',
    gallery: 'Fotos',
    galleryShowAll: 'Ver las {n} fotos',
    priceBreakdown: 'Detalles del precio',
    perNight: 'por noche',
    nights: 'noches',
    total: 'Total',
    cleanlinessFees: 'Gastos de limpieza',
    serviceFee: 'Gastos de servicio',
    taxes: 'Impuestos',
    reviewsHeader: 'Opiniones de huéspedes',
    ratingCleanliness: 'Limpieza',
    ratingLocation: 'Ubicación',
    ratingValue: 'Calidad-precio',
    ratingCommunication: 'Comunicación',
    ratingOverall: 'Valoración general',
    hotel: 'Hotel',
    apartment: 'Apartamento',
    villa: 'Villa',
    cabin: 'Cabaña',
    chalet: 'Chalet',
    cottage: 'Cottage',
    studio: 'Estudio',
    penthouse: 'Ático',
    castle: 'Castillo',
    bungalow: 'Bungaló',
    house: 'Casa',
  },
  fr: {
    viewDeal: "Voir l'offre",
    forNight: 'pour {n} nuit, frais inclus',
    forNights: 'pour {n} nuits, frais inclus',
    promotedBy: 'Proposé par {name}',
    reviews: 'avis',
    newListing: 'Nouvelle annonce',
    lastMinuteDeal: 'Offre de dernière minute',
    freeCancellation: 'Annulation gratuite',
    freeCancellationShort: 'Annulation gratuite sous 24 h',
    freeCancellationFlex: 'Annulation flexible',
    nonRefundable: 'Non remboursable',
    kmToCenter: 'À {n} km du centre',
    guests: 'voyageurs',
    bedrooms: 'chambres',
    bathrooms: 'salles de bain',
    beds: 'lits',
    amenities: 'Équipements',
    amenitiesShowAll: 'Afficher les {n} équipements',
    description: 'À propos de ce logement',
    about: 'Description',
    gallery: 'Photos',
    galleryShowAll: 'Afficher les {n} photos',
    priceBreakdown: 'Détails du prix',
    perNight: 'par nuit',
    nights: 'nuits',
    total: 'Total',
    cleanlinessFees: 'Frais de ménage',
    serviceFee: 'Frais de service',
    taxes: 'Taxes',
    reviewsHeader: 'Avis des voyageurs',
    ratingCleanliness: 'Propreté',
    ratingLocation: 'Emplacement',
    ratingValue: 'Rapport qualité-prix',
    ratingCommunication: 'Communication',
    ratingOverall: 'Note globale',
    hotel: 'Hôtel',
    apartment: 'Appartement',
    villa: 'Villa',
    cabin: 'Chalet rustique',
    chalet: 'Chalet',
    cottage: 'Cottage',
    studio: 'Studio',
    penthouse: 'Penthouse',
    castle: 'Château',
    bungalow: 'Bungalow',
    house: 'Maison',
  },
};

/**
 * Resolve a locale string with placeholder substitution.
 * `t('forNights', 'en', { n: 7 })` → `"for 7 nights, incl. fees"`.
 */
export function t(
  key: StringKey,
  locale: Locale,
  vars: Record<string, string | number> = {},
): string {
  const template = STRINGS[locale]?.[key] ?? STRINGS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => {
    const v = vars[k];
    return v === undefined ? `{${k}}` : String(v);
  });
}
