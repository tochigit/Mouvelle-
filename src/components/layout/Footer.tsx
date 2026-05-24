'use client';

import { Instagram, Twitter, Facebook } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigation';
import { BRAND_NAME, CATEGORIES, WHATSAPP_NUMBER } from '@/lib/constants';

const SHOP_LINKS = [
  { label: 'All Products', category: null },
  { label: 'Perfumes', category: 'Perfumes' },
  { label: 'Sunglasses', category: 'Sunglasses' },
  { label: 'Jewelry', category: 'Jewelry' },
  { label: 'Fashion Accessories', category: 'Fashion Accessories' },
];

const HELP_LINKS = [
  'Shipping Info',
  'Returns & Exchanges',
  'FAQs',
  'Track Order',
  'Contact Us',
  'WhatsApp Support',
];

const COMPANY_LINKS = [
  'About ÈLARA',
  'Our Story',
  'Sustainability',
  'Press',
];

export default function Footer() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setCategory = useNavigationStore((s) => s.setCategory);

  const handleShopLink = (category: string | null) => {
    if (category) {
      setCategory(category);
    } else {
      navigate('shop');
    }
  };

  return (
    <footer className="bg-[#0D0D0D] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="font-serif text-3xl font-bold text-[#D4AF37] tracking-[0.15em] uppercase mb-4">
              {BRAND_NAME}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Curated luxury for the discerning Nigerian shopper. Premium perfumes, sunglasses, jewelry & fashion accessories delivered to your doorstep.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleShopLink(link.category)}
                    className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-4">
              Help
            </h3>
            <ul className="space-y-3">
              {HELP_LINKS.map((link) => (
                <li key={link}>
                  {link === 'WhatsApp Support' ? (
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors duration-200"
                    >
                      {link}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors duration-200 cursor-pointer">
                      {link}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link}>
                  <span className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors duration-200 cursor-pointer">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; 2025 {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-xs hover:text-[#D4AF37] transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-gray-500 text-xs">|</span>
            <span className="text-gray-500 text-xs hover:text-[#D4AF37] transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
