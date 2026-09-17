"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconClose } from "@/components/ui/icons";

interface InfoModalContextValue {
  openInfo: (title: string, text: string) => void;
}

const InfoModalContext = createContext<InfoModalContextValue | null>(null);

/**
 * Popup d'information partagee par le tiroir de navigation et le pied de
 * page : les fonctionnalites annoncees mais pas encore en ligne (cheques
 * cadeaux, fidelite, Aeroexpress...) ouvrent ce meme modal plutot qu'un lien
 * mort ou une page a moitie construite.
 *
 * Carte blanche fixe (pas de bandeau degrade, pas de bordure de section) :
 * c'est un simple encart d'information, pas une boite de dialogue applicative
 * — deliberement plus sobre que le `Modal` partage du design system.
 */
export function InfoModalProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<{ title: string; text: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openInfo = useCallback((title: string, text: string) => {
    setContent({ title, text });
  }, []);
  const close = useCallback(() => setContent(null), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (content && !dialog.open) dialog.showModal();
    if (!content && dialog.open) dialog.close();
  }, [content]);

  const value = useMemo(() => ({ openInfo }), [openInfo]);

  return (
    <InfoModalContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={close}
        onCancel={close}
        aria-label={content?.title}
        className="m-auto w-[82%] max-w-[320px] rounded-[18px] border-none bg-white p-5 text-stone-900 shadow-card backdrop:bg-stone-950/55 open:animate-fade-rise"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[15px] font-bold text-[#0e1a3a]">{content?.title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
          >
            <IconClose className="h-2.5 w-2.5" />
          </button>
        </div>

        <p className="mt-2.5 text-[12.5px] leading-relaxed text-stone-500">{content?.text}</p>

        <button
          type="button"
          onClick={close}
          className="mt-4 w-full rounded-[11px] bg-[#0e1a3a] py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#16234f]"
        >
          Fermer
        </button>
      </dialog>
    </InfoModalContext.Provider>
  );
}

export function useInfoModal(): InfoModalContextValue {
  const ctx = useContext(InfoModalContext);
  if (!ctx) throw new Error("useInfoModal must be used within InfoModalProvider");
  return ctx;
}
