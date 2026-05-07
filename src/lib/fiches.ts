import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { FicheControle } from "./types";

export async function saveFiche(fiche: FicheControle): Promise<string> {
  const data = { ...fiche, createdAt: fiche.createdAt ?? Date.now() };
  if (fiche.id) {
    await updateDoc(doc(db, "fiches", fiche.id), data);
    return fiche.id;
  }
  const docRef = await addDoc(collection(db, "fiches"), data);
  return docRef.id;
}

export async function uploadPhoto(file: File, ficheId: string): Promise<string> {
  const storageRef = ref(storage, `fiches/${ficheId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function validerFiche(ficheId: string, valide: boolean) {
  if (valide) {
    await updateDoc(doc(db, "fiches", ficheId), {
      statut: "validée",
    });
  } else {
    await deleteDoc(doc(db, "fiches", ficheId));
  }
}

export function subscribeFichesOuvrier(uid: string, cb: (f: FicheControle[]) => void) {
  const q = query(
    collection(db, "fiches"),
    where("ouvrierUid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FicheControle)))
  );
}

export function subscribeToutesFiches(cb: (f: FicheControle[]) => void) {
  const q = query(collection(db, "fiches"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FicheControle)))
  );
}

export async function deleteFiche(ficheId: string) {
  await deleteDoc(doc(db, "fiches", ficheId));
}