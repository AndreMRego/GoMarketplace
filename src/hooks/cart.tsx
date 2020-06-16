import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const existProductIndex = products.findIndex(p => p.id === product.id);

      const oldProducts = [...products];

      if (existProductIndex >= 0) {
        oldProducts[existProductIndex].quantity += 1;
        setProducts(oldProducts);
      } else {
        oldProducts.push({ ...product, quantity: 1 });
      }

      setProducts(oldProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(oldProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const existProductIndex = products.findIndex(p => p.id === id);

      if (existProductIndex >= 0) {
        const oldProducts = [...products];
        oldProducts[existProductIndex].quantity += 1;
        setProducts(oldProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(oldProducts),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const existProductIndex = products.findIndex(p => p.id === id);

      if (existProductIndex >= 0) {
        const oldProducts = [...products];
        if (oldProducts[existProductIndex].quantity === 1) {
          oldProducts.splice(existProductIndex, 1);
        } else {
          oldProducts[existProductIndex].quantity -= 1;
        }
        setProducts(oldProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(oldProducts),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
