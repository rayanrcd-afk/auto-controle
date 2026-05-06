import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FicheControle } from "./types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function generatePDF(fiche: FicheControle) {
  const pdf = new jsPDF();
  const dateStr = format(new Date(fiche.date), "dd/MM/yyyy", { locale: fr });

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(26, 58, 107);
  pdf.text("FICHE DE CONTRÔLE D'ARMATURES", 105, 20, { align: "center" });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("SteelPose Armatures", 105, 27, { align: "center" });
  pdf.setDrawColor(26, 58, 107);
  pdf.line(14, 30, 196, 30);

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  const infos = [
    ["Date", dateStr],
    ["Chantier", fiche.chantierNom],
    ["Plan N°", fiche.planNumero],
    ["Niveau", fiche.niveau],
    ["Localisation", fiche.localisation],
    ["Contrôlé par", fiche.ouvrierNom],
  ];
  let y = 38;
  infos.forEach(([label, val]) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(`${label} :`, 14, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(val, 55, y);
    y += 7;
  });

  autoTable(pdf, {
    startY: y + 4,
    head: [["Point à contrôler", "Résultat", "Observations"]],
    body: fiche.points.map(p => [
      p.libelle,
      p.resultat === "bon" ? "✓ Bon" : p.resultat === "mauvais" ? "✗ Mauvais" : "—",
      p.observation || "",
    ]),
    headStyles: { fillColor: [26, 58, 107], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: { 1: { halign: "center", cellWidth: 30 } },
    styles: { fontSize: 9 },
  });

  const finalY = (pdf as any).lastAutoTable.finalY + 10;

  if (fiche.pointArretRefuse) {
    pdf.setFillColor(255, 235, 235);
    pdf.roundedRect(14, finalY, 182, 28, 3, 3, "F");
    pdf.setDrawColor(220, 50, 50);
    pdf.roundedRect(14, finalY, 182, 28, 3, 3, "S");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(200, 30, 30);
    pdf.text("POINT D'ARRÊT REFUSÉ", 16, finalY + 7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Cause : ${fiche.causeRefus}`, 16, finalY + 15);
    pdf.text(`Solutions : ${fiche.solutions}`, 16, finalY + 22);
  }

  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Généré le ${format(new Date(), "dd/MM/yyyy HH:mm")} — SteelPose Armatures`, 105, 285, { align: "center" });
  pdf.save(`fiche_${fiche.chantierNom}_${dateStr.replace(/\//g, "-")}.pdf`);
}