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

export interface Offer {
  id: string;
  /** Human title, e.g. "De Bedstee Boutique Capsules". */
  title: string;
  propertyType: PropertyType;
  /**
   * Optional label shown above the title ("Hotel", "1-star hotel",
   * "Boutique apartment"). If absent, the plugin falls back to a
   * capitalised propertyType.
   */
  categoryLabel?: string;
  location: {
    city: string;
    region?: string;
    country: string;
    countryCode: string;
    /** Sub-area shown in the location line, e.g. "Amsterdam Oud-Zuid". */
    neighborhood?: string;
    /** Distance to city centre in km, rendered as "X km to center". */
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
    /** E.g. "Last-minute deal". Rendered inside the discount pill. */
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
  badges: Badge[];
  provider: {
    name: string;
    logoUrl?: string;
  };
  cancellation: 'free_until_7d' | 'free_until_24h' | 'non_refundable' | 'flexible';
  url: string;
  shortDescription?: string;
}
