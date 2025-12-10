// pages/product/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabaseClient";
import Reviews from "../../components/Reviews";

export default function ProductPage() {
    const router = useRouter();
    const { id } = router.query;
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImage, setCurrentImage] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            const { data: prod, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !prod) {
                console.error(error);
                return;
            }

            setProduct(prod);

            const { data: imgs } = await supabase
                .from("product_images")
                .select("*")
                .eq("product_id", prod.id)
                .order("sort_order", { ascending: true });

            const list =
                imgs && imgs.length > 0
                    ? imgs.map((i) => i.image_url)
                    : [prod.main_image_url || "/images/default-product.png"];

            setImages(list);
            setCurrentImage(list[0]);
        };

        fetchProduct();
    }, [id]);

    if (!product) return <p>Produit introuvable.</p>;

    const fullTitle = `${product.name} - Ma Boutique Pokémon`;

    return (
        <>
            <Head>
                <title>{fullTitle}</title>
                <meta name="description" content={product.description || ""} />
                <meta property="og:title" content={fullTitle} />
                <meta
                    property="og:description"
                    content={product.description || ""}
                />
                {currentImage && (
                    <meta property="og:image" content={currentImage} />
                )}
            </Head>

            <div>
                <Link href="/">← Retour à la boutique</Link>
                <div className="product-detail">
                    <div>
                        {currentImage && (
                            <img
                                src={currentImage}
                                alt={product.name}
                                className="product-detail-image"
                            />
                        )}

                        {images.length > 1 && (
                            <div className="thumbnail-row">
                                {images.map((img) => (
                                    <img
                                        key={img}
                                        src={img}
                                        alt={product.name}
                                        className={`thumbnail ${
                                            img === currentImage ? "thumbnail-active" : ""
                                        }`}
                                        onClick={() => setCurrentImage(img)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-detail-info">
                        <h1>{product.name}</h1>
                        <p className="product-price">
                            {Number(product.price).toFixed(2)} €
                        </p>
                        <p>{product.description}</p>
                        <button onClick={() => addToCart(product)}>
                            Ajouter au panier
                        </button>

                        <Reviews productId={product.id} />
                    </div>
                </div>
            </div>
        </>
    );
}
