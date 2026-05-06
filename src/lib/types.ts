export type Role = "ouvrier" | "chef";

export interface UserProfile {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  username?: string;
}

export type Resultat = "non_verifie" | "bon" | "mauvais";

export interface PointControle {
  libelle: string;
  resultat: Resultat;
  observation: string;
}

export type Statut = "brouillon" | "soumis" | "valide" | "refuse";

export interface FicheControle {
  id?: string;
  chantierNom: string;
  planNumero: string;
  niveau: string;
  localisation: string;
  date: string;
  ouvrierUid: string;
  ouvrierNom: string;
  points: PointControle[];
  pointArretRefuse: boolean;
  causeRefus: string;
  solutions: string;
  photosUrls: string[];
  statut: Statut;
  createdAt?: number;
}

export const POINTS_DEFAUT: PointControle[] = [
  { libelle: "Calages, Enrobage",          resultat: "non_verifie", observation: "" },
  { libelle: "Recouvrements",              resultat: "non_verifie", observation: "" },
  { libelle: "Espacements",                resultat: "non_verifie", observation: "" },
  { libelle: "Diamètres & Qtés aciers",    resultat: "non_verifie", observation: "" },
  { libelle: "Positions des réservations", resultat: "non_verifie", observation: "" },
  { libelle: "Attentes",                   resultat: "non_verifie", observation: "" },
  { libelle: "Manchons",                   resultat: "non_verifie", observation: "" },
  { libelle: "Treillis soudés",            resultat: "non_verifie", observation: "" },
  { libelle: "Propreté des aciers",        resultat: "non_verifie", observation: "" },
];