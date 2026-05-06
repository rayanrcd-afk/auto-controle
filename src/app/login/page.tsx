"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, getUserProfile } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const isAdmin = username.trim().toLowerCase() === "admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      const user = auth.currentUser;
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
      toast.success("Connexion réussie !");
    } catch {
      toast.error("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏗️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SteelPose Armatures</h1>
          <p className="text-blue-200 text-sm mt-1">Contrôle qualité chantier</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-primary mb-1">Connexion</h2>
          <p className="text-gray-400 text-xs mb-5">
            {isAdmin ? "Accès administrateur"
              : "Entrez votre prénom et nom, puis votre date de naissance"}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{isAdmin ? "Identifiant" : "Prénom et Nom"}</label>
              <input className="input" value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={isAdmin ? "admin" : "Ex : Jean Dupont"}
                autoCapitalize="words" autoComplete="off" required />
            </div>
            <div>
              <label className="label">{isAdmin ? "Mot de passe" : "Date de naissance"}</label>
              <div className="relative">
                <input className="input pr-12"
                  type={showPass ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={isAdmin ? "••••••••" : "Ex : 15031990"} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {!isAdmin && (
                <p className="text-xs text-gray-400 mt-1">Format : JJMMAAAA — ex: 15031990</p>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>
        </div>
        <p className="text-center text-blue-200 text-xs mt-6">
          Problème de connexion ? Contactez votre chef de chantier.
        </p>
      </div>
    </div>
  );
}