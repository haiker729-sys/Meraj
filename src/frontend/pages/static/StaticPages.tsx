import React from 'react';
import { Shield, RotateCcw, Truck, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface StaticPageProps {
  pageType: 'about' | 'contact' | 'return-policy' | 'privacy-policy' | 'terms' | 'shipping-policy';
  onNavigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ pageType, onNavigate }) => {
  return (
    <div className="min-h-screen bg-neutral-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-2xs">
          {pageType === 'return-policy' && (
            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
                <RotateCcw className="w-6 h-6 text-black" />
                <h1 className="text-2xl font-black font-serif text-neutral-900">
                  7-Day Return & Exchange Policy
                </h1>
              </div>
              <p>
                At <strong>Fashion Point</strong>, we stand behind the craftsmanship and comfort of every garment we sell. If you are not completely satisfied with the fit, fabric, or finish of your apparel, you can initiate a return or exchange within <strong>7 days</strong> from the delivery date.
              </p>
              <h3 className="font-bold text-base text-neutral-900">Return Eligibility Conditions:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Garments must be unworn, unwashed, and in their original packaging with all brand tags intact.</li>
                <li>Trial is allowed only to assess fit and size. Soiled, stained, or perfumed clothing will not be eligible.</li>
                <li>Free door-step reverse pickup will be scheduled by our courier partner within 48 hours of your request.</li>
              </ul>
              <h3 className="font-bold text-base text-neutral-900">Refund Process:</h3>
              <p>
                For Cash on Delivery (COD) orders, refunds are transferred directly to your bank account or UPI ID within 2 business days of product inspection. Online paid orders are refunded directly to the original payment source.
              </p>
            </div>
          )}

          {pageType === 'about' && (
            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="pb-4 border-b border-neutral-200">
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-neutral-500">
                  Our Journey
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 mt-1">
                  About Fashion Point Clothing Store
                </h1>
              </div>
              <p>
                Founded with a mission to bring high-grade cotton fabrics and honest Indian tailoring to everyday wear, Fashion Point has grown from a humble family shop into a full-scale omnichannel brand trusted by over 10,000 households.
              </p>
              <p>
                We believe that premium apparel shouldn't carry exorbitant markups. By eliminating middlemen and sourcing pure combed cotton yarns and natural dyes directly from weavers in Gujarat, Madhya Pradesh, and Tamil Nadu, we deliver high street fashion at accessible prices.
              </p>
            </div>
          )}

          {pageType === 'contact' && (
            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="pb-4 border-b border-neutral-200">
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-neutral-500">
                  Customer Assistance
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 mt-1">
                  Contact Us & Store Location
                </h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <MapPin className="w-4 h-4 text-black" />
                    <span>Physical Store</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Shop 14-16, New Cloth Market, MG Road, Indore, MP - 452001
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Clock className="w-4 h-4 text-black" />
                    <span>Business Hours</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    10:00 AM – 9:00 PM (Monday through Sunday)
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Phone className="w-4 h-4 text-black" />
                    <span>Helpline & WhatsApp</span>
                  </div>
                  <p className="text-xs text-neutral-600 font-mono">
                    +91 98765 43210 (Support available 10 AM - 8 PM)
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Mail className="w-4 h-4 text-black" />
                    <span>Email Support</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    care@fashionpoint.store / orders@fashionpoint.store
                  </p>
                </div>
              </div>
            </div>
          )}

          {pageType === 'privacy-policy' && (
            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="pb-4 border-b border-neutral-200">
                <h1 className="text-2xl font-black font-serif text-neutral-900">Privacy Policy</h1>
              </div>
              <p>
                We respect your personal privacy. Customer phone numbers and addresses are used solely for shipping fulfillment, live parcel updates, and GST tax invoice generation. We never sell or share user data with third-party telemarketers.
              </p>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="pb-4 border-b border-neutral-200">
                <h1 className="text-2xl font-black font-serif text-neutral-900">Terms of Service</h1>
              </div>
              <p>
                All merchandise prices displayed are in Indian Rupees (INR) and include applicable Goods and Services Tax (GST). Offers, discounts, and coupons are governed by their respective promotional terms.
              </p>
            </div>
          )}

          {pageType === 'shipping-policy' && (
            <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="pb-4 border-b border-neutral-200">
                <h1 className="text-2xl font-black font-serif text-neutral-900">
                  Shipping & Delivery Timelines
                </h1>
              </div>
              <p>
                Orders are processed and packed within 24 hours of receipt. Standard express delivery across India takes 2 to 5 business days depending on delivery location. Free delivery is provided on all cart values of ₹999 and above.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-neutral-200 text-right">
            <button
              type="button"
              onClick={() => onNavigate('/home')}
              className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
