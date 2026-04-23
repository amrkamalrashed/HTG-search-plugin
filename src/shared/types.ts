export type Currency = 'EUR' | 'USD' | 'GBP';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'cabin'
  | 'chalet'
  | 'cottage'
  | 'studio'
  | 'penthouse'
  | 'castle'
  | 'bungalow'
  | 'hotel';

export type AmenityCategory =
  | 'internet_tv'
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'outdoor'
  | 'cooling_heating'
  | 'parking_accessibility'
  | 'services'
  | 'policies';

export type Amenity =
  | 'wifi'
  | 'kitchen'
  | 'washer'
  | 'dryer'
  | 'parking'
  | 'pool'
  | 'hot_tub'
  | 'air_conditioning'
  | 'heating'
  | 'balcony'
  | 'terrace'
  | 'garden'
  | 'bbq'
  | 'fireplace'
  | 'sea_view'
  | 'mountain_view'
  | 'pets_allowed'
  | 'smoking_allowed'
  | 'wheelchair_accessible'
  | 'ev_charger'
  | 'tv'
  | 'hair_dryer'
  | 'elevator'
  | 'breakfast';

export type Badge =
  | 'top_rated'
  | 'great_deal'
  | 'instant_book'
  | 'new_listing'
  | 'free_cancellation'
  | 'eco_friendly';

/**
 * Detail-page review breakdown. Mirrors what HomeToGo surfaces on
 * the property detail page: an overall score and sub-ratings on a
 * 0–5 scale, plus individual review items.
 */
export interface ReviewDetails {
  overall: number;
  count: number;
  subRatings: Partial<{
    cleanliness: number;
    location: number;
    value: number;
    communication: number;
  }>;
  items: Array<{
    author: string;
    date: string;
    rating: number;
    text: string;
    avatarUrl?: string;
  }>;
}

export interface PriceBreakdown {
  lineItems: Array<{
    /** 'perNight' | 'serviceFee' | 'taxes' | 'cleaning' | custom */
    key: string;
    label?: string;
    amount: number;
    /** Shown as "€128 × 7 nights" when set. */
    quantity?: number;
    quantityLabel?: string;
  }>;
  total: number;
  currency: Currency;
}

export interface Offer {
  id: string;
  title: string;
  propertyType: PropertyType;
  /** Localised or custom override for the category label above the title. */
  categoryLabel?: string;
  location: {
    city: string;
    region?: string;
    country: string;
    countryCode: string;
    neighborhood?: string;
    distanceToCenterKm?: number;
    lat?: number;
    lng?: number;
  };
  images: Array<{ url: string; alt?: string }>;
  price: {
    perNight: number;
    total: number;
    currency: Currency;
    nights: number;
  };
  discount?: {
    percent: number;
    originalPerNight: number;
    label?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  capacity: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
  };
  amenities: Amenity[];
  /** Optional grouping used by the Amenities detail section. */
  amenitiesByCategory?: Partial<Record<AmenityCategory, Amenity[]>>;
  badges: Badge[];
  provider: {
    name: string;
    logoUrl?: string;
  };
  cancellation: 'free_until_7d' | 'free_until_24h' | 'non_refundable' | 'flexible';
  url: string;
  shortDescription?: string;
  /** Full description for the About section on the detail page. */
  fullDescription?: string;
  /** Bullet highlights shown alongside the description. */
  highlights?: string[];
  /** Detail-page review breakdown (optional — only on enriched offers). */
  reviewDetails?: ReviewDetails;
  /** Detail-page price breakdown (optional). */
  priceBreakdown?: PriceBreakdown;
}
