"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const contactSchema = z.object({
  nimi: z.string().min(2, "Nimi on pakollinen").max(100),
  sahkoposti: z.string().email("Virheellinen sähköpostiosoite"),
  puhelin: z.string().optional(),
  yritys: z.string().optional(),
  palvelu: z.enum(["verkkosivut", "startti", "kasvu", "pro", "perus", "standardi", "premium", "verkkokaupat", "mobiilisovellukset", "ai-ratkaisut", "ohjelmistot", "muu"]),
  budjetti: z.string().optional(),
  aikataulu: z.string().optional(),
  yhteydenotto: z.string().optional(),
  viesti: z.string().min(20, "Kerro lisää projektistasi (vähintään 20 merkkiä)").max(2000),
  honeypot: z.string().max(0),
});

type ContactFormData = z.infer<typeof contactSchema>;

const VALID_PALVELU_VALUES = ["verkkosivut", "startti", "kasvu", "pro", "perus", "standardi", "premium", "verkkokaupat", "mobiilisovellukset", "ai-ratkaisut", "ohjelmistot", "muu"] as const;

const palveluToTyyppi: Record<string, string> = {
  startti: "verkkosivut",
  kasvu: "verkkosivut",
  pro: "verkkosivut",
  verkkosivut: "verkkosivut",
  perus: "yllapito",
  standardi: "yllapito",
  premium: "yllapito",
  verkkokaupat: "verkkokaupat",
  mobiilisovellukset: "mobiilisovellukset",
  "ai-ratkaisut": "ai-ratkaisut",
  ohjelmistot: "ohjelmistot",
  muu: "muu",
};

const MAIN_SERVICES = [
  { value: "verkkosivut", label: "Verkkosivut" },
  { value: "verkkokaupat", label: "Verkkokauppa" },
  { value: "ai-ratkaisut", label: "AI-ratkaisut" },
  { value: "mobiilisovellukset", label: "Mobiilisovellus" },
  { value: "ohjelmistot", label: "Räätälöidyt ohjelmistot" },
  { value: "yllapito", label: "Ylläpito" },
  { value: "muu", label: "En ole varma" },
];

const SUB_SERVICES: Record<string, { value: string; label: string }[]> = {
  verkkosivut: [
    { value: "verkkosivut", label: "Räätälöity tarjous" },
    { value: "startti", label: "Startti (299 € + 49 €/kk)" },
    { value: "kasvu", label: "Kasvu (599 € + 79 €/kk)" },
    { value: "pro", label: "Pro (999 € + 99 €/kk)" },
  ],
  yllapito: [
    { value: "perus", label: "Perus (150 €/kk)" },
    { value: "standardi", label: "Standardi (350 €/kk)" },
    { value: "premium", label: "Premium (750 €/kk)" },
  ],
};

const BUDGET_OPTIONS = [
  { value: "alle-3000", label: "Alle 3 000 €" },
  { value: "3000-6000", label: "3 000–6 000 €" },
  { value: "6000-10000", label: "6 000–10 000 €" },
  { value: "10000-plus", label: "10 000 €+" },
  { value: "ei-osaa-sanoa", label: "En osaa sanoa" },
];

const AIKATAULU_OPTIONS = [
  { value: "heti", label: "Heti" },
  { value: "1kk", label: "1 kuukauden sisällä" },
  { value: "2-3kk", label: "2–3 kuukauden sisällä" },
  { value: "ei-kiire", label: "Ei kiire" },
];

const YHTEYDENOTTO_OPTIONS = [
  { value: "sahkoposti", label: "Sähköposti" },
  { value: "puhelu", label: "Puhelu" },
  { value: "whatsapp", label: "WhatsApp" },
];

export function ContactForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const palveluParam = searchParams.get("palvelu") ?? "";
  const defaultPalvelu = VALID_PALVELU_VALUES.includes(palveluParam as never) ? palveluParam : "";

  const [palveluTyyppi, setPalveluTyyppi] = useState<string>(
    palveluToTyyppi[defaultPalvelu] ?? ""
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { palvelu: defaultPalvelu as never, honeypot: "" },
  });

  useEffect(() => {
    if (defaultPalvelu) {
      setValue("palvelu", defaultPalvelu as never);
      setPalveluTyyppi(palveluToTyyppi[defaultPalvelu] ?? "");
    }
  }, [defaultPalvelu, setValue]);

  const currentPalvelu = watch("palvelu");
  const FIXED_PRICE_PALVELUT = new Set(["startti", "kasvu", "pro", "perus", "standardi", "premium"]);
  const showBudget = !!currentPalvelu && !FIXED_PRICE_PALVELUT.has(currentPalvelu as string);

  const handleTyyppiChange = (val: string) => {
    setPalveluTyyppi(val);
    if (!SUB_SERVICES[val]) {
      setValue("palvelu", val as never, { shouldValidate: false });
    } else {
      setValue("palvelu", "" as never, { shouldValidate: false });
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Virhe");
      toast({
        variant: "success",
        title: "Viesti lähetetty!",
        description: "Vastaamme 24 tunnin sisällä.",
      });
      reset();
      setPalveluTyyppi("");
    } catch {
      toast({
        variant: "error",
        title: "Lähetys epäonnistui",
        description: "Yritä uudelleen tai soita meille.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Honeypot — hidden from real users */}
      <input
        {...register("honeypot")}
        type="text"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] opacity-0 pointer-events-none"
      />

      {/* Row 1: Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register("nimi")}
          label="Nimi *"
          placeholder="Matti Meikäläinen"
          error={errors.nimi?.message}
          autoComplete="name"
        />
        <Input
          {...register("sahkoposti")}
          label="Sähköposti *"
          type="email"
          placeholder="matti@yritys.fi"
          error={errors.sahkoposti?.message}
          autoComplete="email"
        />
      </div>

      {/* Row 2: Phone + Company (optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register("puhelin")}
          label="Puhelinnumero"
          type="tel"
          placeholder="+358 50 123 4567"
          hint="Valinnainen"
          autoComplete="tel"
        />
        <Input
          {...register("yritys")}
          label="Yritys"
          placeholder="Yritys Oy"
          hint="Valinnainen"
          autoComplete="organization"
        />
      </div>

      {/* Step 1: Main service category */}
      <Select
        label="Mistä palvelusta olet kiinnostunut? *"
        options={MAIN_SERVICES}
        placeholder="Valitse palvelu"
        value={palveluTyyppi}
        onChange={(e) => handleTyyppiChange(e.target.value)}
      />

      {/* Step 2: Sub-option (only for verkkosivut / yllapito) */}
      {palveluTyyppi && SUB_SERVICES[palveluTyyppi] && (
        <Select
          {...register("palvelu")}
          defaultValue={
            palveluToTyyppi[defaultPalvelu] === palveluTyyppi ? defaultPalvelu : ""
          }
          label="Minkä ratkaisun haluat? *"
          options={SUB_SERVICES[palveluTyyppi]}
          placeholder="Valitse ratkaisu"
          error={errors.palvelu?.message}
        />
      )}

      {/* Budget — only for custom-price services */}
      {showBudget && (
        <Select
          {...register("budjetti")}
          defaultValue=""
          label="Millaisella budjetilla projektia suunnitellaan?"
          options={BUDGET_OPTIONS}
          placeholder="Valitse budjetti"
          hint="Valinnainen"
        />
      )}

      {/* Timeline */}
      <Select
        {...register("aikataulu")}
        defaultValue=""
        label="Milloin haluat projektin alkavan?"
        options={AIKATAULU_OPTIONS}
        placeholder="Valitse aikataulu"
        hint="Valinnainen"
      />

      {/* Contact preference */}
      <Select
        {...register("yhteydenotto")}
        defaultValue=""
        label="Miten haluat, että otamme yhteyttä?"
        options={YHTEYDENOTTO_OPTIONS}
        placeholder="Valitse yhteydenottotapa"
        hint="Valinnainen"
      />

      {/* Message */}
      <Textarea
        {...register("viesti")}
        label="Kerro projektistasi *"
        placeholder="Kuvaile mitä tarvitset, minkälainen aikataulu sinulla on, budjetti ja muut oleelliset tiedot. Mitä enemmän kerrot, sitä paremmin voimme auttaa."
        minRows={5}
        error={errors.viesti?.message}
      />

      {/* Trust text */}
      <p className="text-sm text-ink-dim leading-relaxed">
        Vastaamme kaikkiin yhteydenottoihin 24 tunnin sisällä. Maksuton kartoitus ei sido sinua
        mihinkään.
      </p>

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Lähetetään..." : "Lähetä viesti"}
      </Button>

      {/* Privacy text */}
      <p className="text-xs text-ink-ghost leading-relaxed">
        Lähettämällä lomakkeen hyväksyt{" "}
        <Link href="/tietosuoja" className="underline hover:text-copper transition-colors">
          tietosuojakäytäntömme
        </Link>
        . Käytämme tietojasi vain yhteydenottoasi varten.
      </p>
    </form>
  );
}
