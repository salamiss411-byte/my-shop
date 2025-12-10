// pages/auth/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error(error);
            setErrorMsg("Connexion échouée. Vérifiez vos identifiants.");
        } else {
            router.push("/");
        }
    };

    return (
        <div className="auth-container">
            <h1>Connexion</h1>
            <form onSubmit={handleLogin} className="auth-form">
                <input
                    type="email"
                    placeholder="Votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Se connecter</button>
            </form>
            {errorMsg && <p className="auth-error">{errorMsg}</p>}
            <p>
                Pas encore de compte ?{" "}
                <a href="/auth/signup">Créer un compte</a>
            </p>
        </div>
    );
}
