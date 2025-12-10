// pages/index.js
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        let query = supabase.from("products").select("*").eq("active", true);

        if (category !== "all") {
            query = query.eq("category", category);
        }

        if (search.trim() !== "") {
            query = query.ilike("name", `%${search}%`);
        }

        const { data, error } = await query;
        if (error) {
            console.error(error);
            setProducts([]);
        } else {
            let list = data || [];
            if (sortBy === "price_asc") {
                list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
            } else if (sortBy === "price_desc") {
                list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
            } else {
                list = [...list].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
            }
            setProducts(list);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, category, sortBy]);

    return (
        <>
            <Head>
                <title>Ma Boutique Pokémon</title>
                <meta
                    name="description"
                    content="Boutique Pokémon avec vêtements, accessoires et cartes à collectionner."
                />
                <meta property="og:title" content="Ma Boutique Pokémon" />
                <meta
                    property="og:description"
                    content="Découvre nos produits Pokémon : t-shirts, hoodies, casquettes et plus."
                />
            </Head>

            <div>
                <h1>Ma Boutique Pokémon</h1>

                <div className="filters">
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="all">Toutes catégories</option>
                        <option value="vêtements">Vêtements</option>
                        <option value="cartes">Cartes</option>
                        <option value="accessoires">Accessoires</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Plus récents</option>
                        <option value="price_asc">Prix croissant</option>
                        <option value="price_desc">Prix décroissant</option>
                    </select>
                </div>

                {loading ? (
                    <p>Chargement des produits...</p>
                ) : products.length === 0 ? (
                    <p>Aucun produit trouvé.</p>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => (
                            <article className="product-card" key={product.id}>
                                <img
                                    src={
                                        product.main_image_url || "/images/default-product.png"
                                    }
                                    alt={product.name}
                                    className="product-image"
                                />
                                <h2>{product.name}</h2>
                                <p className="product-price">
                                    {Number(product.price).toFixed(2)} €
                                </p>
                                <div className="product-actions">
                                    <Link href={`/product/${product.id}`}>
                                        Voir le produit
                                    </Link>
                                    <button onClick={() => addToCart(product)}>
                                        Ajouter au panier
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
