// context/CartContext.js
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // Charger depuis localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem("cart");
        if (saved) {
            try {
                setCartItems(JSON.parse(saved));
            } catch {
                setCartItems([]);
            }
        }
    }, []);

    // Sauvegarder à chaque changement
    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((i) => i.product.id !== id));
    };

    const clearCart = () => setCartItems([]);

    const total = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, removeFromCart, clearCart, total }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
