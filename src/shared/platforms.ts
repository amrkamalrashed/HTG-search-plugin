export type Platform = 'web' | 'ios' | 'android';

export const PLATFORMS: Array<{ id: Platform; label: string; icon: string }> = [
  { id: 'web', label: 'Web', icon: '⎕' },
  { id: 'ios', label: 'iOS', icon: '' },
  { id: 'android', label: 'Android', icon: '◆' },
];

export const isMobile = (p: Platform): boolean => p === 'ios' || p === 'android';

export interface PlatformSpec {
  cardWidth: number;
  cardHeight: number;
  imageHeight: number;
  radius: number;
  padding: number;
  gap: number;
  shadowBlur: number;
  shadowAlpha: number;
  fontFamily: string;
  titleSize: number;
  priceSize: number;
}

export const PLATFORM_SPEC: Record<Platform, PlatformSpec> = {
  web: {
    cardWidth: 880,
    cardHeight: 320,
    imageHeight: 320,
    radius: 16,
    padding: 20,
    gap: 8,
    shadowBlur: 12,
    shadowAlpha: 0.06,
    fontFamily: 'Inter',
    titleSize: 20,
    priceSize: 28,
  },
  ios: {
    cardWidth: 343,
    cardHeight: 560,
    imageHeight: 280,
    radius: 16,
    padding: 16,
    gap: 8,
    shadowBlur: 12,
    shadowAlpha: 0.06,
    fontFamily: 'Inter',
    titleSize: 20,
    priceSize: 18,
  },
  android: {
    cardWidth: 360,
    cardHeight: 560,
    imageHeight: 280,
    radius: 12,
    padding: 16,
    gap: 8,
    shadowBlur: 18,
    shadowAlpha: 0.14,
    fontFamily: 'Inter',
    titleSize: 20,
    priceSize: 18,
  },
};
