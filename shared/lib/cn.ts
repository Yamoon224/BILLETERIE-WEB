export type ClassValue = string | false | null | undefined | ClassValue[];

/**
 * Concatene des classes CSS conditionnelles en ignorant les valeurs vides.
 * Les tableaux imbriques sont aplatis, ce qui permet de regrouper les classes
 * d'un meme etat sous une seule condition.
 */
export function cn(...classes: ClassValue[]): string {
  const out: string[] = [];

  for (const entry of classes) {
    if (!entry) continue;
    if (Array.isArray(entry)) out.push(cn(...entry));
    else out.push(entry);
  }

  return out.filter(Boolean).join(" ");
}
