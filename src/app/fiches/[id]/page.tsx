"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FicheControle } from "@/lib/types";
import { validerFiche } from "@/lib/fiches";
import { generatePDF } from "@/lib/pdf";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import StatutBadge from "@/components/StatutBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

export default function DetailFichePage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const router = useRouter();
  const [fiche, setFiche] = useState<FicheControle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "fiches", id)).then(snap => {
      if (snap.exists()) setFiche({ id: snap.id, ...snap.data() } as FicheControle);
    });
  }, [id]);

  async function handleValider(valide: boolean) {
    if (!fiche?.id) return;
    setLoading(true);
    await validerFiche(fiche.id, valide);
    toast.success(valide ? "Fiche validée ✓" : "Fiche refusée");
    router.push("/fiches");
  }

  if (!fiche) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    </Layout>
  );

  const dateStr = format(new Date(fiche.date), "dd MMMM yyyy", { locale: fr });

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-primary font-bold text-sm">← Retour</button>
          <button onClick={() => generatePDF(fiche)}
            className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl">
            📄 Export PDF
          </button>
        </div>

        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-lg font-bold text-primary">{fiche.chantierNom}</h1>
            <StatutBadge statut={fiche.statut} />
          </div>
          {[
            ["📅 Date", dateStr],
            ["🗺️ Plan N°", fiche.planNumero],
            ["🏢 Niveau", fiche.niveau],
            ["📍 Localisation", fiche.localisation],
            ["👷 Ouvrier", fiche.ouvrierNom],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="font-bold text-primary mb-3">✅ Points de contrôle</h2>
          {fiche.points.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium">{p.libelle}</p>
                {p.observation && <p className="text-xs text-gray-400">{p.observation}</p>}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full
                ${p.resultat === "bon" ? "bg-green-100 text-green-700"
                  : p.resultat === "mauvais" ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-400"}`}>
                {p.resultat === "bon" ? "✓ Bon" : p.resultat === "mauvais" ? "✗ Mauvais" : "— N/V"}
              </span>
            </div>
          ))}
        </div>

        {fiche.pointArretRefuse && (
          <div className="card border border-red-200 bg-red-50">
            <h2 className="font-bold text-red-600 mb-2">⛔ Point d'arrêt refusé</h2>
            <p className="text-sm"><span className="font-semibold">Cause :</span> {fiche.causeRefus}</p>
            <p className="text-sm mt-1"><span className="font-semibold">Solutions :</span> {fiche.solutions}</p>
          </div>
        )}

        {fiche.photosUrls.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-primary mb-3">📸 Photos ({fiche.photosUrls.length})</h2>
            <div className="grid grid-cols-2 gap-2">
              {fiche.photosUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="" className="rounded-xl w-full h-36 object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {profile?.role === "chef" && fiche.statut === "soumis" && (
          <div className="card border border-orange-200">
            <h2 className="font-bold text-gray-700 mb-3">Validation de la fiche</h2>
            <div className="flex gap-3">
              <button onClick={() => handleValider(false)} disabled={loading}
                className="flex-1 border-2 border-red-400 text-red-500 font-bold py-3 rounded-xl">
                ✗ Refuser
              </button>
              <button onClick={() => handleValider(true)} disabled={loading}
                className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl">
                ✓ Valider
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}