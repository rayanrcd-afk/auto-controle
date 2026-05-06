"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { subscribeFichesOuvrier } from "@/lib/fiches";
import { FicheControle } from "@/lib/types";
import Layout from "@/components/Layout";
import StatutBadge from "@/components/StatutBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function FichesPage() {
  const { user, profile } = useAuth();
  const [fiches, setFiches] = useState<FicheControle[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    return subscribeFichesOuvrier(user.uid, setFiches);
  }, [user]);

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Mes fiches</h1>
          <button onClick={() => router.push("/fiches/nouvelle")}
            className="btn-primary text-sm px-4 py-2">
            + Nouvelle
          </button>
        </div>

        {fiches.length === 0 && (
          <div className="card text-center text-gray-400 py-10">
            <p className="text-3xl mb-2">📋</p>
            <p>Aucune fiche pour l'instant</p>
          </div>
        )}

        {fiches.map(f => (
          <div key={f.id} onClick={() => router.push(`/fiches/${f.id}`)}
            className="card cursor-pointer active:opacity-70 border-l-4 border-primary">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{f.chantierNom}</p>
                <p className="text-sm text-gray-500">{f.localisation} — {f.niveau}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(f.date), "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatutBadge statut={f.statut} />
                {f.pointArretRefuse && (
                  <span className="text-xs text-red-600 font-bold">⛔</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}