// pages/_app.js
import "../styles/globals.css";
import { CartProvider } from "../context/CartContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

function MyApp({ Component, pageProps }) {
    const [theme, setTheme] = useState("light");
    const [user, setUser] = useState(null);

    // Thème light/dark
    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem("theme");
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        document.body.dataset.theme = theme;
        window.localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"));

    // Session Supabase (client connecté ou non)
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data?.user ?? null);
        };
        loadUser();

        const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            sub.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <CartProvider>
            <div className={`app ${theme}`}>
                <header className="header">
                    <nav className="nav">
                        <Link href="/">Boutique</Link>
                        <Link href="/cart">Panier</Link>
                        {user && <Link href="/my-orders">Mes commandes</Link>}
                        <Link href="/admin">Admin</Link>
                    </nav>

                    <div className="header-right">
                        {user ? (
                            <>
                                <span className="user-email">{user.email}</span>
                                <button className="link-button" onClick={handleLogout}>
                                    Se déconnecter
                                </button>
                            </>
                        ) : (
                            <Link href="/auth/login" className="link-button">
                                Se connecter
                            </Link>
                        )}

                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === "light" ? "🌙" : "☀️"}
                        </button>
                    </div>
                </header>

                <main className="main">
                    <Component {...pageProps} />
                </main>
            </div>
        </CartProvider>
    );
}

export default MyApp;
