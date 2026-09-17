"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button, Modal } from "@/components/ui";

interface InfoModalContextValue {
  openInfo: (title: string, text: string) => void;
}

const InfoModalContext = createContext<InfoModalContextValue | null>(null);

/**
 * Popup d'information partagee par le tiroir de navigation et le pied de
 * page : les fonctionnalites annoncees mais pas encore en ligne (cheques
 * cadeaux, fidelite, Aeroexpress...) ouvrent ce meme modal plutot qu'un lien
 * mort ou une page a moitie construite.
 */
export function InfoModalProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<{ title: string; text: string } | null>(null);

  const openInfo = useCallback((title: string, text: string) => {
    setContent({ title, text });
  }, []);
  const close = useCallback(() => setContent(null), []);

  const value = useMemo(() => ({ openInfo }), [openInfo]);

  return (
    <InfoModalContext.Provider value={value}>
      {children}
      <Modal
        isOpen={content !== null}
        onClose={close}
        title={content?.title ?? ""}
        size="sm"
        footer={
          <Button variant="secondary" onClick={close}>
            Fermer
          </Button>
        }
      >
        <p className="text-sm leading-relaxed text-[var(--muted)]">{content?.text}</p>
      </Modal>
    </InfoModalContext.Provider>
  );
}

export function useInfoModal(): InfoModalContextValue {
  const ctx = useContext(InfoModalContext);
  if (!ctx) throw new Error("useInfoModal must be used within InfoModalProvider");
  return ctx;
}
