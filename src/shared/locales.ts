export type Locale = 'en' | 'de' | 'es' | 'fr';

// Plain text codes instead of regional-indicator flag emojis. Some
// platforms (Windows, certain emoji fonts) render `🇬🇧 🇩🇪 🇪🇸 🇫🇷`
// as doubled letter blocks (the "doubled-flag" bug); the text codes
// look correct everywhere and stay short enough for the locale pill.
export const LOCALES: Array<{ id: Locale; label: string; flag: string }> = [
  { id: 'en', label: 'English', flag: 'EN' },
  { id: 'de', label: 'Deutsch', flag: 'DE' },
  { id: 'es', label: 'Español', flag: 'ES' },
  { id: 'fr', label: 'Français', flag: 'FR' },
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
  | 'bedroom'
  | 'bedrooms'
  | 'bathrooms'
  | 'beds'
  | 'compare'
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
  | 'ratingOutstanding'
  | 'ratingExcellent'
  | 'ratingGood'
  | 'quickFacts'
  | 'reasonsToBook'
  | 'roomInformation'
  | 'seeAllRooms'
  | 'seeMore'
  | 'houseRules'
  | 'location'
  | 'address'
  | 'cancellationPolicy'
  | 'perNightHero'
  | 'total'
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
  | 'house'
  // --- Plugin UI chrome ---
  | 'uiMarket'
  | 'uiSurface'
  | 'uiRefresh'
  | 'uiModeSingle'
  | 'uiModeList'
  | 'uiModeGrid'
  | 'uiSearchPlaceholder'
  | 'uiFilterAll'
  | 'uiFilterPriceMax'
  | 'uiFilterRatingPlus'
  | 'uiFilterGuestsPlus'
  | 'uiSortRecommended'
  | 'uiSortPriceAsc'
  | 'uiSortPriceDesc'
  | 'uiSortTopRated'
  | 'uiSortNewListings'
  | 'uiNProperties'
  | 'uiNOfTotal'
  | 'uiSelectAProperty'
  | 'uiInsert'
  | 'uiInsertN'
  | 'uiInsertAsList'
  | 'uiInsertNAsList'
  | 'uiInsertAsGrid'
  | 'uiInsertNAsGrid'
  | 'uiHintClickSingle'
  | 'uiHintPickList'
  | 'uiHintPickGrid'
  | 'uiNSelected'
  | 'uiEnterToInsert'
  | 'uiSelectAll'
  | 'uiSelectAllN'
  | 'uiClear'
  | 'uiPickAsList'
  | 'uiPickAsGrid'
  | 'uiNoMatchTitle'
  | 'uiNoMatchHint'
  | 'uiClearAllFilters'
  | 'uiBreadcrumbProperties'
  | 'uiSectionsToInsert'
  | 'uiPickSectionsToInsert'
  | 'uiSelectSections'
  | 'uiInsertSection'
  | 'uiInsertNSections'
  | 'uiNSection'
  | 'uiNSections'
  | 'uiTileGallery'
  | 'uiTileGalleryDesc'
  | 'uiTileTitleHeader'
  | 'uiTileTitleHeaderDesc'
  | 'uiTileQuickFacts'
  | 'uiTileQuickFactsDesc'
  | 'uiTileReasonsToBook'
  | 'uiTileReasonsToBookDesc'
  | 'uiTileReviews'
  | 'uiTileReviewsDesc'
  | 'uiTileAmenities'
  | 'uiTileAmenitiesDesc'
  | 'uiTileRoomInformation'
  | 'uiTileRoomInformationDesc'
  | 'uiTileDescription'
  | 'uiTileDescriptionDesc'
  | 'uiTileHouseRules'
  | 'uiTileHouseRulesDesc'
  | 'uiTileLocation'
  | 'uiTileLocationDesc'
  | 'uiTilePriceBreakdown'
  | 'uiTilePriceBreakdownDesc'
  | 'uiTileCancellationPolicy'
  | 'uiTileCancellationPolicyDesc'
  | 'uiTileNotAvailable'
  | 'uiLabelGuests'
  | 'uiLabelBedrooms'
  | 'uiLabelBaths'
  | 'uiNewShort'
  | 'uiNReviewsShort'
  | 'uiByProvider'
  | 'uiNightsTotalSuffix'
  | 'uiPerNightSlash'
  | 'uiOpenDetails'
  | 'uiInsertCard'
  | 'uiPreviewTooltip'
  // v0.6 / v0.7 chrome
  | 'uiRandomize'
  | 'uiRandomizeTooltip'
  | 'uiThemeAuto'
  | 'uiThemeLight'
  | 'uiThemeDark'
  | 'uiThemeTooltip'
  | 'uiToastUndo'
  | 'uiPaletteHint'
  | 'uiPalettePlaceholder'
  | 'uiPaletteRandom'
  | 'uiPaletteRefresh'
  | 'uiPaletteFindAll'
  | 'uiPaletteSetMode'
  | 'uiPaletteSetPlatform'
  | 'uiPaletteSetLocale'
  | 'uiPaletteSetTheme'
  | 'uiPaletteSavePreset'
  | 'uiPaletteApplyPreset'
  | 'uiPaletteDrop'
  | 'uiDropBanner'
  | 'uiDropBannerWithFields'
  | 'uiDropBannerReplace'
  | 'uiPresetSaved'
  | 'uiPresetNamePrompt'
  | 'uiFavouriteAdd'
  | 'uiFavouriteRemove'
  | 'uiHoverPeekTitle'
  | 'uiFindAll'
  | 'uiFindAllTooltip'
  | 'uiDrop'
  | 'uiDropN'
  | 'uiDropAsList'
  | 'uiDropNAsList'
  | 'uiDropAsGrid'
  | 'uiDropNAsGrid'
  | 'uiPresetsTooltip'
  | 'uiPresetsEmpty'
  | 'uiPresetsSaveCurrent'
  | 'uiPresetDelete'
  | 'uiFilterFavourites'
  | 'uiFilterFavouritesEmpty'
  | 'uiDropBannerSubNone'
  | 'uiDropBannerSubSingle'
  | 'uiDropBannerSubList'
  | 'uiDropBannerSubGrid'
  | 'uiDropBannerSubPopulate'
  | 'uiLoadErrorTitle'
  | 'uiLoadErrorRetry';

export const STRINGS: Record<Locale, Record<StringKey, string>> = {
  en: {
    ratingOutstanding: 'Outstanding',
    ratingExcellent: 'Excellent',
    ratingGood: 'Good',
    quickFacts: 'Quick facts',
    reasonsToBook: 'Reasons to book',
    roomInformation: 'Room information',
    seeAllRooms: 'See all rooms',
    seeMore: 'See more',
    houseRules: 'House rules',
    location: 'Location',
    address: 'Address',
    cancellationPolicy: 'Cancellation policy',
    perNightHero: '/ night',
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
    bedroom: 'bedroom',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    beds: 'beds',
    compare: 'Compare',
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
    uiMarket: 'Market',
    uiSurface: 'Surface',
    uiRefresh: 'Refresh selected cards (re-render against current data)',
    uiModeSingle: 'Single',
    uiModeList: 'List',
    uiModeGrid: 'Grid',
    uiSearchPlaceholder: 'Where to? City or country',
    uiFilterAll: 'All',
    uiFilterPriceMax: 'Under {amount}',
    uiFilterRatingPlus: '★ 4.5+',
    uiFilterGuestsPlus: '{n}+ guests',
    uiSortRecommended: 'Recommended',
    uiSortPriceAsc: 'Price: low to high',
    uiSortPriceDesc: 'Price: high to low',
    uiSortTopRated: 'Top rated',
    uiSortNewListings: 'New listings',
    uiNProperties: '{n} properties',
    uiNOfTotal: '{n} of {total}',
    uiSelectAProperty: 'Select a property',
    uiInsert: 'Insert',
    uiInsertN: 'Insert {n}',
    uiInsertAsList: 'Insert as list',
    uiInsertNAsList: 'Insert {n} as list',
    uiInsertAsGrid: 'Insert as grid',
    uiInsertNAsGrid: 'Insert {n} as grid',
    uiHintClickSingle: 'Click a property to select',
    uiHintPickList: 'Pick multiple to stack as a list',
    uiHintPickGrid: 'Pick multiple to arrange as a grid',
    uiNSelected: '{n} selected',
    uiEnterToInsert: '{n} selected · ⏎ to insert',
    uiSelectAll: 'Select all',
    uiSelectAllN: 'Select all {n}',
    uiClear: 'Clear',
    uiPickAsList: 'Pick properties to insert as list',
    uiPickAsGrid: 'Pick properties to insert as grid',
    uiNoMatchTitle: 'No properties match',
    uiNoMatchHint: 'Try widening the filters or searching for a different city.',
    uiClearAllFilters: 'Clear all filters',
    uiBreadcrumbProperties: 'Properties',
    uiSectionsToInsert: 'Sections to insert',
    uiPickSectionsToInsert: 'Pick sections to drop',
    uiSelectSections: 'Select sections',
    uiInsertSection: 'Drop section',
    uiInsertNSections: 'Drop {n} sections',
    uiNSection: '{n} section · ⏎ to drop',
    uiNSections: '{n} sections · ⏎ to drop',
    uiTileGallery: 'Gallery',
    uiTileGalleryDesc: 'Hero + thumbnail grid',
    uiTileTitleHeader: 'Title header',
    uiTileTitleHeaderDesc: 'Badges + title + rating + hero price',
    uiTileQuickFacts: 'Quick facts',
    uiTileQuickFactsDesc: '2-column icon grid of key stats',
    uiTileReasonsToBook: 'Reasons to book',
    uiTileReasonsToBookDesc: '3-item icon + title + description list',
    uiTileReviews: 'Rating breakdown',
    uiTileReviewsDesc: 'Overall + sub-ratings + 3 review cards',
    uiTileAmenities: 'Amenities',
    uiTileAmenitiesDesc: 'What this stay offers — grouped icons',
    uiTileRoomInformation: 'Room information',
    uiTileRoomInformationDesc: 'Bedroom/bathroom cards + beds',
    uiTileDescription: 'Description',
    uiTileDescriptionDesc: 'About paragraph + highlights + See more',
    uiTileHouseRules: 'House rules',
    uiTileHouseRulesDesc: 'Icon + rule bullet list',
    uiTileLocation: 'Location',
    uiTileLocationDesc: 'Map tile + address block',
    uiTilePriceBreakdown: 'Cost breakdown',
    uiTilePriceBreakdownDesc: 'Line items, total, View deal CTA',
    uiTileCancellationPolicy: 'Cancellation policy',
    uiTileCancellationPolicyDesc: 'Refund tiers with colored rails',
    uiTileNotAvailable: 'Not available for this offer',
    uiLabelGuests: 'Guests',
    uiLabelBedrooms: 'Bedrooms',
    uiLabelBaths: 'Baths',
    uiNewShort: 'New',
    uiNReviewsShort: '{n} reviews',
    uiByProvider: 'by {name}',
    uiNightsTotalSuffix: '{n} nights: {total} total',
    uiPerNightSlash: '/ night',
    uiOpenDetails: 'Open details →',
    uiInsertCard: 'Insert card',
    uiPreviewTooltip: 'Preview details',
    uiRandomize: 'Randomize',
    uiRandomizeTooltip: 'Pick a random property (R)',
    uiThemeAuto: 'Auto',
    uiThemeLight: 'Light',
    uiThemeDark: 'Dark',
    uiThemeTooltip: 'Theme',
    uiToastUndo: 'Undo',
    uiPaletteHint: '⌘K',
    uiPalettePlaceholder: 'Type a command…',
    uiPaletteRandom: 'Random property',
    uiPaletteRefresh: 'Refresh selected cards',
    uiPaletteFindAll: 'Find all HomeDrop cards on this page',
    uiPaletteSetMode: 'Mode: {value}',
    uiPaletteSetPlatform: 'Surface: {value}',
    uiPaletteSetLocale: 'Market: {value}',
    uiPaletteSetTheme: 'Theme: {value}',
    uiPaletteSavePreset: 'Save current settings as preset…',
    uiPaletteApplyPreset: 'Apply preset · {value}',
    uiPaletteDrop: 'Drop a property card on the canvas',
    uiDropBanner: 'Drop into "{name}"',
    uiDropBannerWithFields: 'Drop into "{name}" — {n} #fields detected',
    uiDropBannerReplace: 'Replace contents on drop',
    uiPresetSaved: 'Preset "{name}" saved.',
    uiPresetNamePrompt: 'Name this preset',
    uiFavouriteAdd: 'Add to favourites',
    uiFavouriteRemove: 'Remove from favourites',
    uiHoverPeekTitle: 'Quick look',
    uiFindAll: 'Find all',
    uiFindAllTooltip: 'Find all HomeDrop cards on this page',
    uiDrop: 'Drop',
    uiDropN: 'Drop {n}',
    uiDropAsList: 'Drop as list',
    uiDropNAsList: 'Drop {n} as list',
    uiDropAsGrid: 'Drop as grid',
    uiDropNAsGrid: 'Drop {n} as grid',
    uiPresetsTooltip: 'Presets',
    uiPresetsEmpty: 'No presets yet.',
    uiPresetsSaveCurrent: 'Save current settings…',
    uiPresetDelete: 'Delete preset',
    uiFilterFavourites: 'Favourites ({n})',
    uiFilterFavouritesEmpty: 'Star a tile to add it to favourites',
    uiDropBannerSubNone: 'Pick a property below',
    uiDropBannerSubSingle: 'The selected property will land here',
    uiDropBannerSubList: '{n} properties will land here as a list',
    uiDropBannerSubGrid: '{n} properties will land here as a grid',
    uiDropBannerSubPopulate: 'Populate matching #fields with the selected property',
    uiLoadErrorTitle: "Couldn't load properties",
    uiLoadErrorRetry: 'Retry',
  },
  de: {
    ratingOutstanding: 'Hervorragend',
    ratingExcellent: 'Sehr gut',
    ratingGood: 'Gut',
    quickFacts: 'Auf einen Blick',
    reasonsToBook: 'Gründe zu buchen',
    roomInformation: 'Zimmerinformation',
    seeAllRooms: 'Alle Zimmer anzeigen',
    seeMore: 'Mehr anzeigen',
    houseRules: 'Hausregeln',
    location: 'Lage',
    address: 'Adresse',
    cancellationPolicy: 'Stornierungsbedingungen',
    perNightHero: '/ Nacht',
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
    bedroom: 'Schlafzimmer',
    bedrooms: 'Schlafzimmer',
    bathrooms: 'Badezimmer',
    beds: 'Betten',
    compare: 'Vergleichen',
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
    uiMarket: 'Markt',
    uiSurface: 'Oberfläche',
    uiRefresh: 'Ausgewählte Karten aktualisieren (mit aktuellen Daten neu rendern)',
    uiModeSingle: 'Einzeln',
    uiModeList: 'Liste',
    uiModeGrid: 'Raster',
    uiSearchPlaceholder: 'Wohin? Stadt oder Land',
    uiFilterAll: 'Alle',
    uiFilterPriceMax: 'Unter {amount}',
    uiFilterRatingPlus: '★ 4,5+',
    uiFilterGuestsPlus: '{n}+ Gäste',
    uiSortRecommended: 'Empfohlen',
    uiSortPriceAsc: 'Preis: niedrig zu hoch',
    uiSortPriceDesc: 'Preis: hoch zu niedrig',
    uiSortTopRated: 'Bestbewertet',
    uiSortNewListings: 'Neue Inserate',
    uiNProperties: '{n} Unterkünfte',
    uiNOfTotal: '{n} von {total}',
    uiSelectAProperty: 'Unterkunft auswählen',
    uiInsert: 'Einfügen',
    uiInsertN: '{n} einfügen',
    uiInsertAsList: 'Als Liste einfügen',
    uiInsertNAsList: '{n} als Liste einfügen',
    uiInsertAsGrid: 'Als Raster einfügen',
    uiInsertNAsGrid: '{n} als Raster einfügen',
    uiHintClickSingle: 'Unterkunft anklicken, um auszuwählen',
    uiHintPickList: 'Mehrere wählen, um als Liste zu stapeln',
    uiHintPickGrid: 'Mehrere wählen, um als Raster anzuordnen',
    uiNSelected: '{n} ausgewählt',
    uiEnterToInsert: '{n} ausgewählt · ⏎ zum Einfügen',
    uiSelectAll: 'Alle auswählen',
    uiSelectAllN: 'Alle {n} auswählen',
    uiClear: 'Leeren',
    uiPickAsList: 'Unterkünfte wählen, um als Liste einzufügen',
    uiPickAsGrid: 'Unterkünfte wählen, um als Raster einzufügen',
    uiNoMatchTitle: 'Keine passenden Unterkünfte',
    uiNoMatchHint: 'Filter erweitern oder eine andere Stadt suchen.',
    uiClearAllFilters: 'Alle Filter löschen',
    uiBreadcrumbProperties: 'Unterkünfte',
    uiSectionsToInsert: 'Einzufügende Abschnitte',
    uiPickSectionsToInsert: 'Abschnitte zum Ablegen wählen',
    uiSelectSections: 'Abschnitte auswählen',
    uiInsertSection: 'Abschnitt ablegen',
    uiInsertNSections: '{n} Abschnitte ablegen',
    uiNSection: '{n} Abschnitt · ⏎ zum Ablegen',
    uiNSections: '{n} Abschnitte · ⏎ zum Ablegen',
    uiTileGallery: 'Galerie',
    uiTileGalleryDesc: 'Hauptbild + Miniaturraster',
    uiTileTitleHeader: 'Titel-Kopf',
    uiTileTitleHeaderDesc: 'Badges + Titel + Bewertung + Preis',
    uiTileQuickFacts: 'Auf einen Blick',
    uiTileQuickFactsDesc: '2-spaltiges Symbolraster mit Kennzahlen',
    uiTileReasonsToBook: 'Gründe zu buchen',
    uiTileReasonsToBookDesc: '3-teilige Icon-Titel-Beschreibungsliste',
    uiTileReviews: 'Bewertungsübersicht',
    uiTileReviewsDesc: 'Gesamt + Detailbewertungen + 3 Rezensionen',
    uiTileAmenities: 'Ausstattung',
    uiTileAmenitiesDesc: 'Was die Unterkunft bietet — gruppierte Icons',
    uiTileRoomInformation: 'Zimmerinformation',
    uiTileRoomInformationDesc: 'Schlaf-/Badezimmerkarten + Betten',
    uiTileDescription: 'Beschreibung',
    uiTileDescriptionDesc: 'Absatz + Highlights + Mehr anzeigen',
    uiTileHouseRules: 'Hausregeln',
    uiTileHouseRulesDesc: 'Icon + Regelliste',
    uiTileLocation: 'Lage',
    uiTileLocationDesc: 'Karte + Adressblock',
    uiTilePriceBreakdown: 'Preisaufschlüsselung',
    uiTilePriceBreakdownDesc: 'Einzelposten, Gesamtpreis, CTA',
    uiTileCancellationPolicy: 'Stornierungsbedingungen',
    uiTileCancellationPolicyDesc: 'Erstattungsstufen mit farbigen Leisten',
    uiTileNotAvailable: 'Für dieses Angebot nicht verfügbar',
    uiLabelGuests: 'Gäste',
    uiLabelBedrooms: 'Schlafzimmer',
    uiLabelBaths: 'Bäder',
    uiNewShort: 'Neu',
    uiNReviewsShort: '{n} Bewertungen',
    uiByProvider: 'von {name}',
    uiNightsTotalSuffix: '{n} Nächte: {total} gesamt',
    uiPerNightSlash: '/ Nacht',
    uiOpenDetails: 'Details öffnen →',
    uiInsertCard: 'Karte einfügen',
    uiPreviewTooltip: 'Details ansehen',
    uiRandomize: 'Zufall',
    uiRandomizeTooltip: 'Zufällige Unterkunft wählen (R)',
    uiThemeAuto: 'Auto',
    uiThemeLight: 'Hell',
    uiThemeDark: 'Dunkel',
    uiThemeTooltip: 'Design',
    uiToastUndo: 'Rückgängig',
    uiPaletteHint: '⌘K',
    uiPalettePlaceholder: 'Befehl eingeben…',
    uiPaletteRandom: 'Zufällige Unterkunft',
    uiPaletteRefresh: 'Ausgewählte Karten aktualisieren',
    uiPaletteFindAll: 'Alle HomeDrop-Karten auf dieser Seite finden',
    uiPaletteSetMode: 'Modus: {value}',
    uiPaletteSetPlatform: 'Oberfläche: {value}',
    uiPaletteSetLocale: 'Markt: {value}',
    uiPaletteSetTheme: 'Design: {value}',
    uiPaletteSavePreset: 'Aktuelle Einstellungen als Preset speichern…',
    uiPaletteApplyPreset: 'Preset anwenden · {value}',
    uiPaletteDrop: 'Karte auf dem Canvas ablegen',
    uiDropBanner: 'In "{name}" ablegen',
    uiDropBannerWithFields: 'In "{name}" ablegen — {n} #-Felder erkannt',
    uiDropBannerReplace: 'Inhalte beim Ablegen ersetzen',
    uiPresetSaved: 'Preset "{name}" gespeichert.',
    uiPresetNamePrompt: 'Preset benennen',
    uiFavouriteAdd: 'Zu Favoriten hinzufügen',
    uiFavouriteRemove: 'Aus Favoriten entfernen',
    uiHoverPeekTitle: 'Kurzansicht',
    uiFindAll: 'Alle finden',
    uiFindAllTooltip: 'Alle HomeDrop-Karten auf dieser Seite finden',
    uiDrop: 'Ablegen',
    uiDropN: '{n} ablegen',
    uiDropAsList: 'Als Liste ablegen',
    uiDropNAsList: '{n} als Liste ablegen',
    uiDropAsGrid: 'Als Raster ablegen',
    uiDropNAsGrid: '{n} als Raster ablegen',
    uiPresetsTooltip: 'Voreinstellungen',
    uiPresetsEmpty: 'Noch keine Voreinstellungen.',
    uiPresetsSaveCurrent: 'Aktuelle Einstellungen speichern…',
    uiPresetDelete: 'Voreinstellung löschen',
    uiFilterFavourites: 'Favoriten ({n})',
    uiFilterFavouritesEmpty: 'Markiere Karten als Favoriten',
    uiDropBannerSubNone: 'Wähle unten eine Unterkunft',
    uiDropBannerSubSingle: 'Die ausgewählte Unterkunft landet hier',
    uiDropBannerSubList: '{n} Unterkünfte landen hier als Liste',
    uiDropBannerSubGrid: '{n} Unterkünfte landen hier als Raster',
    uiDropBannerSubPopulate: 'Passende #-Felder mit der Auswahl füllen',
    uiLoadErrorTitle: 'Unterkünfte konnten nicht geladen werden',
    uiLoadErrorRetry: 'Erneut versuchen',
  },
  es: {
    ratingOutstanding: 'Excepcional',
    ratingExcellent: 'Excelente',
    ratingGood: 'Bien',
    quickFacts: 'Datos clave',
    reasonsToBook: 'Razones para reservar',
    roomInformation: 'Información de las habitaciones',
    seeAllRooms: 'Ver todas las habitaciones',
    seeMore: 'Ver más',
    houseRules: 'Normas de la casa',
    location: 'Ubicación',
    address: 'Dirección',
    cancellationPolicy: 'Política de cancelación',
    perNightHero: '/ noche',
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
    bedroom: 'dormitorio',
    bedrooms: 'dormitorios',
    bathrooms: 'baños',
    beds: 'camas',
    compare: 'Comparar',
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
    uiMarket: 'Mercado',
    uiSurface: 'Superficie',
    uiRefresh: 'Actualizar las tarjetas seleccionadas (volver a renderizar con los datos actuales)',
    uiModeSingle: 'Una',
    uiModeList: 'Lista',
    uiModeGrid: 'Cuadrícula',
    uiSearchPlaceholder: '¿Adónde? Ciudad o país',
    uiFilterAll: 'Todos',
    uiFilterPriceMax: 'Menos de {amount}',
    uiFilterRatingPlus: '★ 4,5+',
    uiFilterGuestsPlus: '{n}+ huéspedes',
    uiSortRecommended: 'Recomendados',
    uiSortPriceAsc: 'Precio: de menor a mayor',
    uiSortPriceDesc: 'Precio: de mayor a menor',
    uiSortTopRated: 'Mejor valorados',
    uiSortNewListings: 'Nuevos anuncios',
    uiNProperties: '{n} alojamientos',
    uiNOfTotal: '{n} de {total}',
    uiSelectAProperty: 'Selecciona un alojamiento',
    uiInsert: 'Insertar',
    uiInsertN: 'Insertar {n}',
    uiInsertAsList: 'Insertar como lista',
    uiInsertNAsList: 'Insertar {n} como lista',
    uiInsertAsGrid: 'Insertar como cuadrícula',
    uiInsertNAsGrid: 'Insertar {n} como cuadrícula',
    uiHintClickSingle: 'Haz clic en un alojamiento para seleccionarlo',
    uiHintPickList: 'Elige varios para apilarlos como lista',
    uiHintPickGrid: 'Elige varios para organizarlos en cuadrícula',
    uiNSelected: '{n} seleccionados',
    uiEnterToInsert: '{n} seleccionados · ⏎ para insertar',
    uiSelectAll: 'Seleccionar todos',
    uiSelectAllN: 'Seleccionar los {n}',
    uiClear: 'Limpiar',
    uiPickAsList: 'Elige alojamientos para insertar como lista',
    uiPickAsGrid: 'Elige alojamientos para insertar como cuadrícula',
    uiNoMatchTitle: 'No hay coincidencias',
    uiNoMatchHint: 'Prueba a ampliar los filtros o buscar otra ciudad.',
    uiClearAllFilters: 'Limpiar todos los filtros',
    uiBreadcrumbProperties: 'Alojamientos',
    uiSectionsToInsert: 'Secciones a insertar',
    uiPickSectionsToInsert: 'Selecciona secciones para soltar',
    uiSelectSections: 'Seleccionar secciones',
    uiInsertSection: 'Soltar sección',
    uiInsertNSections: 'Soltar {n} secciones',
    uiNSection: '{n} sección · ⏎ para soltar',
    uiNSections: '{n} secciones · ⏎ para soltar',
    uiTileGallery: 'Galería',
    uiTileGalleryDesc: 'Imagen principal + miniaturas',
    uiTileTitleHeader: 'Encabezado',
    uiTileTitleHeaderDesc: 'Distintivos + título + valoración + precio',
    uiTileQuickFacts: 'Datos clave',
    uiTileQuickFactsDesc: 'Cuadrícula de iconos con datos clave',
    uiTileReasonsToBook: 'Razones para reservar',
    uiTileReasonsToBookDesc: 'Lista de 3 elementos: icono + título + descripción',
    uiTileReviews: 'Desglose de valoraciones',
    uiTileReviewsDesc: 'Global + subvaloraciones + 3 opiniones',
    uiTileAmenities: 'Servicios',
    uiTileAmenitiesDesc: 'Lo que ofrece el alojamiento — iconos agrupados',
    uiTileRoomInformation: 'Información de las habitaciones',
    uiTileRoomInformationDesc: 'Tarjetas de dormitorios/baños + camas',
    uiTileDescription: 'Descripción',
    uiTileDescriptionDesc: 'Párrafo + destacados + Ver más',
    uiTileHouseRules: 'Normas de la casa',
    uiTileHouseRulesDesc: 'Icono + lista de normas',
    uiTileLocation: 'Ubicación',
    uiTileLocationDesc: 'Mapa + dirección',
    uiTilePriceBreakdown: 'Desglose del precio',
    uiTilePriceBreakdownDesc: 'Detalles, total, CTA',
    uiTileCancellationPolicy: 'Política de cancelación',
    uiTileCancellationPolicyDesc: 'Niveles de reembolso con marcas de color',
    uiTileNotAvailable: 'No disponible para esta oferta',
    uiLabelGuests: 'Huéspedes',
    uiLabelBedrooms: 'Dormitorios',
    uiLabelBaths: 'Baños',
    uiNewShort: 'Nuevo',
    uiNReviewsShort: '{n} opiniones',
    uiByProvider: 'por {name}',
    uiNightsTotalSuffix: '{n} noches: {total} en total',
    uiPerNightSlash: '/ noche',
    uiOpenDetails: 'Abrir detalles →',
    uiInsertCard: 'Insertar tarjeta',
    uiPreviewTooltip: 'Vista previa',
    uiRandomize: 'Aleatorio',
    uiRandomizeTooltip: 'Elegir alojamiento al azar (R)',
    uiThemeAuto: 'Auto',
    uiThemeLight: 'Claro',
    uiThemeDark: 'Oscuro',
    uiThemeTooltip: 'Tema',
    uiToastUndo: 'Deshacer',
    uiPaletteHint: '⌘K',
    uiPalettePlaceholder: 'Escribe un comando…',
    uiPaletteRandom: 'Alojamiento aleatorio',
    uiPaletteRefresh: 'Actualizar tarjetas seleccionadas',
    uiPaletteFindAll: 'Buscar todas las tarjetas HomeDrop en esta página',
    uiPaletteSetMode: 'Modo: {value}',
    uiPaletteSetPlatform: 'Superficie: {value}',
    uiPaletteSetLocale: 'Mercado: {value}',
    uiPaletteSetTheme: 'Tema: {value}',
    uiPaletteSavePreset: 'Guardar ajustes actuales como preset…',
    uiPaletteApplyPreset: 'Aplicar preset · {value}',
    uiPaletteDrop: 'Soltar una tarjeta en el lienzo',
    uiDropBanner: 'Soltar en "{name}"',
    uiDropBannerWithFields: 'Soltar en "{name}" — {n} #campos detectados',
    uiDropBannerReplace: 'Reemplazar contenido al soltar',
    uiPresetSaved: 'Preset "{name}" guardado.',
    uiPresetNamePrompt: 'Nombre del preset',
    uiFavouriteAdd: 'Añadir a favoritos',
    uiFavouriteRemove: 'Quitar de favoritos',
    uiHoverPeekTitle: 'Vista rápida',
    uiFindAll: 'Buscar todas',
    uiFindAllTooltip: 'Buscar todas las tarjetas HomeDrop en esta página',
    uiDrop: 'Soltar',
    uiDropN: 'Soltar {n}',
    uiDropAsList: 'Soltar como lista',
    uiDropNAsList: 'Soltar {n} como lista',
    uiDropAsGrid: 'Soltar como cuadrícula',
    uiDropNAsGrid: 'Soltar {n} como cuadrícula',
    uiPresetsTooltip: 'Presets',
    uiPresetsEmpty: 'Aún no hay presets.',
    uiPresetsSaveCurrent: 'Guardar ajustes actuales…',
    uiPresetDelete: 'Eliminar preset',
    uiFilterFavourites: 'Favoritos ({n})',
    uiFilterFavouritesEmpty: 'Marca tarjetas como favoritas',
    uiDropBannerSubNone: 'Elige un alojamiento abajo',
    uiDropBannerSubSingle: 'El alojamiento seleccionado caerá aquí',
    uiDropBannerSubList: '{n} alojamientos caerán aquí como lista',
    uiDropBannerSubGrid: '{n} alojamientos caerán aquí como cuadrícula',
    uiDropBannerSubPopulate: 'Rellenar los #campos con la selección',
    uiLoadErrorTitle: 'No se pudieron cargar los alojamientos',
    uiLoadErrorRetry: 'Reintentar',
  },
  fr: {
    ratingOutstanding: 'Exceptionnel',
    ratingExcellent: 'Excellent',
    ratingGood: 'Bien',
    quickFacts: 'En bref',
    reasonsToBook: 'Raisons de réserver',
    roomInformation: 'Informations sur les chambres',
    seeAllRooms: 'Voir toutes les chambres',
    seeMore: 'Voir plus',
    houseRules: 'Règlement intérieur',
    location: 'Emplacement',
    address: 'Adresse',
    cancellationPolicy: "Conditions d'annulation",
    perNightHero: '/ nuit',
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
    bedroom: 'chambre',
    bedrooms: 'chambres',
    bathrooms: 'salles de bain',
    beds: 'lits',
    compare: 'Comparer',
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
    uiMarket: 'Marché',
    uiSurface: 'Surface',
    uiRefresh: 'Actualiser les fiches sélectionnées (re-rendre avec les données actuelles)',
    uiModeSingle: 'Unique',
    uiModeList: 'Liste',
    uiModeGrid: 'Grille',
    uiSearchPlaceholder: 'Où ? Ville ou pays',
    uiFilterAll: 'Tous',
    uiFilterPriceMax: 'Moins de {amount}',
    uiFilterRatingPlus: '★ 4,5+',
    uiFilterGuestsPlus: '{n}+ voyageurs',
    uiSortRecommended: 'Recommandés',
    uiSortPriceAsc: 'Prix : croissant',
    uiSortPriceDesc: 'Prix : décroissant',
    uiSortTopRated: 'Les mieux notés',
    uiSortNewListings: 'Nouveautés',
    uiNProperties: '{n} logements',
    uiNOfTotal: '{n} sur {total}',
    uiSelectAProperty: 'Sélectionnez un logement',
    uiInsert: 'Insérer',
    uiInsertN: 'Insérer {n}',
    uiInsertAsList: 'Insérer en liste',
    uiInsertNAsList: 'Insérer {n} en liste',
    uiInsertAsGrid: 'Insérer en grille',
    uiInsertNAsGrid: 'Insérer {n} en grille',
    uiHintClickSingle: 'Cliquez sur un logement pour le sélectionner',
    uiHintPickList: 'Choisissez-en plusieurs pour une liste',
    uiHintPickGrid: 'Choisissez-en plusieurs pour une grille',
    uiNSelected: '{n} sélectionnés',
    uiEnterToInsert: '{n} sélectionnés · ⏎ pour insérer',
    uiSelectAll: 'Tout sélectionner',
    uiSelectAllN: 'Tout sélectionner ({n})',
    uiClear: 'Effacer',
    uiPickAsList: 'Choisissez des logements à insérer en liste',
    uiPickAsGrid: 'Choisissez des logements à insérer en grille',
    uiNoMatchTitle: 'Aucun logement ne correspond',
    uiNoMatchHint: 'Élargissez les filtres ou cherchez une autre ville.',
    uiClearAllFilters: 'Effacer tous les filtres',
    uiBreadcrumbProperties: 'Logements',
    uiSectionsToInsert: 'Sections à insérer',
    uiPickSectionsToInsert: 'Choisissez des sections à déposer',
    uiSelectSections: 'Sélectionner des sections',
    uiInsertSection: 'Déposer la section',
    uiInsertNSections: 'Déposer {n} sections',
    uiNSection: '{n} section · ⏎ pour déposer',
    uiNSections: '{n} sections · ⏎ pour déposer',
    uiTileGallery: 'Galerie',
    uiTileGalleryDesc: 'Image principale + vignettes',
    uiTileTitleHeader: 'En-tête',
    uiTileTitleHeaderDesc: 'Badges + titre + note + prix',
    uiTileQuickFacts: 'En bref',
    uiTileQuickFactsDesc: "Grille d'icônes avec les infos clés",
    uiTileReasonsToBook: 'Raisons de réserver',
    uiTileReasonsToBookDesc: 'Liste de 3 : icône + titre + description',
    uiTileReviews: 'Détail des avis',
    uiTileReviewsDesc: 'Global + sous-notes + 3 avis',
    uiTileAmenities: 'Équipements',
    uiTileAmenitiesDesc: 'Ce que propose ce séjour — icônes groupées',
    uiTileRoomInformation: 'Informations sur les chambres',
    uiTileRoomInformationDesc: 'Fiches chambres/SDB + lits',
    uiTileDescription: 'Description',
    uiTileDescriptionDesc: 'Texte + faits marquants + Voir plus',
    uiTileHouseRules: 'Règlement intérieur',
    uiTileHouseRulesDesc: 'Icône + liste de règles',
    uiTileLocation: 'Emplacement',
    uiTileLocationDesc: 'Carte + adresse',
    uiTilePriceBreakdown: 'Détail du coût',
    uiTilePriceBreakdownDesc: 'Lignes, total, CTA',
    uiTileCancellationPolicy: "Conditions d'annulation",
    uiTileCancellationPolicyDesc: 'Niveaux de remboursement avec repères',
    uiTileNotAvailable: 'Non disponible pour cette offre',
    uiLabelGuests: 'Voyageurs',
    uiLabelBedrooms: 'Chambres',
    uiLabelBaths: 'SDB',
    uiNewShort: 'Nouveau',
    uiNReviewsShort: '{n} avis',
    uiByProvider: 'par {name}',
    uiNightsTotalSuffix: '{n} nuits : {total} au total',
    uiPerNightSlash: '/ nuit',
    uiOpenDetails: 'Voir les détails →',
    uiInsertCard: 'Insérer la fiche',
    uiPreviewTooltip: 'Aperçu',
    uiRandomize: 'Aléatoire',
    uiRandomizeTooltip: 'Choisir un logement au hasard (R)',
    uiThemeAuto: 'Auto',
    uiThemeLight: 'Clair',
    uiThemeDark: 'Sombre',
    uiThemeTooltip: 'Thème',
    uiToastUndo: 'Annuler',
    uiPaletteHint: '⌘K',
    uiPalettePlaceholder: 'Tapez une commande…',
    uiPaletteRandom: 'Logement aléatoire',
    uiPaletteRefresh: 'Actualiser les fiches sélectionnées',
    uiPaletteFindAll: 'Trouver toutes les fiches HomeDrop sur cette page',
    uiPaletteSetMode: 'Mode : {value}',
    uiPaletteSetPlatform: 'Surface : {value}',
    uiPaletteSetLocale: 'Marché : {value}',
    uiPaletteSetTheme: 'Thème : {value}',
    uiPaletteSavePreset: 'Enregistrer les réglages actuels comme préréglage…',
    uiPaletteApplyPreset: 'Appliquer le préréglage · {value}',
    uiPaletteDrop: 'Déposer une fiche sur le canevas',
    uiDropBanner: 'Déposer dans « {name} »',
    uiDropBannerWithFields: 'Déposer dans « {name} » — {n} champs # détectés',
    uiDropBannerReplace: 'Remplacer le contenu au dépôt',
    uiPresetSaved: 'Préréglage « {name} » enregistré.',
    uiPresetNamePrompt: 'Nommez ce préréglage',
    uiFavouriteAdd: 'Ajouter aux favoris',
    uiFavouriteRemove: 'Retirer des favoris',
    uiHoverPeekTitle: 'Aperçu rapide',
    uiFindAll: 'Tout trouver',
    uiFindAllTooltip: 'Trouver toutes les fiches HomeDrop sur cette page',
    uiDrop: 'Déposer',
    uiDropN: 'Déposer {n}',
    uiDropAsList: 'Déposer en liste',
    uiDropNAsList: 'Déposer {n} en liste',
    uiDropAsGrid: 'Déposer en grille',
    uiDropNAsGrid: 'Déposer {n} en grille',
    uiPresetsTooltip: 'Préréglages',
    uiPresetsEmpty: 'Aucun préréglage pour le moment.',
    uiPresetsSaveCurrent: 'Enregistrer les réglages actuels…',
    uiPresetDelete: 'Supprimer le préréglage',
    uiFilterFavourites: 'Favoris ({n})',
    uiFilterFavouritesEmpty: 'Mettez une fiche en favori',
    uiDropBannerSubNone: 'Choisissez un logement ci-dessous',
    uiDropBannerSubSingle: 'Le logement sélectionné atterrira ici',
    uiDropBannerSubList: '{n} logements atterriront ici en liste',
    uiDropBannerSubGrid: '{n} logements atterriront ici en grille',
    uiDropBannerSubPopulate: 'Remplir les champs # avec la sélection',
    uiLoadErrorTitle: 'Impossible de charger les logements',
    uiLoadErrorRetry: 'Réessayer',
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
