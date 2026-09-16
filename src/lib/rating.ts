/**
 * Note et nombre d'avis, deterministes a partir d'un identifiant stable.
 *
 * Provisoire : le domaine metier ne porte pas encore d'avis voyageurs. En
 * attendant ce module, afficher une note figee par entite (plutot qu'aleatoire
 * a chaque rendu) evite au moins qu'un meme trajet change de note en
 * rechargeant la page. A retirer le jour ou un vrai systeme d'avis existe.
 */
export function pseudoRating(seed: string): { score: string; reviews: number } {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const score = 7.5 + (hash % 24) / 10;
  const reviews = 15 + (hash % 165);

  return { score: score.toFixed(1).replace(".", ","), reviews };
}
