import type { Metadata } from "next";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const { next } = await searchParams;

  return (
    <AuthPanel title="Connexion" description="Voyageurs, agents et gestionnaires : connectez-vous avec votre adresse e-mail.">
      <LoginForm next={Array.isArray(next) ? next[0] : next} />
    </AuthPanel>
  );
}
