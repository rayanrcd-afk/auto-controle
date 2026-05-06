"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { saveFiche, uploadPhoto } from "@/lib/fiches";
import { FicheControle, PointControle, POINTS_DEFAUT, Resultat } from "@/lib/types";
import Layout from "@/components/Layout";
import toast from "react-hot-toast";

export default function NouvelleFichePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [chantierNom,  setChantierNom]  = useState("");
  const [planNumero,   setPlanNumero]   = useState("");
  const [niveau,       setNiveau]       = useState("");
  const [localisation, setLocalisation] = useState("");
  const [points, setPoints] = useState<PointControle[]>(POINTS_DEFAUT.map(p => ({ ...p })));
  const [pointArret,   setPointArret]   = useState(false);
  const [causeRefus,   setCauseRefus]   = useState("");
  const [solutions,    setSolutions]    = useState("");
  const [photos,       setPhotos]       = useState<File[]>([]);
  const [previews,     setPreviews]     = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);

  function setResultat(idx: number, val: Resultat) {
    setPoints(prev => prev.map((p, i) => i === idx ? { ...p, resultat: val } : p));
  }

  function setObservation(idx: number, val: string) {
    setPoints(prev => prev.map((p, i) => i === idx ? { ...p, observation: val } : p));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target!.result as string]);
      reader.readAsDataURL(f);
    });
  }

  async function handleSave(statut: "brouillon" | "soumis") {
    if (!chantierNom || !planNumero || !niveau || !localisation) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!user) {
      toast.error("Erreur : utilisateur non chargé, rechargez la page.");
      return;
    }
    const nomComplet = profile
      ? `${profile.prenom} ${profile.nom}`
      : user.displayName || user.email || "Utilisateur";

    setLoading(true);
    try {
      const fiche: FicheControle = {
        chantierNom, planNumero, niveau, localisation,
        date: new Date().toISOString(),
        ouvrierUid: user.uid,
        ouvrierNom: nomComplet,
        points, pointArretRefuse: pointArret,
        causeRefus, solutions,
        photosUrls: [], statut,
        createdAt: Date.now(),
      };
      const id = await saveFiche(fiche);
      if (photos.length > 0) {
        const urls = await Promise.all(photos.map(f => uploadPhoto(f, id)));
        await saveFiche({ ...fiche, id, photosUrls: urls });
      }
      toast.success(statut === "soumis" ? "Fiche soumise pour validation !" : "Brouillon sauvegardé !");
      router.push("/fiches");
    } catch (err) {
      console.error("ERREUR SAUVEGARDE:", err);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="p-4 space-y-5">
        <h1 className="text-xl font-bold text-primary">Nouvelle fiche de contrôle</h1>
        <div className="card space-y-3">
          <h2 className="font-bold text-primary">📌 Informations générales</h2>
          {([
            ["Nom du chantier *", chantierNom, setChantierNom, "Ex: Résidence Les Pins"],
            ["Plan N° *", planNumero, setPlanNumero, "Ex: PLN-2024-042"],
            ["Niveau *", niveau, setNiveau, "Ex: RDC, R+1..."],
            ["Localisation précise *", localisation, setLocalisation, "Ex: File A, Voile V12..."],
          ] as [string, string, (v: string) => void, string][]).map(([label, val, set, ph]) => (
            <div key={label}>
              <label className="label">{label}</label>
              <input className="input" value={val} onChange={e => set(e.target.value)} placeholder={ph} />
            </div>
          ))}
        </div>
        <div className="card space-y-4">
          <h2 className="font-bold text-primary">✅ Points de contrôle</h2>
          {points.map((p, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <p className="font-semibold text-sm">{p.libelle}</p>
              <div className="flex gap-2">
                {(["bon", "mauvais", "non_verifie"] as Resultat[]).map(r => (
                  <button key={r} onClick={() => setResultat(i, r)}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg border transition-all ${p.resultat === r ? r === "bon" ? "bg-green-500 text-white border-green-500" : r === "mauvais" ? "bg-red-500 text-white border-red-500" : "bg-gray-400 text-white border-gray-400" : "bg-white text-gray-400 border-gray-200"}`}>
                    {r === "bon" ? "✓ Bon" : r === "mauvais" ? "✗ Mauvais" : "— N/V"}
                  </button>
                ))}
              </div>
              <input className="input text-sm" placeholder="Observation (facultatif)"
                value={p.observation} onChange={e => setObservation(i, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-600">⛔ Point d'arrêt refusé</span>
            <button onClick={() => setPointArret(!pointArret)}
              className={`w-12 h-6 rounded-full transition-colors ${pointArret ? "bg-red-500" : "bg-gray-300"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${pointArret ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
          {pointArret && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="label">Cause du refus</label>
                <textarea className="input" rows={2} value={causeRefus} onChange={e => setCauseRefus(e.target.value)} />
              </div>
              <div>
                <label className="label">Solutions proposées</label>
                <textarea className="input" rows={2} value={solutions} onChange={e => setSolutions(e.target.value)} />
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="font-bold text-primary mb-3">📸 Photos ({photos.length})</h2>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handlePhoto} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-accent text-accent font-bold py-4 rounded-xl">
            📷 Prendre / Ajouter des photos
          </button>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="rounded-xl w-full h-24 object-cover" />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 pb-4">
          <button onClick={() => handleSave("brouillon")} disabled={loading} className="btn-secondary flex-1">
            Brouillon
          </button>
          <button onClick={() => handleSave("soumis")} disabled={loading} className="btn-primary flex-1">
            {loading ? "Envoi..." : "Soumettre"}
          </button>
        </div>
      </div>
    </Layout>
  );
}