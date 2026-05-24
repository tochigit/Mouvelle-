export const BRAND_NAME = "ÈLARA";
export const BRAND_TAGLINE = "Curated Luxury. Delivered.";
export const BRAND_CURRENCY = "₦";
export const FREE_DELIVERY_THRESHOLD = 30000;
export const WHATSAPP_NUMBER = "+2348000000000";
export const WHATSAPP_MESSAGE = "Hello ÈLARA! I'd like to inquire about a product.";

export const DELIVERY_FEES: Record<string, number> = {
  "Lagos": 1500,
  "Ogun": 2000,
  "Abuja": 2500,
  "Rivers": 2500,
  "Kano": 3000,
  "Oyo": 2500,
  "default": 3000,
};

export const DELIVERY_TIMELINES: Record<string, string> = {
  "Lagos": "1-2 days",
  "Ogun": "2-3 days",
  "Abuja": "2-4 days",
  "default": "3-5 days",
};

export const NIGERIAN_STATES = [
  "Abia", "Abuja", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export const CATEGORIES = ["Perfumes", "Sunglasses", "Jewelry", "Fashion Accessories"];

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
] as const;
