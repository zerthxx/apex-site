"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  palvelu: z.enum(["startti", "kasvu", "pro", "perus", "standardi", "premium", "verkkokaupat", "mobiilisovellukset", "ai-ratkaisut", "ohjelmistot", "muu"]),
  viesti: z.string().min(20, "Kerro lisää projektistasi (vähintään 20 merkkiä)").max(2000),
  honeypot: z.string().max(0),
});

type ContactFormData = z.infer<typeof contactSchema>;

const SERVICE_OPTIONS = [
  { value: "startti", label: "Verkkosivut — Startti (299 € + 49 €/kk)" },
  { value: "kasvu", label: "Verkkosivut — Kasvu (599 € + 79 €/kk)" },
  { value: "pro", label: "Verkkosivut — Pro (999 € + 99 €/kk)" },
  { value: "perus", label: "Ylläpito — Perus (150 €/kk)" },
  { value: "standardi", label: "Ylläpito — Standardi (350 €/kk)" },
  { value: "premium", label: "Ylläpito — Premium (750 €/kk)" },
  { value: "verkkokaupat", label: "Verkkokauppa (alkaen 6 000 €)" },
  { value: "mobiilisovellukset", label: "Mobiilisovellus (alkaen 15 000 €)" },
  { value: "ai-ratkaisut", label: "AI-ratkaisut (alkaen 4 000 €)" },
  { value: "ohjelmistot", label: "Ohjelmistot / SaaS (tarjous)" },
  { value: "muu", label: "Muu / En ole varma" },
];

export function ContactForm() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { palvelu: "" as never, honeypot: "" },
  });

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

      {/* Service select */}
      <Select
        {...register("palvelu")}
        label="Mikä palvelu kiinnostaa? *"
        options={SERVICE_OPTIONS}
        placeholder="Valitse palvelu"
        error={errors.palvelu?.message}
      />

      {/* Message */}
      <Textarea
        {...register("viesti")}
        label="Kerro projektistasi *"
        placeholder="Kuvaile mitä tarvitset, minkälainen aikataulu sinulla on, budjetti ja muut oleelliset tiedot. Mitä enemmän kerrot, sitä paremmin voimme auttaa."
        minRows={5}
        error={errors.viesti?.message}
      />

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Lähetetään..." : "Lähetä viesti"}
      </Button>
    </form>
  );
}
