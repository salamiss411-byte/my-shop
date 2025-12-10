// pages/admin/edit/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import ImageUploader from "../../../components/ImageUploader";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState("vêtements");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const checkAdminAndLoad = async () => {
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

      if (!id) return;

      setLoading(true);

      // charger produit
      const { data: prod, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !prod) {
        console.error(error);
        setLoading(false);
        return;
      }

      setProduct(prod);
      setName(prod.name);
      setPrice(prod.price);
      setStock(prod.stock ?? 0);
      setCategory(prod.category || "vêtements");
      setDescription(prod.description || "");
      setMainImage(prod.main_image_url || "");

      // charger images supplémentaires
      const { data: extraImages, error: imgError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", prod.id)
        .order("sort_order", { ascending: true });

      if (!imgError) {
        setImages(extraImages);
      }

      setLoading(false);
    };

    checkAdminAndLoad();
  }, [id, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!product) return;

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        stock,
        category,
        description,
        main_image_url: mainImage,
      })
      .eq("id", product.id);

    if (!error) {
      alert("Produit mis à jour");
      router.push("/admin");
    } else {
      console.error(error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleAddExtraImage = async (url) => {
    if (!product) return;

    const { error } = await supabase.from("product_images").insert({
      product_id: product.id,
      image_url: url,
      sort_order: images.length,
    });

    if (!error) {
      const { data: extraImages } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true });
      setImages(extraImages || []);
    }
  };

  const handleDeleteExtraImage = async (imgId) => {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imgId);

    if (!error) {
      setImages((prev) => prev.filter((i) => i.id !== imgId));
    }
  };

  if (!userChecked) return <p>Vérification de l'accès...</p>;
  if (!isAdmin) return null;
  if (loading) return <p>Chargement du produit...</p>;
  if (!product) return <p>Produit introuvable.</p>;

  return (
    <div>
      <h1>Modifier le produit</h1>
      <p>
        <Link href="/admin">← Retour admin produits</Link>
      </p>

      <form onSubmit={handleSave} className="admin-form">
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
          placeholder="URL image principale"
          value={mainImage}
          onChange={(e) => setMainImage(e.target.value)}
        />

        <p>Ou uploader une nouvelle image principale :</p>
        <ImageUploader onUpload={(url) => setMainImage(url)} />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <button type="submit">Enregistrer</button>
      </form>

      <h2>Images supplémentaires</h2>
      {images.length === 0 ? (
        <p>Aucune image supplémentaire.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {images.map((img) => (
            <li
              key={img.id}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <img
                src={img.image_url}
                alt=""
                style={{ width: 80, height: 80, objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => handleDeleteExtraImage(img.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}

      <p>Ajouter une image supplémentaire :</p>
      <ImageUploader onUpload={handleAddExtraImage} />
    </div>
  );
}
