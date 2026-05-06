import {
  signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword,
  onAuthStateChanged, User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "./types";

export function usernameToEmail(username: string): string {
  const cleaned = username.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".");
  return `${cleaned}@steelpose.fr`;
}

const ADMIN_EMAIL = "admin@steelpose.fr";

export async function login(username: string, password: string) {
  const email = username.trim().toLowerCase() === "admin"
    ? ADMIN_EMAIL
    : usernameToEmail(username);
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

export async function createOuvrier(
  prenom: string, nom: string, dateNaissance: string
) {
  const username = `${prenom} ${nom}`;
  const email    = usernameToEmail(username);
  const cred     = await createUserWithEmailAndPassword(auth, email, dateNaissance);
  await setDoc(doc(db, "users", cred.user.uid), {
    nom, prenom, email, role: "ouvrier", username, dateNaissance,
  });
  return cred.user.uid;
}

export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}