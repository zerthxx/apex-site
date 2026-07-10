"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AtSign,
  CheckCircle,
  ChevronDown,
  Circle,
  Clock,
  Eye,
  EyeOff,
  History,
  Key,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Undo2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { CodeInput } from "@/components/shared/CodeInput";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { ComingSoonBadge } from "@/components/settings/SettingsKit";
import { EVENT_LABELS } from "@/lib/supabase/activityLog";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

type TimelineEvent = {
  id: string;
  event_type: string;
  ip_address: string | null;
  created_at: string;
};

type Props = {
  email: string;
  provider: string;
  hasPassword: boolean;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  forcePasswordReset: boolean;
  accountCreatedAt: string | null;
  timeline: TimelineEvent[];
};

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/** Live password requirement checklist — same rules the server enforces. */
function PasswordRequirements({ password }: { password: string }) {
  const reqs = [
    { label: "Vähintään 8 merkkiä", ok: password.length >= 8 },
    { label: "Iso kirjain (A–Ö)", ok: /[A-ZÅÄÖ]/.test(password) },
    { label: "Numero (0–9)", ok: /[0-9]/.test(password) },
    { label: "Erikoismerkki (!@#…)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1.5">
      {reqs.map((r) => (
        <li
          key={r.label}
          className={`flex items-center gap-1.5 text-[11px] ${r.ok ? "text-green-400" : "text-ink-ghost"}`}
        >
          {r.ok ? (
            <CheckCircle size={11} className="shrink-0" />
          ) : (
            <Circle size={11} className="shrink-0" />
          )}
          {r.label}
        </li>
      ))}
    </ul>
  );
}

/** Icon + color per timeline event type. */
const EVENT_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  login: { icon: LogIn, className: "text-green-400" },
  google_login: { icon: LogIn, className: "text-green-400" },
  logout: { icon: LogOut, className: "text-ink-ghost" },
  failed_login: { icon: ShieldAlert, className: "text-red-400" },
  password_change: { icon: KeyRound, className: "text-copper" },
  password_reset: { icon: KeyRound, className: "text-copper" },
  force_password_reset: { icon: KeyRound, className: "text-orange-300" },
  email_verified: { icon: AtSign, className: "text-green-400" },
  email_changed: { icon: AtSign, className: "text-copper" },
  phone_verified: { icon: Smartphone, className: "text-green-400" },
  phone_changed: { icon: Smartphone, className: "text-copper" },
  change_reverted: { icon: Undo2, className: "text-orange-300" },
  account_locked: { icon: Lock, className: "text-red-400" },
  account_unlocked: { icon: Lock, className: "text-green-400" },
  account_suspended: { icon: Lock, className: "text-red-400" },
  account_unsuspended: { icon: Lock, className: "text-green-400" },
  profile_update: { icon: UserRound, className: "text-ink-ghost" },
  role_changed: { icon: ShieldCheck, className: "text-copper" },
  api_key_created: { icon: Key, className: "text-copper" },
  api_key_revoked: { icon: Key, className: "text-orange-300" },
  api_key_deleted: { icon: Key, className: "text-red-400" },
};

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
      <CheckCircle size={11} /> Vahvistettu
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-400/10 text-orange-300 border border-orange-400/20">
      <AlertCircle size={11} /> Vahvistamaton
    </span>
  );
}

export function TurvallisuusClient(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 6000);
  }

  // ---- Security score ----
  const [scoreOpen, setScoreOpen] = useState(false);

  function scrollToSection(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const scoreItems: {
    label: string;
    done: boolean;
    explain: string;
    actionLabel?: string;
    action?: () => void;
  }[] = [
    {
      label: "Sähköposti vahvistettu",
      done: props.emailVerified,
      explain: props.emailVerified
        ? "Sähköpostisi on vahvistettu — sitä voi käyttää tilin palautukseen."
        : "Vahvistamaton sähköposti heikentää tilin palautusta ja ilmoitusten perillemenoa.",
      actionLabel: props.emailVerified ? undefined : "Vahvista sähköposti",
      action: props.emailVerified ? undefined : () => sendEmailVerify(),
    },
    {
      label: "Puhelinnumero vahvistettu",
      done: props.phoneVerified,
      explain: props.phoneVerified
        ? "Vahvistettu numero toimii varakanavana salasanan ja sähköpostin palautuksessa."
        : "Ilman vahvistettua numeroa et voi palauttaa tiliäsi tekstiviestillä, jos sähköposti ei ole käytettävissä.",
      actionLabel: props.phoneVerified ? undefined : "Vahvista numero",
      action: props.phoneVerified
        ? undefined
        : () => {
            setPhoneForm((f) => ({ ...f, phone: props.phone ?? "" }));
            setPhonePanel("input");
            scrollToSection("phone-section");
          },
    },
    {
      label: "Salasana asetettu",
      done: props.hasPassword,
      explain: props.hasPassword
        ? "Tililläsi on vahva salasana sähköpostikirjautumista varten."
        : "Google-tilisi rinnalle kannattaa asettaa salasana, jotta voit kirjautua myös ilman Googlea.",
      actionLabel: props.hasPassword ? undefined : "Aseta salasana",
      action: props.hasPassword
        ? undefined
        : () => scrollToSection("password-section"),
    },
    {
      label: "Kaksivaiheinen tunnistautuminen (2FA)",
      done: props.mfaEnabled,
      explain: props.mfaEnabled
        ? "2FA on käytössä — kirjautuminen vaatii myös todennussovelluksen koodin."
        : "Todennussovellukseen perustuva 2FA on tulossa pian — se nostaa pisteesi täyteen sataan.",
      actionLabel: props.mfaEnabled ? undefined : "Lue lisää",
      action: props.mfaEnabled
        ? undefined
        : () => scrollToSection("mfa-section"),
    },
  ];
  const score = scoreItems.filter((i) => i.done).length * 25;
  const scoreColor =
    score >= 75
      ? "text-green-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-orange-400";
  const missing = scoreItems.filter((i) => !i.done);

  // ---- Password change ----
  const [pw, setPw] = useState({ nykyinen: "", uusi: "", vahvista: "" });
  const [showPw, setShowPw] = useState(false);
  const [logoutOthers, setLogoutOthers] = useState(true);
  const [pwLoading, setPwLoading] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.uusi !== pw.vahvista) {
      showStatus("error", "Salasanat eivät täsmää.");
      return;
    }
    setPwLoading(true);
    const { ok, data } = await post("/api/account/password/change", {
      currentPassword: pw.nykyinen || undefined,
      newPassword: pw.uusi,
      logoutOthers,
    });
    setPwLoading(false);
    if (!ok) {
      showStatus("error", data.error ?? "Salasanan vaihto epäonnistui.");
      return;
    }
    setPw({ nykyinen: "", uusi: "", vahvista: "" });
    showStatus("success", "Salasana vaihdettu onnistuneesti.");
    router.refresh();
  }

  // ---- Email verify / change ----
  const [emailPanel, setEmailPanel] = useState<
    "closed" | "verify" | "change" | "changeCode"
  >("closed");
  const [emailForm, setEmailForm] = useState({
    password: "",
    reauthCode: "",
    newEmail: "",
  });
  const [emailCode, setEmailCode] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  async function sendEmailVerify() {
    setEmailLoading(true);
    const { ok, data } = await post(
      "/api/account/email/resend-verification",
      {},
    );
    setEmailLoading(false);
    if (!ok) {
      showStatus("error", data.error ?? "Lähetys epäonnistui.");
      return;
    }
    setCooldown(60);
    setEmailCode("");
    setEmailPanel("verify");
    showStatus("success", "Vahvistuskoodi lähetetty sähköpostiisi.");
  }

  async function confirmEmailVerify() {
    setEmailLoading(true);
    const { ok, data } = await post("/api/account/email/verify", {
      code: emailCode,
    });
    setEmailLoading(false);
    if (!ok) {
      showStatus("error", data.error ?? "Vahvistus epäonnistui.");
      return;
    }
    showStatus("success", "Sähköposti vahvistettu.");
    setEmailPanel("closed");
    router.refresh();
  }

  async function startEmailChange() {
    setEmailLoading(true);
    const { ok, data } = await post("/api/account/email/change/start", {
      newEmail: emailForm.newEmail,
      password: emailForm.password || undefined,
      reauthCode: emailForm.reauthCode || undefined,
    });
    setEmailLoading(false);
    if (!ok) {
      showStatus("error", data.error ?? "Vaihto epäonnistui.");
      return;
    }
    setEmailCode("");
    setEmailPanel("changeCode");
    showStatus(
      "success",
      `Vahvistuskoodi lähetetty osoitteeseen ${emailForm.newEmail}.`,
    );
  }

  async function confirmEmailChange() {
    setEmailLoading(true);
    const { ok, data } = await post("/api/account/email/change/confirm", {
      newEmail: emailForm.newEmail,
      code: emailCode,
    });
    setEmailLoading(false);
    if (!ok) {
      showStatus("error", data.error ?? "Vaihto epäonnistui.");
      return;
    }
    showStatus("success", "Sähköpostiosoite vaihdettu.");
    setEmailPanel("closed");
    setEmailForm({ password: "", reauthCode: "", newEmail: "" });
    router.refresh();
  }

  // ---- Phone verify / change ----
  const [phonePanel, setPhonePanel] = useState<"closed" | "input" | "code">(
    "closed",
  );
  const [phoneForm, setPhoneForm] = useState({
    phone: "",
    password: "",
    reauthCode: "",
  });
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const changingPhone = props.phoneVerified; // change flow vs initial verify

  async function sendPhoneCode() {
    setPhoneLoading(true);
    const { ok, data } = changingPhone
      ? await post("/api/account/phone/change/start", {
          newPhone: phoneForm.phone,
          password: phoneForm.password || undefined,
          reauthCode: phoneForm.reauthCode || undefined,
        })
      : await post("/api/account/phone/send-code", { phone: phoneForm.phone });
    setPhoneLoading(false);
    if (!ok) {
      showStatus("error", data.error ?? "Lähetys epäonnistui.");
      return;
    }
    setCooldown(60);
    setPhoneCode("");
    setPhonePanel("code");
    showStatus("success", "Vahvistuskoodi lähetetty tekstiviestillä.");
  }

  async function confirmPhoneCode() {
    setPhoneLoading(true);
    const { ok, data } = changingPhone
      ? await post("/api/account/phone/change/confirm", {
          newPhone: phoneForm.phone,
          code: phoneCode,
        })
      : await post("/api/account/phone/verify", {
          phone: phoneForm.phone,
          code: phoneCode,
        });
    setPhoneLoading(false);
    if (!ok) {
      showStatus("error", data.error ?? "Vahvistus epäonnistui.");
      return;
    }
    showStatus(
      "success",
      changingPhone ? "Puhelinnumero vaihdettu." : "Puhelinnumero vahvistettu.",
    );
    setPhonePanel("closed");
    setPhoneForm({ phone: "", password: "", reauthCode: "" });
    router.refresh();
  }

  // Re-auth helper for Google-only accounts inside change flows.
  async function requestReauthCode() {
    const { ok, data } = await post("/api/account/reauth/send", {});
    if (!ok) {
      showStatus("error", data.error ?? "Koodin lähetys epäonnistui.");
      return;
    }
    setCooldown(60);
    showStatus("success", "Vahvistuskoodi lähetetty sähköpostiisi.");
  }

  const needsReauthField = !props.hasPassword;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {status && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ${
            status.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          {status.message}
        </div>
      )}

      {props.forcePasswordReset && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-orange-400/10 border border-orange-400/20 text-orange-300">
          <AlertCircle size={15} className="shrink-0" />
          Ylläpito vaatii sinua vaihtamaan salasanasi ennen palvelun käytön
          jatkamista.
        </div>
      )}

      {/* ---- Security score ---- */}
      <section className="rounded-2xl bg-surface/50 border border-wire p-5">
        <button
          type="button"
          onClick={() => setScoreOpen((v) => !v)}
          aria-expanded={scoreOpen}
          className="w-full flex items-center gap-3 cursor-pointer group"
        >
          <ShieldCheck size={16} className="text-copper" />
          <h2 className="text-sm font-semibold text-ink">
            Tilin turvallisuustaso
          </h2>
          <span className={`ml-auto text-lg font-bold ${scoreColor}`}>
            {score}%
          </span>
          <ChevronDown
            size={15}
            className={`text-ink-ghost group-hover:text-ink transition-transform duration-200 ${scoreOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div className="h-2 rounded-full bg-wire overflow-hidden my-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-copper to-[#2ABFBF] transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>

        {!scoreOpen ? (
          <ul className="grid sm:grid-cols-2 gap-2">
            {scoreItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs">
                {item.done ? (
                  <CheckCircle size={13} className="text-green-400 shrink-0" />
                ) : (
                  <AlertCircle size={13} className="text-ink-ghost shrink-0" />
                )}
                <span className={item.done ? "text-ink-dim" : "text-ink-ghost"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-3">
            {scoreItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-wire"
              >
                {item.done ? (
                  <CheckCircle
                    size={15}
                    className="text-green-400 shrink-0 mt-0.5"
                  />
                ) : (
                  <AlertCircle
                    size={15}
                    className="text-orange-300 shrink-0 mt-0.5"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-medium ${item.done ? "text-ink-dim" : "text-ink"}`}
                  >
                    {item.label}
                    <span className="text-ink-ghost font-normal">
                      {" "}
                      · {item.done ? "+25 %" : "0 %"}
                    </span>
                  </p>
                  <p className="text-[11px] text-ink-ghost mt-0.5">
                    {item.explain}
                  </p>
                </div>
                {item.actionLabel && item.action && (
                  <button
                    type="button"
                    onClick={item.action}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-copper text-[#0A0C10] text-[11px] font-semibold hover:bg-copper-light transition-colors cursor-pointer"
                  >
                    {item.actionLabel}
                  </button>
                )}
              </div>
            ))}
            <p className="text-[11px] text-ink-ghost">
              {missing.length === 0
                ? "Kaikki suojaukset ovat käytössä — tilisi turvallisuustaso on 100 %."
                : `Pääset 100 %:iin suorittamalla: ${missing.map((m) => m.label.toLowerCase()).join(", ")}. Jokainen kohta nostaa tasoa 25 %.`}
            </p>
          </div>
        )}
      </section>

      {/* ---- Email ---- */}
      <section className="rounded-2xl bg-surface/50 border border-wire p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <AtSign size={16} className="text-copper" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Sähköpostiosoite</h2>
            <p className="text-xs text-ink-ghost truncate">{props.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <VerifiedBadge verified={props.emailVerified} />
          </div>
        </div>

        {emailPanel === "closed" && (
          <div className="flex gap-2">
            {!props.emailVerified && (
              <button
                onClick={sendEmailVerify}
                disabled={emailLoading || cooldown > 0}
                className="px-3.5 py-2 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {cooldown > 0
                  ? `Vahvista (${cooldown}s)`
                  : "Vahvista sähköposti"}
              </button>
            )}
            <button
              onClick={() => setEmailPanel("change")}
              className="px-3.5 py-2 rounded-lg bg-surface border border-wire text-xs font-medium text-ink hover:border-copper/40 transition-colors"
            >
              Vaihda sähköposti
            </button>
          </div>
        )}

        {emailPanel === "verify" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-ink-ghost">
              Syötä sähköpostiisi lähetetty koodi.
            </p>
            <CodeInput
              value={emailCode}
              onChange={setEmailCode}
              disabled={emailLoading}
            />
            <div className="flex gap-2">
              <button
                onClick={confirmEmailVerify}
                disabled={emailLoading || emailCode.length !== 6}
                className="flex-1 py-2.5 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                Vahvista
              </button>
              <button
                onClick={() => setEmailPanel("closed")}
                className="px-3.5 py-2.5 rounded-lg bg-surface border border-wire text-xs text-ink-dim hover:border-copper/40 transition-colors"
              >
                Peruuta
              </button>
            </div>
          </div>
        )}

        {emailPanel === "change" && (
          <div className="flex flex-col gap-3">
            {needsReauthField ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-dim">
                  Vahvistuskoodi (lähetetään nykyiseen sähköpostiisi)
                </label>
                <div className="flex gap-2">
                  <input
                    value={emailForm.reauthCode}
                    onChange={(e) =>
                      setEmailForm((f) => ({
                        ...f,
                        reauthCode: e.target.value,
                      }))
                    }
                    placeholder="6-numeroinen koodi"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={requestReauthCode}
                    disabled={cooldown > 0}
                    className="shrink-0 px-3.5 rounded-xl bg-surface border border-wire text-xs text-ink hover:border-copper/40 transition-colors disabled:opacity-50"
                  >
                    {cooldown > 0 ? `${cooldown}s` : "Lähetä koodi"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-dim">
                  Nykyinen salasana
                </label>
                <input
                  type="password"
                  value={emailForm.password}
                  onChange={(e) =>
                    setEmailForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-dim">
                Uusi sähköpostiosoite
              </label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) =>
                  setEmailForm((f) => ({ ...f, newEmail: e.target.value }))
                }
                placeholder="uusi@esimerkki.fi"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-ink-ghost">
              Vanha osoitteesi pysyy voimassa, kunnes uusi on vahvistettu.
              Ilmoitamme muutoksesta vanhaan osoitteeseen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={startEmailChange}
                disabled={emailLoading || !emailForm.newEmail}
                className="flex-1 py-2.5 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {emailLoading ? "Lähetetään..." : "Jatka"}
              </button>
              <button
                onClick={() => setEmailPanel("closed")}
                className="px-3.5 py-2.5 rounded-lg bg-surface border border-wire text-xs text-ink-dim hover:border-copper/40 transition-colors"
              >
                Peruuta
              </button>
            </div>
          </div>
        )}

        {emailPanel === "changeCode" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-ink-ghost">
              Syötä osoitteeseen {emailForm.newEmail} lähetetty koodi.
            </p>
            <CodeInput
              value={emailCode}
              onChange={setEmailCode}
              disabled={emailLoading}
            />
            <div className="flex gap-2">
              <button
                onClick={confirmEmailChange}
                disabled={emailLoading || emailCode.length !== 6}
                className="flex-1 py-2.5 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {emailLoading ? "Vaihdetaan..." : "Vaihda sähköposti"}
              </button>
              <button
                onClick={() => setEmailPanel("closed")}
                className="px-3.5 py-2.5 rounded-lg bg-surface border border-wire text-xs text-ink-dim hover:border-copper/40 transition-colors"
              >
                Peruuta
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ---- Phone ---- */}
      <section
        id="phone-section"
        className="scroll-mt-24 rounded-2xl bg-surface/50 border border-wire p-5 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <Smartphone size={16} className="text-copper" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Puhelinnumero</h2>
            <p className="text-xs text-ink-ghost truncate">
              {props.phone ?? "Ei asetettu"}
            </p>
          </div>
          <div className="ml-auto">
            <VerifiedBadge verified={props.phoneVerified} />
          </div>
        </div>

        {phonePanel === "closed" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPhoneForm((f) => ({
                  ...f,
                  phone: changingPhone ? "" : (props.phone ?? ""),
                }));
                setPhonePanel("input");
              }}
              className="px-3.5 py-2 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors"
            >
              {changingPhone ? "Vaihda numero" : "Vahvista numero"}
            </button>
          </div>
        )}

        {phonePanel === "input" && (
          <div className="flex flex-col gap-3">
            {changingPhone &&
              (needsReauthField ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-ink-dim">
                    Vahvistuskoodi (lähetetään sähköpostiisi)
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={phoneForm.reauthCode}
                      onChange={(e) =>
                        setPhoneForm((f) => ({
                          ...f,
                          reauthCode: e.target.value,
                        }))
                      }
                      placeholder="6-numeroinen koodi"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={requestReauthCode}
                      disabled={cooldown > 0}
                      className="shrink-0 px-3.5 rounded-xl bg-surface border border-wire text-xs text-ink hover:border-copper/40 transition-colors disabled:opacity-50"
                    >
                      {cooldown > 0 ? `${cooldown}s` : "Lähetä koodi"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-ink-dim">
                    Nykyinen salasana
                  </label>
                  <input
                    type="password"
                    value={phoneForm.password}
                    onChange={(e) =>
                      setPhoneForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
              ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-dim">
                {changingPhone ? "Uusi puhelinnumero" : "Puhelinnumero"}
              </label>
              <input
                type="tel"
                value={phoneForm.phone}
                onChange={(e) =>
                  setPhoneForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+358 40 123 4567"
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={sendPhoneCode}
                disabled={phoneLoading || !phoneForm.phone}
                className="flex-1 py-2.5 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {phoneLoading ? "Lähetetään..." : "Lähetä SMS-koodi"}
              </button>
              <button
                onClick={() => setPhonePanel("closed")}
                className="px-3.5 py-2.5 rounded-lg bg-surface border border-wire text-xs text-ink-dim hover:border-copper/40 transition-colors"
              >
                Peruuta
              </button>
            </div>
          </div>
        )}

        {phonePanel === "code" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-ink-ghost">
              Syötä numeroon {phoneForm.phone} lähetetty koodi.
            </p>
            <CodeInput
              value={phoneCode}
              onChange={setPhoneCode}
              disabled={phoneLoading}
            />
            <div className="flex gap-2">
              <button
                onClick={confirmPhoneCode}
                disabled={phoneLoading || phoneCode.length !== 6}
                className="flex-1 py-2.5 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {phoneLoading ? "Vahvistetaan..." : "Vahvista"}
              </button>
              <button
                onClick={() => setPhonePanel("closed")}
                className="px-3.5 py-2.5 rounded-lg bg-surface border border-wire text-xs text-ink-dim hover:border-copper/40 transition-colors"
              >
                Peruuta
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ---- Password ---- */}
      <section
        id="password-section"
        className="scroll-mt-24 rounded-2xl bg-surface/50 border border-wire p-5"
      >
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-wire">
            <AlertCircle size={15} className="text-ink-ghost mt-0.5 shrink-0" />
            <p className="text-xs text-ink-ghost">
              {props.provider === "google" && !props.hasPassword
                ? "Olet kirjautunut Google-tilillä. Voit asettaa salasanan, jolloin voit kirjautua myös sähköpostilla."
                : "Syötä nykyinen salasanasi ja valitse uusi vahva salasana."}
            </p>
          </div>

          {props.hasPassword && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-dim">
                Nykyinen salasana
              </label>
              <input
                type="password"
                value={pw.nykyinen}
                onChange={(e) =>
                  setPw((p) => ({ ...p, nykyinen: e.target.value }))
                }
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-dim">
              Uusi salasana
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={pw.uusi}
                onChange={(e) => setPw((p) => ({ ...p, uusi: e.target.value }))}
                placeholder="Vähintään 8 merkkiä"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrengthMeter password={pw.uusi} />
            {pw.uusi && <PasswordRequirements password={pw.uusi} />}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-dim">
              Vahvista uusi salasana
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={pw.vahvista}
              onChange={(e) =>
                setPw((p) => ({ ...p, vahvista: e.target.value }))
              }
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={logoutOthers}
              onChange={(e) => setLogoutOthers(e.target.checked)}
              className="w-4 h-4 accent-copper"
            />
            <span className="text-xs text-ink-ghost">
              Kirjaa ulos muilta laitteilta
            </span>
          </label>

          <button
            type="submit"
            disabled={pwLoading || !pw.uusi}
            className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
          >
            {pwLoading ? "Vaihdetaan..." : "Vaihda salasana"}
          </button>
        </form>
      </section>

      {/* ---- Two-factor authentication (schema ready, flows coming) ---- */}
      <section
        id="mfa-section"
        className="scroll-mt-24 rounded-2xl bg-surface/50 border border-wire p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck size={16} className="text-copper" />
          <h2 className="text-sm font-semibold text-ink">
            Kaksivaiheinen tunnistautuminen (2FA)
          </h2>
          <span className="ml-auto">
            <ComingSoonBadge />
          </span>
        </div>
        <p className="text-xs text-ink-ghost mb-4">
          2FA lisää kirjautumiseen toisen vaiheen: salasanan lisäksi tarvitaan
          todennussovelluksen tuottama koodi. Vaikka salasanasi vuotaisi,
          tilillesi ei pääse ilman puhelintasi.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-wire opacity-70">
            <Smartphone size={15} className="text-ink-ghost shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-ink-dim">
                Todennussovellus
              </p>
              <p className="text-[11px] text-ink-ghost">
                Google Authenticator, 1Password tai vastaava TOTP-sovellus.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-wire opacity-70">
            <Key size={15} className="text-ink-ghost shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-ink-dim">Varakoodit</p>
              <p className="text-[11px] text-ink-ghost">
                Kertakäyttöiset palautuskoodit, jos menetät todennussovelluksen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Sessions ---- */}
      <section className="rounded-2xl bg-surface/50 border border-wire p-5">
        <Link
          href="/istunnot"
          className="flex items-center gap-3 text-sm text-ink hover:text-copper transition-colors"
        >
          <Monitor size={16} className="text-copper" />
          <div>
            <p className="font-medium">Hallitse istuntoja</p>
            <p className="text-xs text-ink-ghost mt-0.5">
              Näytä laitteet, sijainnit ja kirjaudu ulos etänä
            </p>
          </div>
        </Link>
      </section>

      {/* ---- Account timeline ---- */}
      <section className="rounded-2xl bg-surface/50 border border-wire p-5">
        <div className="flex items-center gap-3 mb-4">
          <History size={16} className="text-copper" />
          <h2 className="text-sm font-semibold text-ink">Tilin tapahtumat</h2>
        </div>
        <ol className="flex flex-col">
          {props.timeline.map((event) => {
            const meta = EVENT_ICONS[event.event_type] ?? {
              icon: Clock,
              className: "text-ink-ghost",
            };
            const EventIcon = meta.icon;
            return (
              <li
                key={event.id}
                className="flex gap-3 items-start py-2.5 border-b border-wire/50 last:border-0"
              >
                <span className="w-6 h-6 rounded-lg bg-surface border border-wire flex items-center justify-center shrink-0 mt-0.5">
                  <EventIcon size={12} className={meta.className} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs ${event.event_type === "failed_login" ? "text-red-400" : "text-ink"}`}
                  >
                    {EVENT_LABELS[event.event_type] ?? event.event_type}
                  </p>
                  <p className="text-[11px] text-ink-ghost mt-0.5">
                    {new Date(event.created_at).toLocaleString("fi-FI")}
                    {event.ip_address ? ` · ${event.ip_address}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
          {props.accountCreatedAt && (
            <li className="flex gap-3 items-start py-2.5">
              <span className="w-6 h-6 rounded-lg bg-surface border border-wire flex items-center justify-center shrink-0 mt-0.5">
                <UserRound size={12} className="text-copper" />
              </span>
              <div>
                <p className="text-xs text-ink">Tili luotu</p>
                <p className="text-[11px] text-ink-ghost mt-0.5">
                  {new Date(props.accountCreatedAt).toLocaleString("fi-FI")}
                </p>
              </div>
            </li>
          )}
          {props.timeline.length === 0 && !props.accountCreatedAt && (
            <li className="text-xs text-ink-ghost py-2">
              Ei tapahtumia vielä.
            </li>
          )}
        </ol>
      </section>
    </div>
  );
}
