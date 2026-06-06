'use client';

import { Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigationStore } from '@/stores/navigation';
import { BRAND_NAME, CATEGORIES, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SHOP_LINKS = [
  { label: 'All Products', category: null },
  { label: 'Perfumes', category: 'Perfumes' },
  { label: 'Sunglasses', category: 'Sunglasses' },
  { label: 'Jewelry', category: 'Jewelry' },
  { label: 'Fashion Accessories', category: 'Fashion Accessories' },
];

type HelpLinkAction = { type: 'dialog'; key: string } | { type: 'navigate'; page: string } | { type: 'whatsapp' };

const HELP_LINKS: { label: string; action: HelpLinkAction }[] = [
  { label: 'Shipping Info', action: { type: 'dialog', key: 'shipping' } },
  { label: 'Returns & Exchanges', action: { type: 'dialog', key: 'returns' } },
  { label: 'FAQs', action: { type: 'dialog', key: 'faqs' } },
  { label: 'Track Order', action: { type: 'navigate', page: 'account' } },
  { label: 'Contact Us', action: { type: 'whatsapp' } },
  { label: 'WhatsApp Support', action: { type: 'whatsapp' } },
];

const COMPANY_LINKS: { label: string; key: string }[] = [
  { label: 'About ÈLARA', key: 'about' },
  { label: 'Our Story', key: 'story' },
  { label: 'Sustainability', key: 'sustainability' },
  { label: 'Press', key: 'press' },
];

type DialogKey = 'shipping' | 'returns' | 'faqs' | 'about' | 'story' | 'sustainability' | 'press' | 'privacy' | 'terms';

const DIALOG_CONTENT: Record<DialogKey, { title: string; description: string; body: string }> = {
  shipping: {
    title: 'Shipping Information',
    description: 'Learn about our delivery options and timelines.',
    body: `At ÈLARA, we deliver luxury right to your doorstep across Nigeria.\n\n• Lagos: 1–2 business days (₦1,500)\n• Ogun: 2–3 business days (₦2,000)\n• Abuja & Rivers: 2–4 business days (₦2,500)\n• Other states: 3–5 business days (₦3,000)\n\nFree delivery on orders over ₦30,000!\n\nAll orders are carefully packaged to ensure your items arrive in perfect condition. You will receive a tracking number once your order ships.`,
  },
  returns: {
    title: 'Returns & Exchanges',
    description: 'Our hassle-free return and exchange policy.',
    body: `We want you to be completely satisfied with your purchase.\n\n• Returns are accepted within 7 days of delivery\n• Items must be unused, in original packaging with all tags attached\n• To initiate a return, contact us via WhatsApp or email\n• Exchanges are subject to availability\n• Refunds are processed within 5–7 business days after we receive the returned item\n\nPlease note: Personalized or custom items cannot be returned unless defective.`,
  },
  faqs: {
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about shopping with ÈLARA.',
    body: `Q: How do I track my order?\nA: Once your order ships, you will receive a tracking number via email or SMS.\n\nQ: What payment methods do you accept?\nA: We accept Paystack (card/bank transfer) and Pay on Delivery.\n\nQ: Is cash on delivery available?\nA: Yes! Select "Pay on Delivery" at checkout.\n\nQ: How long does delivery take?\nA: 1–5 business days depending on your location.\n\nQ: Can I return an item?\nA: Yes, within 7 days of delivery. See our Returns & Exchanges policy.\n\nQ: Are your products authentic?\nA: Absolutely. We source directly from authorized distributors and brands.`,
  },
  about: {
    title: 'About ÈLARA',
    description: 'Who we are and what we stand for.',
    body: `ÈLARA is Nigeria's premier online destination for curated luxury accessories. Founded with a passion for making premium fashion accessible, we bring together the finest perfumes, sunglasses, jewelry, and accessories from around the world.\n\nOur mission is simple: to help every Nigerian express their unique style through carefully selected, authentic luxury products — delivered with care and excellence.`,
  },
  story: {
    title: 'Our Story',
    description: 'The journey behind the brand.',
    body: `ÈLARA was born from a simple observation: Nigerians deserve better access to authentic luxury fashion without the hassle of international shipping or inflated prices.\n\nWhat started as a small curated collection has grown into a trusted destination for thousands of discerning shoppers across the country. Every product in our store is hand-selected for quality, style, and authenticity.\n\nOur name, ÈLARA, reflects our commitment to elegance and sophistication — values that guide every decision we make.`,
  },
  sustainability: {
    title: 'Sustainability',
    description: 'Our commitment to a better future.',
    body: `At ÈLARA, we believe luxury and responsibility go hand in hand.\n\n• Eco-friendly packaging: We use recyclable and biodegradable packaging materials\n• Ethical sourcing: We partner with brands that uphold fair labor practices\n• Carbon-conscious shipping: We optimize delivery routes to reduce emissions\n• Community impact: A portion of every sale supports local artisan programs\n\nWe are continuously working to reduce our environmental footprint while delivering the premium experience you expect.`,
  },
  press: {
    title: 'Press',
    description: 'ÈLARA in the news and media.',
    body: `Interested in featuring ÈLARA? We'd love to hear from you.\n\nFor press inquiries, collaborations, or media kits, please reach out to us via WhatsApp or email.\n\nWe've been featured in leading Nigerian fashion and lifestyle publications, and we're always open to sharing our story and vision for accessible luxury in Africa.`,
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How we protect and handle your personal information.',
    body: `Last updated: January 2025\n\nÈLARA is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.\n\nInformation We Collect:\n• Name, email, and contact details when you create an account or place an order\n• Shipping address for order delivery\n• Payment information (processed securely through Paystack; we do not store card details)\n• Browsing data and cookies to improve your experience\n\nHow We Use Your Information:\n• To process and fulfill your orders\n• To communicate order updates and promotions\n• To improve our website and services\n\nYour Rights:\n• You can request access to, correction of, or deletion of your personal data at any time\n• You can unsubscribe from marketing communications at any time\n\nWe never sell your personal information to third parties.`,
  },
  terms: {
    title: 'Terms of Service',
    description: 'The terms and conditions governing your use of our services.',
    body: `Last updated: January 2025\n\nBy using the ÈLARA website and services, you agree to the following terms:\n\n1. Orders: All orders are subject to availability and confirmation. Prices may change without notice.\n\n2. Payment: We accept Paystack and Pay on Delivery. Payment must be completed before items are shipped (except Pay on Delivery orders).\n\n3. Shipping: Delivery times are estimates and may vary. We are not liable for delays caused by carriers or unforeseen circumstances.\n\n4. Returns: Please refer to our Returns & Exchanges policy for full details.\n\n5. Intellectual Property: All content on this website is the property of ÈLARA and may not be reproduced without permission.\n\n6. Limitation of Liability: ÈLARA shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.\n\nFor questions about these terms, please contact us.`,
  },
};

export default function Footer() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setCategory = useNavigationStore((s) => s.setCategory);
  const [openDialog, setOpenDialog] = useState<DialogKey | null>(null);

  const handleShopLink = (category: string | null) => {
    if (category) {
      setCategory(category);
    } else {
      navigate('shop');
    }
  };

  const handleHelpLink = (action: HelpLinkAction) => {
    switch (action.type) {
      case 'dialog':
        setOpenDialog(action.key as DialogKey);
        break;
      case 'navigate':
        navigate(action.page as 'account' | 'shop' | 'home');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`, '_blank');
        break;
    }
  };

  const handleCompanyLink = (key: string) => {
    setOpenDialog(key as DialogKey);
  };

  const dialogData = openDialog ? DIALOG_CONTENT[openDialog] : null;

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
                href="https://www.instagram.com/elara.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://twitter.com/elara_ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="https://www.facebook.com/elara.ng"
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
                <li key={link.label}>
                  <button
                    onClick={() => handleHelpLink(link.action)}
                    className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors duration-200"
                  >
                    {link.label}
                  </button>
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
                <li key={link.label}>
                  <button
                    onClick={() => handleCompanyLink(link.key)}
                    className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors duration-200"
                  >
                    {link.label}
                  </button>
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
            <button
              onClick={() => setOpenDialog('privacy')}
              className="text-gray-500 text-xs hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-gray-500 text-xs">|</span>
            <button
              onClick={() => setOpenDialog('terms')}
              className="text-gray-500 text-xs hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Footer Dialog */}
      <Dialog open={!!openDialog} onOpenChange={(open) => { if (!open) setOpenDialog(null); }}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          {dialogData && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-[#D4AF37]">
                  {dialogData.title}
                </DialogTitle>
                <DialogDescription>
                  {dialogData.description}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {dialogData.body}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
