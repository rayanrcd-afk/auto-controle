"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Root() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (profile?.role === "chef") router.replace("/dashboard");
    else router.replace("/fiches");
  }, [user, profile, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-white text-center">
        <div className="text-5xl mb-4">⚙️</div>
        <p className="text-lg font-semibold">SteelPose Armatures</p>
      </div>
    </div>
  );
}