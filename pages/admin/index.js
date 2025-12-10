// pages/admin/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function AdminPage() {
    const router = useRouter();
    const [userChecked, setUserChecked] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [products, setProducts] = useState([]);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState(0);
    const [category, setCategory] = useState("vêtements");
    const [description, setDescription] = useState("");
    const [mainImage, setMainImage] = useState("");

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: auth } = await supabase.auth.getUser();
            if (!auth.user) {
                router.push("/admin/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", auth.user.id)
                .single();

            if (!profile || !profile.is_admin) {
                router.push("/");
                return;
            }

            setIsAdmin(true);
            setUserChecked(true);
            fetchProducts();
        };

        checkAdmin();
    }, [router]);

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) setProducts(data);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!name || !price || !mainImage) return;

        const { error } = await supabase.from("products").insert({
            name,
            price,
            stock,
            category,
            description,
            main_image_url: mainImage,
            active: true,
        });

        if (!error) {
            setName("");
            setPrice("");
            setStock(0);
            setCategory("vêtements");
            setDescription("");
            setMainImage("");
            fetchProducts();
        } else {
            console.error(error);
        }
    };

    const toggleActive = async (id, current) => {
        const { error } = await supabase
            .from("products")
            .update({ active: !current })
            .eq("id", id);

        if (!error) {
            fetchProducts();
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Supprimer ce produit ?")) return;

        const { error } = await supabase.from("products").delete().eq("id", id);
        if (!error) {
            fetchProducts();
        } else {
            console.error(error);
        }
    };

    if (!userChecked) return <p>Vérification de l'accès...</p>;
    if (!isAdmin) return null;

    return (
        <div>
            <h1>Admin – Produits</h1>

            <p>
                <Link href="/admin/orders">📦 Voir les commandes</Link>
            </p>

            <form onSubmit={handleAddProduct} className="admin-form">
                <input
                    type="text"
                    placeholder="Nom du produit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="number"
                    step="0.01"
                    placeholder="Prix (€)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Stock"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                />

                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="vêtements">Vêtements</option>
                    <option value="cartes">Cartes</option>
                    <option value="accessoires">Accessoires</option>
                </select>

                <input
                    type="text"
                    placeholder="URL image principale (ex: /images/pikachu-tshirt-1.jpg)"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />

                <button type="submit">Ajouter le produit</button>
            </form>

            <h2>Produits existants ({products.length})</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {products.map((p) => (
                    <li
                        key={p.id}
                        style={{
                            marginBottom: "0.75rem",
                            padding: "0.6rem 0.8rem",
                            borderRadius: "0.5rem",
                            background: "white",
                        }}
                    >
                        <div>
                            <strong>{p.name}</strong> – {Number(p.price).toFixed(2)} € – Stock :{" "}
                            {p.stock ?? 0} – ({p.category}){" "}
                            {!p.active && <span style={{ color: "red" }}>[inactif]</span>}
                        </div>
                        <div style={{ marginTop: "0.3rem", display: "flex", gap: "0.5rem" }}>
                            <Link
                                href={`/admin/edit/${p.id}`}
                                style={{
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "0.4rem",
                                    background: "#2563eb",
                                    color: "white",
                                    textDecoration: "none",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Modifier
                            </Link>
                            <button
                                type="button"
                                onClick={() => toggleActive(p.id, p.active)}
                                style={{
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "0.4rem",
                                    background: p.active ? "#6b7280" : "#16a34a",
                                    fontSize: "0.9rem",
                                }}
                            >
                                {p.active ? "Désactiver" : "Activer"}
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteProduct(p.id)}
                                style={{
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "0.4rem",
                                    background: "#dc2626",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Supprimer
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
