import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface StoreState {
  // Navigation
  currentView: 'home' | 'catalog' | 'gallery' | 'checkout';
  setCurrentView: (view: StoreState['currentView']) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Product modal
  selectedProduct: any | null;
  setSelectedProduct: (product: any | null) => void;

  // Admin
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  adminView: 'products' | 'categories' | 'orders' | 'gallery' | 'appearance' | 'settings';
  setAdminView: (view: StoreState['adminView']) => void;

  // Settings
  settings: any;
  setSettings: (settings: any) => void;

  // Chat
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Navigation
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  // Cart
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    }),
  removeFromCart: (id) =>
    set((state) => ({ cart: state.cart.filter((c) => c.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((c) => c.id !== id)
          : state.cart.map((c) => (c.id === id ? { ...c, quantity } : c)),
    })),
  clearCart: () => set({ cart: [] }),
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),

  // Product modal
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  // Admin
  isAdmin: false,
  setIsAdmin: (admin) => set({ isAdmin: admin }),
  adminView: 'products',
  setAdminView: (view) => set({ adminView: view }),

  // Settings
  settings: {},
  setSettings: (settings) => set({ settings }),

  // Chat
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
}));