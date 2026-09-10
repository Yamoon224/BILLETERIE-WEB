/**
 * Formatage des valeurs metier, en francais.
 *
 * Centralise pour une raison precise : un montant affiche avec des centimes
 * ici et sans la, sur un ecran de caisse, fait douter des chiffres eux-memes.
 */

const LOCALE = "fr-FR";

/**
 * Montant en francs CFA.
 *
 * Aucune decimale : le XOF n'a pas de sous-unite en circulation, et afficher
 * « 7 000,00 F » inventerait une precision qui n'existe pas au guichet.
 */
export function formatMoney(amount: number, currency = "XOF"): string {
  const formatted = new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  // « F CFA » plutot que le symbole ISO : c'est ce que lit un voyageur ivoirien.
  return currency === "XOF" ? `${formatted} F CFA` : `${formatted} ${currency}`;
}

/** Nombre entier avec separateur de milliers. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatPercent(ratio: number, digits = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(ratio);
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** « lun. 14 sept. » */
export function formatDayShort(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

/** « lundi 14 septembre 2026 » */
export function formatDayLong(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDate(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(date);
}

/** « 06:30 » — l'heure de depart, lue avant tout le reste. */
export function formatTime(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** Duree lisible : 330 minutes → « 5 h 30 ». */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "—";

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/** Date du jour au format attendu par un champ `<input type="date">`. */
export function todayIso(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}
