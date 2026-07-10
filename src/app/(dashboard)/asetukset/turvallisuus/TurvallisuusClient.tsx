"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AtSign,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  History,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { CodeInput } from "@/components/shared/CodeInput";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
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
  const scoreItems = [
    { label: "Sähköposti vahvistettu", done: props.emailVerified },
    { label: "Puhelinnumero vahvistettu", done: props.phoneVerified },
    { label: "Salasana asetettu", done: props.hasPassword },
    { label: "Kaksivaiheinen tunnistus (tulossa)", done: props.mfaEnabled },
  ];
  const score = scoreItems.filter((i) => i.done).length * 25;
  const scoreColor =
    score >= 75
      ? "text-green-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-orange-400";

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
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={16} className="text-copper" />
          <h2 className="text-sm font-semibold text-ink">
            Tilin turvallisuustaso
          </h2>
          <span className={`ml-auto text-lg font-bold ${scoreColor}`}>
            {score}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-wire overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-copper to-[#2ABFBF] transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
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
      <section className="rounded-2xl bg-surface/50 border border-wire p-5 flex flex-col gap-4">
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
      <section className="rounded-2xl bg-surface/50 border border-wire p-5">
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
              Näytä ja kirjaudu ulos aktiivisilta laitteilta
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
          {props.timeline.map((event) => (
            <li
              key={event.id}
              className="flex gap-3 items-start py-2.5 border-b border-wire/50 last:border-0"
            >
              <Clock size={13} className="text-ink-ghost mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink">
                  {EVENT_LABELS[event.event_type] ?? event.event_type}
                </p>
                <p className="text-[11px] text-ink-ghost mt-0.5">
                  {new Date(event.created_at).toLocaleString("fi-FI")}
                  {event.ip_address ? ` · ${event.ip_address}` : ""}
                </p>
              </div>
            </li>
          ))}
          {props.accountCreatedAt && (
            <li className="flex gap-3 items-start py-2.5">
              <Clock size={13} className="text-ink-ghost mt-0.5 shrink-0" />
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
