"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@kaara/shared/features/auth/AuthContext";
import { canSell, DESK } from "@/lib/access";

/** Le poste n'a pas d'accueil propre : il ouvre sur l'ecran de travail du profil. */
export default function DeskHomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(canSell(user) ? DESK.counter : DESK.boarding);
  }, [user, router]);

  return null;
}
