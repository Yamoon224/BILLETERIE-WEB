import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = { title: "Creer un compte" };

export default function RegisterPage() {
  return <RegisterForm />;
}
