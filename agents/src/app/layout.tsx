import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@kaara/shared/components/theme/ThemeProvider";
import { ThemeScript } from "@kaara/shared/components/theme/theme-script";
import { AuthProvider } from "@kaara/shared/features/auth/AuthContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kaara - Espace Agents",
    template: "%s · Kaara Agents",
  },
  description: "Guichet, vente hors ligne et controle des billets a l'embarquement.",
  // Espace professionnel : rien ici n'a vocation a etre trouve par un moteur de recherche.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4fbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#071219" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning` : le script de theme modifie la classe de
    // <html> avant l'hydratation, ce qui est precisement son role.
    <html lang="fr" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
