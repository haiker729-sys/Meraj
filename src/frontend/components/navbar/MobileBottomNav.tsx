import React from 'react';
import { Home, Compass, Grid, Truck, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 lg:hidden shadow-lg">
      <nav className="grid grid-cols-5 h-16 items-center">
        {/* Home */}
        <button
          type="button"
          onClick={() => onNavigate('/home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath === '/home' || currentPath === '/' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Shop All Garments */}
        <button
          type="button"
          onClick={() => onNavigate('/products')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath.startsWith('/products') ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Shop</span>
        </button>

        {/* Categories */}
        <button
          type="button"
          onClick={() => onNavigate('/categories')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath === '/categories' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Categories</span>
        </button>

        {/* Track Order */}
        <button
          type="button"
          onClick={() => onNavigate('/order-tracking')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath.startsWith('/order-tracking') ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Track Order</span>
        </button>

        {/* Account */}
        <button
          type="button"
          onClick={() => onNavigate('/account')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath === '/account' || currentPath === '/login' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Account</span>
        </button>
      </nav>
    </div>
  );
};

