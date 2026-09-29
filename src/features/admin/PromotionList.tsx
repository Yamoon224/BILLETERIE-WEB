"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, ErrorState, FormAlert, LoadingState, Modal, SelectField, TextField, Toggle } from "@/components/ui";
import { IconPlus } from "@/components/ui/icons";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useMutation } from "@/hooks/useMutation";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { promotionService } from "@/services";
import type { PromotionInput } from "@/services/promotion-service";
import type { Promotion, PromotionZone } from "@/types/api";

const PREVIEW_GRADIENT: Record<string, string> = {
  hero_banner: "bg-gradient-to-r from-brand-600 to-brand-500",
  editorial: "bg-gradient-to-br from-brand-500 to-brand-600",
  advertisement: "bg-gradient-to-br from-fuchsia-600 to-fuchsia-800",
};

function previewClass(promotion: Promotion): string {
  return PREVIEW_GRADIENT[promotion.zone === "hero_banner" ? "hero_banner" : promotion.kind] ?? PREVIEW_GRADIENT.editorial;
}

export function PromotionList() {
  const [isCreating, setIsCreating] = useState(false);
  const loader = useCallback(() => promotionService.list({ per_page: 50 }), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);

  const toggle = useMutation(({ id, is_active }: { id: string; is_active: boolean }) => promotionService.update(id, { is_active }));

  async function handleToggle(promotion: Promotion) {
    const result = await toggle.run({ id: promotion.id, is_active: !promotion.is_active });
    if (result) reload();
  }

  if (isLoading && !data) return <LoadingState label="Chargement des promotions…" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return null;

  const banners = data.data.filter((item) => item.zone === "hero_banner");
  const tiles = data.data.filter((item) => item.zone === "featured_tile");

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsCreating(true)} icon={<IconPlus className="h-4 w-4" />}>
        Creer une offre
      </Button>

      <section>
        <h2 className="mb-3 text-sm font-bold tracking-tight">Banniere d&apos;accueil</h2>
        <div className="space-y-3">
          {banners.length === 0 ? <EmptyRow /> : banners.map((promotion) => <PromotionRow key={promotion.id} promotion={promotion} onToggle={handleToggle} isPending={toggle.isPending} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold tracking-tight">Tuiles « A la une »</h2>
        <div className="space-y-3">
          {tiles.length === 0 ? <EmptyRow /> : tiles.map((promotion) => <PromotionRow key={promotion.id} promotion={promotion} onToggle={handleToggle} isPending={toggle.isPending} />)}
        </div>
      </section>

      {isCreating ? (
        <PromotionFormDialog
          onClose={() => setIsCreating(false)}
          onSaved={() => {
            setIsCreating(false);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

function EmptyRow() {
  return <p className="rounded-2xl border border-dashed border-[var(--hairline)] px-4 py-6 text-center text-sm text-[var(--muted)]">Aucune offre pour le moment.</p>;
}

function PromotionRow({ promotion, onToggle, isPending }: { promotion: Promotion; onToggle: (promotion: Promotion) => void; isPending: boolean }) {
  return (
    <Card accent={false} className={cn(!promotion.is_active && "opacity-55")}>
      <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className={cn("flex h-16 w-full shrink-0 items-end rounded-sm p-2.5 text-[10.5px] font-bold leading-snug text-white sm:w-32", previewClass(promotion))}>
          {promotion.title}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{promotion.zone === "hero_banner" ? "Banniere hero - page d'accueil" : promotion.kind_label}</p>
          <p className="text-xs text-[var(--muted)]">{promotion.subtitle ?? (promotion.advertiser_name ? `Publicite - ${promotion.advertiser_name}` : "Sans date de fin programmee")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs font-bold text-[var(--muted)]">{promotion.is_active ? "Actif" : "Suspendu"}</span>
          <Toggle checked={promotion.is_active} onChange={() => onToggle(promotion)} disabled={isPending} label={`Basculer la promotion « ${promotion.title} »`} />
        </div>
      </div>
    </Card>
  );
}

function PromotionFormDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: "", zone: "hero_banner" as PromotionZone, starts_at: "", ends_at: "" });
  const save = useMutation((input: PromotionInput) => promotionService.create(input));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run({
      title: form.title.trim(),
      zone: form.zone,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    });
    if (result) onSaved();
  }

  const errors = save.fieldErrors;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Creer une offre"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="promotion-form" isLoading={save.isPending}>
            Publier l&apos;offre
          </Button>
        </>
      }
    >
      <form id="promotion-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Titre de l'offre"
          placeholder="Ex : -15 % sur les residences a Assinie"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          errors={errors.title}
          required
        />
        <SelectField label="Zone d'affichage" value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value as PromotionZone })}>
          <option value="hero_banner">Banniere hero (accueil)</option>
          <option value="featured_tile">Tuile « A la une »</option>
        </SelectField>
        <TextField label="Date de debut" type="date" placeholder="20/09/2026" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} errors={errors.starts_at} />
        <TextField label="Date de fin" type="date" placeholder="30/09/2026" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} errors={errors.ends_at} />
        {save.error && !Object.keys(errors).length ? <FormAlert className="sm:col-span-2">{errorMessage(save.error)}</FormAlert> : null}
      </form>
    </Modal>
  );
}
