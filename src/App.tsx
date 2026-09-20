import React, { useState, useEffect } from 'react';
import { cartManager } from './utils/cartManager';
import { apiClient } from './api/client';
import { CartItem, Product } from './types';

// Frontend Components
import { Navbar } from './frontend/components/navbar/Navbar';
import { MobileBottomNav } from './frontend/components/navbar/MobileBottomNav';
import { Footer } from './frontend/components/footer/Footer';
import { CartDrawer } from './frontend/components/cart/CartDrawer';

// Frontend Pages
import { HomePage } from './frontend/pages/home/HomePage';
import { ProductsPage } from './frontend/pages/products/ProductsPage';
import { ProductDetailsPage } from './frontend/pages/product-details/ProductDetailsPage';
import { CategoriesPage } from './frontend/pages/categories/CategoriesPage';
import { CartPage } from './frontend/pages/cart/CartPage';
import { CheckoutPage } from './frontend/pages/checkout/CheckoutPage';
import { OrderSuccessPage } from './frontend/pages/order-success/OrderSuccessPage';
import { OrderTrackingPage } from './frontend/pages/order-tracking/OrderTrackingPage';
import { WishlistPage } from './frontend/pages/wishlist/WishlistPage';
import { AccountPage } from './frontend/pages/account/AccountPage';
import { LoginPage } from './frontend/pages/login/LoginPage';
import { StaticPage } from './frontend/pages/static/StaticPages';

// Admin Panel
import { AdminLayout } from './admin/AdminLayout';
import { AdminLoginPage } from './admin/pages/login/AdminLoginPage';
import { AdminUser } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/home');
  const [cartItems, setCartItems] = useState<CartItem[]>(cartManager.getCart());
  const [wishlistIds, setWishlistIds] = useState<string[]>(cartManager.getWishlist());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminUser | null>(apiClient.adminAuth.getStoredSession());

  // Subscribe to cart and wishlist updates
  useEffect(() => {
    const unsub = cartManager.subscribe(() => {
      setCartItems(cartManager.getCart());
      setWishlistIds(cartManager.getWishlist());
    });
    return unsub;
  }, []);

  // Listen for hash change or direct URL routing for #admin or /admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setIsAdminMode(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Global hotkey: Ctrl+Shift+A or Cmd+Shift+A opens Admin Portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminMode(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle navigation
  const handleNavigate = (path: string) => {
    if (path === '/admin') {
      setIsAdminMode(true);
      window.scrollTo(0, 0);
      return;
    }

    setIsAdminMode(false);
    setCurrentPath(path);
    setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId: string) => {
    handleNavigate(`/product/${productId}`);
  };

  const handleAdminLogout = () => {
    apiClient.adminAuth.logout();
    setAdminSession(null);
    setIsAdminMode(false);
    setCurrentPath('/home');
  };

  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Admin View takes over the full layout with authentication protection
  if (isAdminMode) {
    if (!adminSession) {
      return (
        <AdminLoginPage
          onLoginSuccess={(admin) => {
            setAdminSession(admin);
            setIsAdminMode(true);
          }}
          onBackToStore={() => {
            setIsAdminMode(false);
            setCurrentPath('/home');
          }}
        />
      );
    }

    return (
      <AdminLayout
        currentAdmin={adminSession}
        onLogout={handleAdminLogout}
        onExitAdmin={() => {
          setIsAdminMode(false);
          setCurrentPath('/home');
        }}
      />
    );
  }

  // Parse path and query/params
  const renderCurrentPage = () => {
    if (currentPath.startsWith('/product/')) {
      const productId = currentPath.replace('/product/', '');
      return (
        <ProductDetailsPage
          productId={productId}
          onNavigate={handleNavigate}
          onOpenCart={() => setIsCartOpen(true)}
        />
      );
    }

    if (currentPath.startsWith('/order-success/')) {
      const orderId = currentPath.replace('/order-success/', '');
      return <OrderSuccessPage orderId={orderId} onNavigate={handleNavigate} />;
    }

    switch (currentPath) {
      case '/home':
      case '/':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onProductClick={handleProductClick}
          />
        );

      case '/products':
        return (
          <ProductsPage
            onNavigate={handleNavigate}
            onProductClick={handleProductClick}
          />
        );

      case '/categories':
        return <CategoriesPage onNavigate={handleNavigate} />;

      case '/cart':
        return <CartPage cartItems={cartItems} onNavigate={handleNavigate} />;

      case '/checkout':
        return (
          <CheckoutPage
            cartItems={cartItems}
            onNavigate={handleNavigate}
            onOrderPlaced={(orderId: string) => handleNavigate(`/order-success/${orderId}`)}
          />
        );

      case '/order-tracking':
        return <OrderTrackingPage onNavigate={handleNavigate} />;

      case '/wishlist':
        return (
          <WishlistPage
            onNavigate={handleNavigate}
            onProductClick={handleProductClick}
          />
        );

      case '/account':
        return <AccountPage onNavigate={handleNavigate} />;

      case '/login':
        return <LoginPage onNavigate={handleNavigate} />;

      case '/about':
        return <StaticPage pageType="about" onNavigate={handleNavigate} />;

      case '/contact':
        return <StaticPage pageType="contact" onNavigate={handleNavigate} />;

      case '/return-policy':
        return <StaticPage pageType="return-policy" onNavigate={handleNavigate} />;

      case '/privacy-policy':
        return <StaticPage pageType="privacy-policy" onNavigate={handleNavigate} />;

      case '/terms':
        return <StaticPage pageType="terms" onNavigate={handleNavigate} />;

      case '/shipping-policy':
        return <StaticPage pageType="shipping-policy" onNavigate={handleNavigate} />;

      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onProductClick={handleProductClick}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-neutral-900 antialiased selection:bg-black selection:text-white">
      {/* Top Store Header */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        cartCount={cartTotalItems}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Page Area */}
      <main className="flex-1 pb-16 md:pb-0">{renderCurrentPage()}</main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Bar */}
      <MobileBottomNav
        currentPath={currentPath}
        onNavigate={handleNavigate}
        cartCount={cartTotalItems}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Slide-in Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
