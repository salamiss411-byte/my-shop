// components/Reviews.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (!error) setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!productId) return;
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author || !comment) return;

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      author,
      rating,
      comment,
    });

    if (!error) {
      setAuthor("");
      setRating(5);
      setComment("");
      fetchReviews();
    } else {
      console.error(error);
    }
  };

  const renderStars = (n) => (
    <span className="review-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < n ? "★" : "☆"}</span>
      ))}
    </span>
  );

  return (
    <div className="reviews">
      <h2>Avis</h2>
      {loading ? (
        <p>Chargement des avis...</p>
      ) : reviews.length === 0 ? (
        <p>Soyez le premier à laisser un avis.</p>
      ) : (
        <ul className="reviews-list">
          {reviews.map((r) => (
            <li key={r.id} className="review-item">
              <div className="review-header">
                <strong>{r.author}</strong>
                {renderStars(r.rating)}
              </div>
              <p>{r.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        <h3>Laisser un avis</h3>
        <input
          type="text"
          placeholder="Votre nom"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>5 ⭐⭐⭐⭐⭐</option>
          <option value={4}>4 ⭐⭐⭐⭐</option>
          <option value={3}>3 ⭐⭐⭐</option>
          <option value={2}>2 ⭐⭐</option>
          <option value={1}>1 ⭐</option>
        </select>
        <textarea
          placeholder="Votre commentaire"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <button type="submit">Envoyer l'avis</button>
      </form>
    </div>
  );
}
