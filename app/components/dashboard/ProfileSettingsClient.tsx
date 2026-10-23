"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

type ProfileState = {
  hasDatabasePassword: boolean;
  adminMfaModeOverride: string | null;
  totpUsesDatabaseSecret: boolean;
  activeMfaFactor: "totp" | "email" | null;
  totpSecretConfigured: boolean;
};

const MFA_OPTIONS = [
  { value: "", labelKey: "profileMfaOptionDefault" as const },
  { value: "off", labelKey: "profileMfaOptionOff" as const },
  { value: "totp", labelKey: "profileMfaOptionTotp" as const },
  { value: "email", labelKey: "profileMfaOptionEmail" as const },
  { value: "totp|email", labelKey: "profileMfaOptionTotpEmail" as const },
  { value: "email|totp", labelKey: "profileMfaOptionEmailTotp" as const },
];

export function ProfileSettingsClient() {
  const t = useTranslations("Dashboard");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mfaSelect, setMfaSelect] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/profile", { credentials: "include" });
      const j = (await r.json()) as ProfileState & { ok?: boolean };
      if (!r.ok || !j.ok) {
        toast.error(t("profileLoadError"));
        return;
      }
      setProfile({
        hasDatabasePassword: j.hasDatabasePassword,
        adminMfaModeOverride: j.adminMfaModeOverride,
        totpUsesDatabaseSecret: j.totpUsesDatabaseSecret,
        activeMfaFactor: j.activeMfaFactor,
        totpSecretConfigured: j.totpSecretConfigured,
      });
      const o = j.adminMfaModeOverride;
      setMfaSelect(o === null || o === undefined ? "" : o);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const savePassword = async () => {
    if (!newPassword || newPassword.length < 12) {
      toast.error(t("profilePasswordTooShort"));
      return;
    }
    try {
      const r = await fetch("/api/admin/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const j = await r.json();
      if (!r.ok) {
        toast.error(j.error === "invalid_current_password" ? t("profileBadCurrentPassword") : t("profileSaveError"));
        return;
      }
      toast.success(t("profilePasswordSaved"));
      setNewPassword("");
      setCurrentPassword("");
      await load();
    } catch {
      toast.error(t("profileSaveError"));
    }
  };

  const saveMfa = async () => {
    const adminMfaModeOverride = mfaSelect === "" ? null : mfaSelect;
    try {
      const r = await fetch("/api/admin/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, adminMfaModeOverride }),
      });
      const j = await r.json();
      if (!r.ok) {
        if (j.error === "invalid_mfa_configuration") toast.error(t("profileMfaInvalidConfig"));
        else if (j.error === "invalid_current_password") toast.error(t("profileBadCurrentPassword"));
        else toast.error(t("profileSaveError"));
        return;
      }
      toast.success(t("profileMfaSaved"));
      await load();
    } catch {
      toast.error(t("profileSaveError"));
    }
  };

  const startTotp = async () => {
    try {
      const r = await fetch("/api/admin/profile/totp-start", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword }),
      });
      const j = await r.json();
      if (!r.ok) {
        toast.error(j.error === "invalid_current_password" ? t("profileBadCurrentPassword") : t("profileTotpStartError"));
        return;
      }
      setOtpauthUrl(j.otpauthUrl as string);
      toast.success(t("profileTotpScanHint"));
    } catch {
      toast.error(t("profileTotpStartError"));
    }
  };

  const verifyTotp = async () => {
    try {
      const r = await fetch("/api/admin/profile/totp-verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
      });
      const j = await r.json();
      if (!r.ok) {
        toast.error(j.error === "invalid_totp" ? t("profileTotpInvalid") : t("profileTotpVerifyError"));
        return;
      }
      setOtpauthUrl(null);
      setTotpCode("");
      toast.success(t("profileTotpSaved"));
      await load();
    } catch {
      toast.error(t("profileTotpVerifyError"));
    }
  };

  if (loading && !profile) {
    return (
      <p className="mx-auto max-w-2xl px-6 py-16 text-sm text-neutral-500 md:px-12" aria-live="polite">
        {t("profileLoading")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-6 py-10 md:px-12">
      <section
        className={[
          "rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(34,211,238,0.06)]",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        <h2 className="text-lg font-semibold text-white">{t("profilePasswordTitle")}</h2>
        <p className="mt-1 text-xs text-neutral-500">{t("profilePasswordHint")}</p>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">{t("profileFieldCurrentPassword")}</label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-cyan-400/30 focus:ring-2"
          />
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">{t("profileFieldNewPassword")}</label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-cyan-400/30 focus:ring-2"
          />
          <button
            type="button"
            onClick={() => void savePassword()}
            className="mt-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-500/20"
          >
            {t("profilePasswordSave")}
          </button>
        </div>
      </section>

      <section
        className={[
          "rounded-3xl border border-fuchsia-500/15 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(232,121,249,0.07)]",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        <h2 className="text-lg font-semibold text-white">{t("profileMfaTitle")}</h2>
        <p className="mt-1 text-xs text-neutral-500">{t("profileMfaHint")}</p>
        {profile && (
          <p className="mt-2 text-xs text-cyan-200/80">
            {t("profileMfaActive", { factor: profile.activeMfaFactor ?? t("profileMfaNone") })}
            {" · "}
            {t("profileMfaTotpReady", { ready: profile.totpSecretConfigured ? t("profileYes") : t("profileNo") })}
          </p>
        )}
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">{t("profileFieldCurrentPassword")}</label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-fuchsia-400/30 focus:ring-2"
          />
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">{t("profileMfaPolicyLabel")}</label>
          <select
            value={mfaSelect}
            onChange={(e) => setMfaSelect(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-fuchsia-400/30 focus:ring-2"
          >
            {MFA_OPTIONS.map((o) => (
              <option key={o.value || "default"} value={o.value} className="bg-neutral-900">
                {t(o.labelKey)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void saveMfa()}
            className="mt-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-fuchsia-100 transition hover:bg-fuchsia-500/20"
          >
            {t("profileMfaSave")}
          </button>
        </div>
      </section>

      <section
        className={[
          "rounded-3xl border border-emerald-400/20 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(52,211,153,0.06)]",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        <h2 className="text-lg font-semibold text-white">{t("profileTotpTitle")}</h2>
        <p className="mt-1 text-xs text-neutral-500">{t("profileTotpHint")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void startTotp()}
            className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-emerald-100 transition hover:bg-emerald-500/20"
          >
            {t("profileTotpStart")}
          </button>
        </div>
        {otpauthUrl && (
          <div className="mt-6 flex flex-col items-start gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
            <QRCodeSVG value={otpauthUrl} size={160} level="M" className="rounded-xl border border-white/10 bg-white p-2" />
            <div className="flex-1 space-y-3">
              <p className="text-xs text-neutral-400">{t("profileTotpEnterCode")}</p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full max-w-xs rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm tracking-widest text-white outline-none"
                placeholder="000000"
              />
              <button
                type="button"
                onClick={() => void verifyTotp()}
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-50"
              >
                {t("profileTotpVerify")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
