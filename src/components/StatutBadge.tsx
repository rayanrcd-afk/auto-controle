type Statut = "brouillon" | "soumis" | "valide" | "refuse";

const config: Record<Statut, { label: string; color: string }> = {
  brouillon: { label: "Brouillon",  color: "bg-gray-100 text-gray-500" },
  soumis:    { label: "En attente", color: "bg-orange-100 text-orange-600" },
  valide:    { label: "Validé",     color: "bg-green-100 text-green-600" },
  refuse:    { label: "Refusé",     color: "bg-red-100 text-red-600" },
};

export default function StatutBadge({ statut }: { statut: Statut }) {
  const { label, color } = config[statut] ?? config.brouillon;
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}