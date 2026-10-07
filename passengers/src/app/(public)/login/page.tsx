import type { Metadata } from "next";
import { PassengerLogin } from "@/features/auth/PassengerLogin";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return <PassengerLogin next={Array.isArray(next) ? next[0] : next} />;
}
