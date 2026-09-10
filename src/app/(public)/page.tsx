import { Card, CardBody } from "@/components/ui";
import { IconPhone, IconQrCode, IconScan, IconShield, IconTicket, IconWifiOff } from "@/components/ui/icons";
import { TripSearchForm } from "@/features/search/TripSearchForm";

const STEPS = [
  {
    icon: <IconTicket className="h-5 w-5" />,
    title: "Choisissez votre place",
    text: "Comparez les horaires des compagnies et reservez le siege qui vous convient, cote fenetre ou couloir.",
  },
  {
    icon: <IconPhone className="h-5 w-5" />,
    title: "Payez par mobile money",
    text: "Orange Money, MTN MoMo, Moov Money ou Wave : validez le debit depuis votre telephone.",
  },
  {
    icon: <IconQrCode className="h-5 w-5" />,
    title: "Recevez votre billet",
    text: "Votre billet arrive par SMS. Presentez le QR code a l'embarquement, meme sans connexion.",
  },
];

const PROMISES = [
  { icon: <IconShield className="h-4 w-4" />, label: "Billet infalsifiable, verifie a l'embarquement" },
  { icon: <IconWifiOff className="h-4 w-4" />, label: "Pense pour les reseaux 2G et 3G" },
  { icon: <IconScan className="h-4 w-4" />, label: "Aucun ticket papier a imprimer" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* Fond de marque : degrade orange et motif de bandes inclinees rappelant
            le drapeau, en retrait pour ne jamais concurrencer le formulaire. */}
        <div aria-hidden="true" className="grad-brand absolute inset-x-0 top-0 h-[26rem] sm:h-[24rem]" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[26rem] opacity-[0.12] sm:h-[24rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, #fff 0 18px, transparent 18px 64px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
          <div className="max-w-2xl text-white">
            <p className="inline-flex items-center gap-2 rounded-sm bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-flag-green)]" />
              Transport interurbain en Cote d&apos;Ivoire
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Votre place dans le car, reservee en deux minutes.
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">
              Abidjan, Bouake, Yamoussoukro, San-Pedro… Plus besoin de faire la queue au guichet.
            </p>
          </div>

          <Card className="mt-8">
            <CardBody className="p-4 sm:p-6">
              <TripSearchForm layout="inline" />
            </CardBody>
          </Card>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
            {PROMISES.map((promise) => (
              <li key={promise.label} className="flex items-center gap-2">
                <span className="text-brand-600 dark:text-brand-400">{promise.icon}</span>
                {promise.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight">Comment ca marche</h2>
        <span aria-hidden="true" className="grad-brand mx-auto mt-3 block h-[3px] w-16 rounded-full" />

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card interactive className="h-full">
                <CardBody className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="grad-brand flex h-11 w-11 items-center justify-center rounded-sm text-white shadow-card">
                      {step.icon}
                    </span>
                    <span className="text-4xl font-extrabold text-brand-100 dark:text-stone-800">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.text}</p>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
