import { CartItem } from '../types';

const CART_KEY = 'fp_cart_items_v1';
const WISHLIST_KEY = 'fp_wishlist_ids_v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Listener error in cartManager:', e);
    }
  });
}

export const cartManager = {
  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToCart(item: CartItem): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(
      (c) =>
        c.productId === item.productId &&
        c.selectedSize === item.selectedSize &&
        c.selectedColor?.name === item.selectedColor?.name
    );
    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    notify();
  },

  updateQuantity(index: number, quantity: number): void {
    const cart = this.getCart();
    if (index >= 0 && index < cart.length) {
      if (quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      notify();
    }
  },

  removeFromCart(index: number): void {
    const cart = this.getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      notify();
    }
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
    notify();
  },

  getWishlist(): string[] {
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isInWishlist(id: string): boolean {
    return this.getWishlist().includes(id);
  },

  toggleWishlist(id: string): boolean {
    const wishlist = this.getWishlist();
    const idx = wishlist.indexOf(id);
    let added = false;
    if (idx > -1) {
      wishlist.splice(idx, 1);
    } else {
      wishlist.push(id);
      added = true;
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    notify();
    return added;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
