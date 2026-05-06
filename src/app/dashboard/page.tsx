"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeToutesFiches, subscribeFichesOuvrier } from "@/lib/fiches";
import { FicheControle } from "@/lib/types";
import Layout from "@/components/Layout";
import StatutBadge from "@/components/StatutBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const [fiches, setFiches] = useState<FicheControle[]>([]);
  const router = useRouter();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile) return;
    if (profile.role === "ADMIN") {
      return subscribeToutesFiches(setFiches);
    } else {
      return subscribeFichesOuvrier(user.uid, setFiches);
    }
  }, [user, profile]);

  const stats = {
    total:      fiches.length,
    valides:    fiches.filter(f => f.statut === "valide").length,
    enAttente:  fiches.filter(f => f.statut === "soumis").length,
    refuses:    fiches.filter(f => f.statut === "refuse").length,
    arrets:     fiches.filter(f => f.pointArretRefuse).length,
  };

  const enAttente = fiches.filter(f => f.statut === "soumis");

  return (
    <Layout>
      <div className="p-4 space-y-5">
        <h1 className="text-xl font-bold text-primary">Tableau de bord</h1>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total fiches",  val: stats.total,     color: "text-primary",   bg: "bg-blue-50",   icon: "📋" },
            { label: "Validées",      val: stats.valides,   color: "text-green-600", bg: "bg-green-50",  icon: "✅" },
            { label: "En attente",    val: stats.enAttente, color: "text-orange-500",bg: "bg-orange-50", icon: "⏳" },
            { label: "Refusées",      val: stats.refuses,   color: "text-red-500",   bg: "bg-red-50",    icon: "❌" },
          ].map(s => (
            <div key={s.label} className={`card ${s.bg} flex items-center gap-3`}>
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {stats.arrets > 0 && (
          <div className="card border border-red-300 bg-red-50 flex items-center gap-3">
            <span className="text-3xl">⛔</span>
            <div>
              <p className="font-bold text-red-600">Points d'arrêt refusés</p>
              <p className="text-sm text-red-500">{stats.arrets} fiche(s) nécessitent votre attention</p>
            </div>
          </div>
        )}

        {enAttente.length > 0 && (
          <>
            <h2 className="font-bold text-primary">⏳ En attente ({enAttente.length})</h2>
            {enAttente.map(f => (
              <div key={f.id} onClick={() => router.push(`/fiches/${f.id}`)}
                className="card cursor-pointer active:opacity-70 border-l-4 border-orange-400">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{f.chantierNom}</p>
                    <p className="text-sm text-gray-500">{f.localisation}</p>
                    <p className="text-xs text-gray-400 mt-1">👷 {f.ouvrierNom} — {format(new Date(f.date), "dd MMM", { locale: fr })}</p>
                  </div>
                  {f.pointArretRefuse && <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg">⛔</span>}
                </div>
              </div>
            ))}
          </>
        )}

        {enAttente.length === 0 && (
          <div className="card text-center text-gray-400 py-8">
            <p className="text-3xl mb-2">🎉</p>
            <p>Toutes les fiches sont à jour !</p>
          </div>
        )}
      </div>
    </Layout>
  );
}