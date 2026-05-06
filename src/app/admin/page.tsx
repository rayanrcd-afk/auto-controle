"use client";
import { useState, useEffect } from "react";
import { createOuvrier } from "@/lib/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import Layout from "@/components/Layout";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [prenom,        setPrenom]        = useState("");
  const [nom,           setNom]           = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [loading,       setLoading]       = useState(false);
  const [ouvriers,      setOuvriers]      = useState<UserProfile[]>([]);
  const [showForm,      setShowForm]      = useState(false);

  async function loadOuvriers() {
    const snap = await getDocs(query(collection(db, "users"), orderBy("nom")));
    const all  = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    setOuvriers(all.filter(u => u.role === "ouvrier"));
  }

  useEffect(() => { loadOuvriers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (dateNaissance.length !== 8 || isNaN(Number(dateNaissance))) {
      toast.error("Date invalide. Format : JJMMAAAA"); return;
    }
    setLoading(true);
    try {
      await createOuvrier(prenom.trim(), nom.trim(), dateNaissance);
      toast.success(`✅ Compte créé pour ${prenom} ${nom} !`);
      setPrenom(""); setNom(""); setDateNaissance("");
      setShowForm(false);
      loadOuvriers();
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("Un compte existe déjà pour cet ouvrier.");
      } else {
        toast.error(err.message || "Erreur lors de la création.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">👥 Équipe</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl">
            {showForm ? "✕ Annuler" : "+ Ajouter"}
          </button>
        </div>

        {showForm && (
          <div className="card border border-primary/20">
            <h2 className="font-bold text-primary mb-4">Créer un compte ouvrier</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prénom</label>
                  <input className="input" value={prenom}
                    onChange={e => setPrenom(e.target.value)} required
                    placeholder="Jean" autoCapitalize="words" />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input className="input" value={nom}
                    onChange={e => setNom(e.target.value)} required
                    placeholder="Dupont" autoCapitalize="words" />
                </div>
              </div>
              <div>
                <label className="label">Date de naissance (= mot de passe)</label>
                <input className="input font-mono" value={dateNaissance}
                  onChange={e => setDateNaissance(e.target.value)}
                  placeholder="JJMMAAAA — ex: 15031990"
                  maxLength={8} required inputMode="numeric" />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Création..." : "✅ Créer le compte"}
              </button>
            </form>
          </div>
        )}

        <div className="card bg-blue-50 border border-blue-200">
          <p className="font-bold text-primary text-sm mb-2">📱 Comment partager l'accès</p>
          <p className="text-xs text-gray-600">
            Envoyez à vos ouvriers par WhatsApp :<br/>
            <span className="font-semibold">1.</span> L'URL du site<br/>
            <span className="font-semibold">2.</span> Identifiant = Prénom Nom<br/>
            <span className="font-semibold">3.</span> Mot de passe = date de naissance (JJMMAAAA)
          </p>
        </div>

        <h2 className="font-bold text-primary">Ouvriers inscrits ({ouvriers.length})</h2>

        {ouvriers.length === 0 && (
          <div className="card text-center text-gray-400 py-8">
            <p className="text-3xl mb-2">👷</p>
            <p>Aucun ouvrier enregistré.</p>
          </div>
        )}

        {ouvriers.map(u => (
          <div key={u.uid} className="card flex items-center justify-between">
            <div>
              <p className="font-bold">{u.prenom} {u.nom}</p>
              <p className="text-xs text-gray-400">
                🔑 <span className="font-mono">{u.prenom} {u.nom}</span>
              </p>
            </div>
            <button onClick={() => {
                navigator.clipboard?.writeText(
                  `Accès SteelPose Armatures\nIdentifiant : ${u.prenom} ${u.nom}\nMot de passe : votre date de naissance (JJMMAAAA)`
                );
                toast.success("Infos copiées !");
              }}
              className="text-xs bg-primary text-white px-3 py-2 rounded-xl">
              📋 Copier
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}