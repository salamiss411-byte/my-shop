// pages/my-orders.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (!user) {
                window.location.href = "/auth/login";
                return;
            }

            const { data: myOrders, error } = await supabase
                .from("orders")
                .select("*")
                .eq("email", user.email)
                .order("created_at", { ascending: false });

            if (error) {
                console.error(error);
                setOrders([]);
            } else {
                setOrders(myOrders || []);
            }
            setLoading(false);
        };

        load();
    }, []);

    if (loading) return <p>Chargement...</p>;

    return (
        <div>
            <h1>Mes commandes</h1>
            {orders.length === 0 ? (
                <p>Vous n'avez pas encore passé de commande.</p>
            ) : (
                <ul>
                    {orders.map((o) => (
                        <li key={o.id}>
                            {new Date(o.created_at).toLocaleString()} —{" "}
                            {Number(o.total).toFixed(2)} € — {o.status}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
