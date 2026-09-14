import type { Metadata } from "next";
import { PublicAccountView } from "@/features/profile/PublicAccountView";

export const metadata: Metadata = { title: "Mon compte" };

export default function ProfilPage() {
  return <PublicAccountView />;
}
