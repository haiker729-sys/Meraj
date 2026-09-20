import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Heart, Search, User, Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import { Product } from '../../../types';
import { storeDb } from '../../../database/store';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const all = storeDb.getProducts();
      const filtered = all.filter(
        (p: Product) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      onNavigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Men', path: '/products?category=Men' },
    { label: 'Women', path: '/products?category=Women' },
    { label: 'Kids', path: '/products?category=Kids' },
    { label: 'New Arrivals', path: '/products?filter=new' },
    { label: 'Track Order', path: '/order-tracking' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-neutral-950 text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2">
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">SALE</span>
          <span>Flat 10% OFF on first order with code: <strong className="font-mono text-amber-300">FIRST10</strong></span>
        </div>
        <div className="w-full md:w-auto text-center flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Free Express Delivery on orders above ₹999</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-neutral-400">
          <span className="text-neutral-300 text-[11px]">📞 Helpline: +91 98765 43210</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-neutral-700 hover:text-black lg:hidden rounded-lg hover:bg-neutral-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo */}
            <button
              type="button"
              onClick={() => onNavigate('/home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 bg-black text-white flex items-center justify-center rounded-lg font-black text-base shadow-sm group-hover:bg-neutral-800 transition-colors">
                FP
              </div>
              <div className="leading-tight">
                <span className="font-black text-lg tracking-tight text-neutral-950 font-serif block">
                  FASHION POINT
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-sans block">
                  CLOTHING STORE
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Categories */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-neutral-700">
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => onNavigate(link.path)}
                className={`transition-colors hover:text-black py-1 border-b-2 ${
                  currentPath === link.path
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Search, Wishlist, Cart, Account Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Bar - Desktop */}
            <div className="relative hidden md:block w-56 lg:w-64">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shirts, jeans, kurtas..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 border border-transparent rounded-full focus:bg-white focus:border-neutral-300 focus:outline-hidden transition-all"
                />
              </form>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-neutral-100">
                  {searchResults.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        onNavigate(`/product-details?id=${prod.id}`);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-8 h-10 object-cover rounded bg-neutral-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">{prod.name}</p>
                        <p className="text-[10px] text-neutral-500">{prod.category} • ₹{prod.price}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-2 text-center text-xs font-bold text-neutral-900 bg-neutral-50 hover:bg-neutral-100"
                  >
                    View all matching products →
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-neutral-700 hover:text-black md:hidden rounded-full hover:bg-neutral-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => onNavigate('/wishlist')}
              className="relative p-2 text-neutral-700 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white font-mono text-[10px] font-black rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 text-neutral-700 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white font-mono text-[10px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Link */}
            <button
              type="button"
              onClick={() => onNavigate('/account')}
              className="p-2 text-neutral-700 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="My Account"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchOpen && (
          <div className="py-2.5 px-2 border-t border-neutral-100 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shirts, jeans, kurtas..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-100 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/home');
              }}
              className="p-2.5 text-left rounded-lg bg-neutral-50 hover:bg-neutral-100"
            >
              🏠 Home
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/products?category=Men');
              }}
              className="p-2.5 text-left rounded-lg bg-neutral-50 hover:bg-neutral-100"
            >
              👔 Men's Wear
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/products?category=Women');
              }}
              className="p-2.5 text-left rounded-lg bg-neutral-50 hover:bg-neutral-100"
            >
              👗 Women's Wear
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/products?category=Kids');
              }}
              className="p-2.5 text-left rounded-lg bg-neutral-50 hover:bg-neutral-100"
            >
              🧒 Kids Collection
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/order-tracking');
              }}
              className="p-2.5 text-left rounded-lg bg-neutral-50 hover:bg-neutral-100"
            >
              📦 Track My Order
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
