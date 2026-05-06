"use client";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isChef = profile?.role === "chef";

  const navItems = isChef
    ? [
        { href: "/dashboard", label: "Tableau de bord", icon: "📊" },
        { href: "/fiches",    label: "Toutes les fiches", icon: "📋" },
        { href: "/admin",     label: "Équipe",   icon: "👥" },
      ]
    : [
        { href: "/fiches",          label: "Mes fiches",     icon: "📋" },
        { href: "/fiches/nouvelle", label: "Nouvelle fiche", icon: "➕" },
      ];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏗️</span>
          <div>
            <p className="font-bold text-sm leading-tight">SteelPose Armatures</p>
            <p className="text-blue-200 text-xs">{profile?.prenom} {profile?.nom}</p>
          </div>
        </div>
        <button onClick={() => logout().then(() => router.replace("/login"))}
          className="text-blue-200 text-xs border border-blue-300 rounded-lg px-3 py-1">
          Déconnexion
        </button>
      </header>

      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 flex z-10">
        {navItems.map(item => (
          <button key={item.href} onClick={() => router.push(item.href)}
            className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors
              ${pathname === item.href ? "text-primary font-bold" : "text-gray-400"}`}>
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}