"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface PromoBanner {
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
}

/**
 * Bandeau d'affiches publicitaires, un pilier a la fois.
 *
 * Defilement automatique toutes les 6 secondes, mis en pause au survol et
 * pilotable a la main : une pub qui tourne pendant qu'on essaie de la lire
 * agace plus qu'elle ne convainc.
 */
export function PromoBannerSlider({ banners }: { banners: PromoBanner[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused, banners.length]);

  if (banners.length === 0) return null;

  const active = banners[index];

  return (
    <div
      className="relative overflow-hidden rounded-sm shadow-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link
        href={active.href}
        className="relative flex h-40 flex-col justify-end p-5 text-white sm:h-48 sm:p-6"
        style={{ backgroundImage: active.gradient }}
      >
        <p className="text-lg font-extrabold sm:text-xl">{active.title}</p>
        <p className="mt-1 text-sm text-white/85">{active.subtitle}</p>
      </Link>

      {banners.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setIndex((current) => (current - 1 + banners.length) % banners.length)}
            aria-label="Affiche precedente"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % banners.length)}
            aria-label="Affiche suivante"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((banner, dotIndex) => (
              <button
                key={banner.title}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Aller a l'affiche ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                className={cn(
                  "h-1.5 rounded-full bg-white/50 transition-all",
                  dotIndex === index ? "w-5 bg-white" : "w-1.5",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
