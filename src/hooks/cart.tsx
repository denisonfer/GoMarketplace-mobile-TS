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
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const produtos = await AsyncStorage.getItem('@GoMarketplace:produtos');

      if (produtos) {
        setProducts([...JSON.parse(produtos)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const estoque = products.find(produto => produto.id === product.id);

      if (estoque) {
        setProducts(
          products.map(p =>
            p.id === product.id
              ? {
                ...product,
                quantity: p.quantity + 1,
              }
              : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:produtos',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // INCREMENTS A PRODUCT QUANTITY IN THE CART
      const novoProduto = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );

      setProducts(novoProduto);

      await AsyncStorage.setItem(
        '@GoMarketplace:produtos',
        JSON.stringify(novoProduto),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // DECREMENTS A PRODUCT QUANTITY IN THE CART
      const novoProduto = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
      );

      setProducts(novoProduto);

      await AsyncStorage.setItem(
        '@GoMarketplace:produtos',
        JSON.stringify(novoProduto),
      );
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
