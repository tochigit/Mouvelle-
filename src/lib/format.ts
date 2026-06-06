import { BRAND_CURRENCY, DELIVERY_FEES, DELIVERY_TIMELINES, FREE_DELIVERY_THRESHOLD } from './constants';

export function formatPrice(priceInNaira: number): string {
  return `${BRAND_CURRENCY}${priceInNaira.toLocaleString()}`;
}

export function formatPriceWithDiscount(price: number, discountPrice: number | null): {
  current: string;
  original: string | null;
  discount: number | null;
} {
  if (discountPrice && discountPrice < price) {
    const discount = Math.round(((price - discountPrice) / price) * 100);
    return {
      current: formatPrice(discountPrice),
      original: formatPrice(price),
      discount,
    };
  }
  return {
    current: formatPrice(price),
    original: null,
    discount: null,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getDeliveryFee(state: string, subtotal: number = 0): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  if (DELIVERY_FEES[state]) return DELIVERY_FEES[state];

  const nearbyStates = ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'];
  const centralStates = ['Abuja', 'Kwara', 'Kogi', 'Niger', 'Edo', 'Delta', 'Anambra', 'Enugu'];
  const farStates = ['Kano', 'Kaduna', 'Katsina', 'Sokoto', 'Zamfara', 'Yobe', 'Borno', 'Adamawa', 'Taraba'];

  if (nearbyStates.includes(state)) return 2200;
  if (centralStates.includes(state)) return 2800;
  if (farStates.includes(state)) return 3800;

  return DELIVERY_FEES['default'];
}

export function getDeliveryTimeline(state: string): string {
  return DELIVERY_TIMELINES[state] || DELIVERY_TIMELINES['default'];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
