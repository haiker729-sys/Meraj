import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-neutral-950 text-white pt-12 pb-24 lg:pb-12 border-t border-neutral-800">
      {/* Customer Value Props Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-neutral-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Free Express Delivery</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">On all orders above ₹999 across India</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">7-Day Easy Returns</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">No questions asked exchange & refund policy</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">100% Cotton & Quality</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Directly sourced combed fabrics & stitching</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Cash on Delivery</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Pay at your doorstep with Cash or UPI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand & Store Bio */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center rounded-md text-sm">
              FP
            </div>
            <span className="font-black text-lg tracking-tight font-serif">FASHION POINT</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
            Fashion Point is your beloved local clothing destination, bringing premium cotton essentials, trending festival wear, and durable casuals for the entire family with honest pricing.
          </p>
          <div className="space-y-2 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>Shop 14-16, New Cloth Market, MG Road, Indore - 452001</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>+91 98765 43210 (10 AM - 9 PM, All 7 Days)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>care@fashionpoint.store</span>
            </div>
          </div>
        </div>

        {/* Quick Shopping Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-white">Categories</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>
              <button type="button" onClick={() => onNavigate('/products?category=Men')} className="hover:text-white transition-colors">
                Men's Shirts & T-Shirts
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/products?category=Men&subCategory=Jeans')} className="hover:text-white transition-colors">
                Men's Tapered Jeans
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/products?category=Women')} className="hover:text-white transition-colors">
                Women's Dresses & Kurtas
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/products?category=Kids')} className="hover:text-white transition-colors">
                Kids Playwear & Dungarees
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/products?filter=bestsellers')} className="hover:text-white transition-colors">
                Bestsellers
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-white">Customer Care</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>
              <button type="button" onClick={() => onNavigate('/order-tracking')} className="hover:text-white transition-colors">
                Track Your Order
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/return-policy')} className="hover:text-white transition-colors">
                Returns & Exchange Policy
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                Contact & Store Locator
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                About Fashion Point
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/account')} className="hover:text-white transition-colors">
                My Account
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-white">Legal & Compliance</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>
              <button type="button" onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                Terms of Service
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/shipping-policy')} className="hover:text-white transition-colors">
                Shipping & Delivery Timelines
              </button>
            </li>
            <li>
              <span className="text-[10px] text-neutral-500 font-mono block mt-2">
                GSTIN: 23AAAAF8899A1Z2
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
        <p className="flex items-center gap-1">
          <span>© 2026 Fashion Point Clothing Store. All rights reserved.</span>
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            title="Store Staff Portal"
            className="text-neutral-700 hover:text-neutral-500 text-xs px-1 cursor-default hover:cursor-pointer transition-colors"
          >
            •
          </button>
        </p>
        <div className="flex items-center gap-3 text-neutral-300">
          <span className="text-[11px] font-medium">Payment Options:</span>
          <span className="font-mono text-xs bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">UPI</span>
          <span className="font-mono text-xs bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">COD</span>
          <span className="font-mono text-xs bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">RuPay</span>
          <span className="font-mono text-xs bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">Cards</span>
        </div>
      </div>
    </footer>
  );
};
