"use client";

import { PageHeader } from "@/components/ui";
import { IconUser } from "@/components/ui/icons";
import { ProfileView } from "@/features/profile/ProfileView";

export default function ProfilePage() {
  return (
    <>
      <PageHeader icon={<IconUser className="h-5 w-5" />} title="Mon profil" description="Vos informations, votre mot de passe et vos preferences d'affichage." />
      <ProfileView />
    </>
  );
}
