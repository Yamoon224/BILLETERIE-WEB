import type { NextConfig } from "next";

/**
 * Le build de production local n'ecrit pas dans le meme dossier que le serveur
 * de developpement.
 *
 * `next build` deposerait sinon ses manifestes a la racine de `.next`, ou
 * `next dev` va aussi lire : un serveur de developpement lance apres un build
 * repartirait sur des artefacts qui ne sont pas les siens. Deux dossiers
 * distincts rendent la collision impossible. Vercel est l'exception : son
 * builder exige la sortie dans `.next`.
 */
const isVercelBuild = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  distDir:
    process.env.NODE_ENV === "production" && !isVercelBuild ? ".next-build" : ".next",

  // Les QR codes des billets sont servis par l'API Laravel en SVG : ils
  // passent par une balise <img> ordinaire, sans optimisation d'image.
  images: { unoptimized: true },
};

export default nextConfig;
