import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Product } from '../types/Product';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface PersistedCart {
  items: CartItem[];
}

interface CartDbRow {
  product_id: string;
  quantity: number;
  selected_size: string;
  products: Product | null;
}

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; size: string; quantity: number } }
  | { type: 'SET_ITEMS'; payload: { items: CartItem[] } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_PREFIX = 'thriftstore-cart';

const getCartStorageKey = (user: User | null) => `${CART_STORAGE_PREFIX}:${user?.id || 'guest'}`;

const calculateTotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const safeParseCart = (value: string | null): CartItem[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as PersistedCart | CartItem[];
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const buildCartKey = (id: string, size = '') => `${id}::${size}`;

const mergeCartItems = (primaryItems: CartItem[], secondaryItems: CartItem[]) => {
  const map = new Map<string, CartItem>();

  primaryItems.forEach((item) => {
    map.set(buildCartKey(item.id, item.selectedSize ?? ''), { ...item });
  });

  secondaryItems.forEach((item) => {
    const key = buildCartKey(item.id, item.selectedSize ?? '');
    const existing = map.get(key);
    if (existing) {
      map.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      map.set(key, { ...item });
    }
  });

  return Array.from(map.values());
};

const mapDbRowsToCartItems = (rows: CartDbRow[]) =>
  rows
    .filter((row) => row.products)
    .map((row) => ({
      ...(row.products as Product),
      quantity: row.quantity,
      selectedSize: row.selected_size,
    }));

const showLoginRequiredToast = () => {
  toast.custom((t) => (
    <div className="max-w-sm rounded-xl border border-slate-200 bg-white shadow-lg p-4">
      <p className="text-sm font-medium text-slate-900 mb-2">Please login to add items to cart.</p>
      <button
        type="button"
        onClick={() => {
          toast.dismiss(t.id);
          const isHashRoute = window.location.hash.startsWith('#/');
          const currentPath = isHashRoute
            ? window.location.hash.replace(/^#/, '')
            : window.location.pathname + window.location.search;
          const redirectTo = encodeURIComponent(currentPath || '/');
          const loginUrl = isHashRoute
            ? `${window.location.pathname}#/login?redirect=${redirectTo}`
            : `/login?redirect=${redirectTo}`;
          window.location.href = loginUrl;
        }}
        className="text-sm font-semibold text-amber-700 hover:text-amber-800"
      >
        Click here to login
      </button>
    </div>
  ));
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const normalizedSize = product.selectedSize ?? '';
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === product.id && (item.selectedSize ?? '') === normalizedSize
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...product, selectedSize: normalizedSize, quantity }];
      }

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case 'REMOVE_ITEM': {
      const targetSize = action.payload.size ?? '';
      const newItems = state.items.filter(
        (item) => !(item.id === action.payload.id && (item.selectedSize ?? '') === targetSize)
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, size, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id, size } });
      }

      const normalizedSize = size ?? '';
      const newItems = state.items.map((item) =>
        item.id === id && (item.selectedSize ?? '') === normalizedSize
          ? { ...item, quantity }
          : item
      );

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case 'SET_ITEMS': {
      const items = action.payload.items;
      return {
        items,
        total: calculateTotal(items),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const hydrationCompleteRef = useRef(false);
  const currentStorageKeyRef = useRef(getCartStorageKey(user));
  const previousUserIdRef = useRef<string | null>(user?.id || null);

  useEffect(() => {
    const nextStorageKey = getCartStorageKey(user);
    const guestStorageKey = getCartStorageKey(null);
    const previousUserId = previousUserIdRef.current;
    previousUserIdRef.current = user?.id || null;
    currentStorageKeyRef.current = nextStorageKey;
    hydrationCompleteRef.current = false;
    let cancelled = false;

    const hydrateCart = async () => {
      if (!user) {
        localStorage.removeItem(guestStorageKey);
        if (!cancelled) {
          dispatch({ type: 'SET_ITEMS', payload: { items: [] } });
          hydrationCompleteRef.current = true;
        }
        return;
      }

      const guestItems = safeParseCart(localStorage.getItem(guestStorageKey));

      const { data: dbRows, error } = await supabase
        .from('cart_items')
        .select('product_id, quantity, selected_size, products(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to fetch user cart from backend:', error);
        const fallback = safeParseCart(localStorage.getItem(nextStorageKey));
        if (!cancelled) {
          dispatch({ type: 'SET_ITEMS', payload: { items: fallback } });
          hydrationCompleteRef.current = true;
        }
        return;
      }

      const backendItems = mapDbRowsToCartItems((dbRows || []) as unknown as CartDbRow[]);
      const merged = mergeCartItems(backendItems, guestItems);

      if (guestItems.length > 0) {
        const upsertRows = merged.map((item) => ({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity,
          selected_size: item.selectedSize || '',
        }));

        const { error: upsertError } = await supabase
          .from('cart_items')
          .upsert(upsertRows, { onConflict: 'user_id,product_id,selected_size' });

        if (upsertError) {
          console.error('Failed to merge guest cart into backend:', upsertError);
        } else {
          localStorage.removeItem(guestStorageKey);
        }
      }

      if (!cancelled) {
        dispatch({ type: 'SET_ITEMS', payload: { items: merged } });
        hydrationCompleteRef.current = true;
      }
    };

    void hydrateCart();

    return () => {
      cancelled = true;
      if (previousUserId === null && !user) {
        currentStorageKeyRef.current = guestStorageKey;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!hydrationCompleteRef.current) return;

    const payload = JSON.stringify({ items: state.items });
    localStorage.setItem(currentStorageKeyRef.current, payload);
  }, [state.items]);

  const stateValue = useMemo(() => state, [state]);

  const addItem = (product: Product, quantity = 1) => {
    if (!user) {
      showLoginRequiredToast();
      return;
    }

    const normalizedSize = product.selectedSize ?? '';
    const existing = state.items.find(
      (item) => item.id === product.id && (item.selectedSize ?? '') === normalizedSize
    );

    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });

    const newQuantity = (existing?.quantity || 0) + quantity;
    void (async () => {
      const { error } = await supabase.from('cart_items').upsert(
        {
          user_id: user.id,
          product_id: product.id,
          selected_size: normalizedSize,
          quantity: newQuantity,
        },
        { onConflict: 'user_id,product_id,selected_size' }
      );

      if (error) {
        console.error('Failed to persist cart add:', error);
      }
    })();
  };

  const removeItem = (id: string, size = '') => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size } });

    if (user) {
      void (async () => {
        const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('selected_size', size || '');

        if (error) {
          console.error('Failed to persist cart remove:', error);
        }
      })();
    }
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity } });

    if (user) {
      const normalizedSize = size ?? '';
      if (quantity <= 0) {
        void (async () => {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', id)
            .eq('selected_size', normalizedSize);

          if (error) {
            console.error('Failed to persist cart quantity removal:', error);
          }
        })();
      } else {
        void (async () => {
          const { error } = await supabase.from('cart_items').upsert(
            {
              user_id: user.id,
              product_id: id,
              selected_size: normalizedSize,
              quantity,
            },
            { onConflict: 'user_id,product_id,selected_size' }
          );

          if (error) {
            console.error('Failed to persist cart quantity update:', error);
          }
        })();
      }
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });

    if (user) {
      void (async () => {
        const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
        if (error) {
          console.error('Failed to persist cart clear:', error);
        }
      })();
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...stateValue,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};