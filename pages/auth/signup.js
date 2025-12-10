// pages/auth/signup.js
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [infoMsg, setInfoMsg] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setInfoMsg("");

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error(error);
            setErrorMsg(error.message);
        } else {
            setInfoMsg(
                "Compte créé ! Vérifiez vos emails pour confirmer puis connectez-vous."
            );
            setTimeout(() => router.push("/auth/login"), 2000);
        }
    };

    return (
        <div className="auth-container">
            <h1>Créer un compte</h1>
            <form onSubmit={handleSignup} className="auth-form">
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
                <button type="submit">Créer mon compte</button>
            </form>
            {errorMsg && <p className="auth-error">{errorMsg}</p>}
            {infoMsg && <p className="auth-success">{infoMsg}</p>}
            <p>
                Déjà un compte ? <a href="/auth/login">Se connecter</a>
            </p>
        </div>
    );
}
