import type { CartItem, Product, ThemeId } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Auth
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  userDisplayName: string;
  setUserDisplayName: (name: string) => void;
  userAvatarColor: string;
  setUserAvatarColor: (color: string) => void;
  userPrincipal: string;
  setUserPrincipal: (principal: string) => void;

  // Theme
  activeTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Active category filter
  activeCategory: string;
  setActiveCategory: (cat: string) => void;

  // Admin
  adminPassword: string | null;
  setAdminPassword: (pwd: string | null) => void;
}

/** Deterministic avatar color from any string */
export function deriveAvatarColor(seed: string): string {
  const colors = [
    "#E53E3E", // red
    "#DD6B20", // orange
    "#D69E2E", // yellow
    "#38A169", // green
    "#3182CE", // blue
    "#805AD5", // purple
    "#D53F8C", // pink
    "#00B5D8", // cyan
    "#2D3748", // dark
    "#B7791F", // amber
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart
      cartItems: [],
      addToCart: (product) => {
        const items = get().cartItems;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            cartItems: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          });
        } else {
          set({ cartItems: [...items, { product, quantity: 1 }] });
        }
      },
      removeFromCart: (productId) =>
        set({
          cartItems: get().cartItems.filter((i) => i.product.id !== productId),
        }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cartItems: get().cartItems.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        });
      },
      clearCart: () => set({ cartItems: [] }),
      cartTotal: () =>
        get().cartItems.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0,
        ),
      cartCount: () => get().cartItems.reduce((sum, i) => sum + i.quantity, 0),

      // Auth
      isLoggedIn: false,
      setLoggedIn: (val) => set({ isLoggedIn: val }),
      userDisplayName: "Gmail User",
      setUserDisplayName: (name) => set({ userDisplayName: name }),
      userAvatarColor: "#3182CE",
      setUserAvatarColor: (color) => set({ userAvatarColor: color }),
      userPrincipal: "",
      setUserPrincipal: (principal) => set({ userPrincipal: principal }),

      // Theme
      activeTheme: "blue",
      setTheme: (theme) => {
        set({ activeTheme: theme });
        document.documentElement.setAttribute("data-theme", theme);
      },

      // Search
      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Category
      activeCategory: "all",
      setActiveCategory: (cat) => set({ activeCategory: cat }),

      // Admin
      adminPassword: null,
      setAdminPassword: (pwd) => set({ adminPassword: pwd }),
    }),
    {
      name: "shopzone-store",
      partialize: (state) => ({
        cartItems: state.cartItems,
        activeTheme: state.activeTheme,
        adminPassword: state.adminPassword,
        userDisplayName: state.userDisplayName,
        userAvatarColor: state.userAvatarColor,
        userPrincipal: state.userPrincipal,
      }),
    },
  ),
);
