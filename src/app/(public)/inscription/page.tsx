import type { Metadata } from "next";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = { title: "Creer un compte" };

export default function RegisterPage() {
  return (
    <AuthPanel title="Creer un compte voyageur" description="Retrouvez tous vos billets au meme endroit, sans ressaisir vos coordonnees.">
      <RegisterForm />
    </AuthPanel>
  );
}
