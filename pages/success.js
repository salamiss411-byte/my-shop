import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Success() {
    const router = useRouter();
    const { session_id } = router.query;

    const [status, setStatus] = useState("saving");

    useEffect(() => {
        const saveOrder = async () => {
            if (!session_id) return;

            const raw = window.localStorage.getItem("lastOrder");
            if (!raw) {
                setStatus("error");
                return;
            }

            const order = JSON.parse(raw);

            // 1. On sauvegarde la commande dans Supabase
            const { data: newOrder, error } = await supabase
                .from("orders")
                .insert({
                    stripe_session_id: session_id,
                    total: order.total,
                    status: "paid",
                })
                .select()
                .single();

            if (error || !newOrder) {
                console.error(error);
                setStatus("error");
                return;
            }

            // 2. On ajoute les items
            const itemsToInsert = order.items.map((i) => ({
                order_id: newOrder.id,
                product_id: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
            }));

            await supabase.from("order_items").insert(itemsToInsert);

            window.localStorage.removeItem("lastOrder");

            setStatus("done");
        };

        saveOrder();
    }, [session_id]);

    return (
        <div>
            <h1>Paiement réussi 🎉</h1>

            {status === "saving" && <p>Enregistrement de votre commande...</p>}
            {status === "done" && <p>Votre commande a été enregistrée !</p>}
            {status === "error" && (
                <p>Erreur lors de l’enregistrement de la commande.</p>
            )}

            <Link href="/">Retour à la boutique</Link>
        </div>
    );
}
