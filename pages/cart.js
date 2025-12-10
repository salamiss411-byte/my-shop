// pages/cart.js
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartPage() {
    const { cartItems, removeFromCart, clearCart, total } = useCart();

    const handleCheckout = async () => {
        try {
            // On sauvegarde la commande dans localStorage pour after-success
            if (typeof window !== "undefined") {
                window.localStorage.setItem(
                    "lastOrder",
                    JSON.stringify({
                        items: cartItems.map((item) => ({
                            id: item.product.id,
                            name: item.product.name,
                            price: Number(item.product.price),
                            quantity: item.quantity,
                        })),
                        total,
                    })
                );
            }

            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cartItems.map((item) => ({
                        id: item.product.id,
                        name: item.product.name,
                        price: Number(item.product.price),
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await res.json();
            window.location.href = data.url;

        } catch (e) {
            console.error(e);
            alert("Erreur réseau Stripe.");
        }
    };


    return (
        <div>
            <h1>Votre panier</h1>

            {cartItems.length === 0 ? (
                <p>
                    Votre panier est vide. <Link href="/">Retour à la boutique</Link>
                </p>
            ) : (
                <div>
                    <ul className="cart-list">
                        {cartItems.map((item) => (
                            <li key={item.product.id} className="cart-item">
                                <div>
                                    <strong>{item.product.name}</strong> (x{item.quantity})
                                </div>
                                <div>
                                    {(Number(item.product.price) * item.quantity).toFixed(2)} €
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="remove-btn"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <h2>Total : {total.toFixed(2)} €</h2>

                    <button onClick={clearCart}>Vider le panier</button>
                    <button onClick={handleCheckout} style={{ marginLeft: "1rem" }}>
                        Passer au paiement
                    </button>
                </div>
            )}
        </div>
    );
}
