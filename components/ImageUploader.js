// components/ImageUploader.js
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ImageUploader({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e) => {
    try {
      setErrorMsg("");
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        setErrorMsg("Erreur upload image");
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (onUpload) {
        onUpload(publicUrl);
      }

      setUploading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur inattendue pendant l'upload");
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Upload en cours...</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}
