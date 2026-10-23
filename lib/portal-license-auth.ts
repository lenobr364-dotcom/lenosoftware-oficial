import { timingSafeEqual } from "node:crypto";

import { VAULT_ACCESS_KEY } from "@/lib/vault-access";
import { isPortalLicensePayloadActive, unsealPortalLicenseToken } from "@/lib/license-sealed-token";
import { validateLicenseRemote } from "@/lib/license-remote-api";
import { toSealedPortalLicenseToken } from "@/types/licensing";

export type PortalAuthRequestBody = {
  key?: unknown;
  licenseToken?: unknown;
  licenseId?: unknown;
};

export type PortalAuthorizationResult =
  | { ok: true; subject: string; channel: "sealed" | "remote_id" | "master" }
  | { ok: false };

function utf8TimingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function softFailRemote(): boolean {
  return process.env.LICENSE_REMOTE_SOFT_FAIL?.trim() === "true";
}

function remoteHardDenyReason(reason: string): boolean {
  return reason === "license_api_forbidden" || reason === "license_api_rejected";
}

const MASTER_SUBJECT = "portal:master-key";

/**
 * Portal gate for `/api/auth`: sealed license token (AES-GCM), optional remote desk, ou chave mestra legada.
 */
export async function evaluatePortalAuthorization(body: PortalAuthRequestBody): Promise<PortalAuthorizationResult> {
  const sealed = typeof body.licenseToken === "string" ? body.licenseToken.trim() : "";
  if (sealed.length > 0) {
    const payload = unsealPortalLicenseToken(toSealedPortalLicenseToken(sealed));
    if (!payload || !isPortalLicensePayloadActive(payload)) {
      return { ok: false };
    }

    const remoteBase = process.env.LICENSE_API_BASE_URL?.trim();
    if (remoteBase) {
      const remote = await validateLicenseRemote({ subject: payload.sub, tier: payload.tier });
      if (remote.ok) return { ok: true, subject: payload.sub, channel: "sealed" };
      if (softFailRemote() && !remoteHardDenyReason(remote.reason)) {
        return { ok: true, subject: payload.sub, channel: "sealed" };
      }
      return { ok: false };
    }

    return { ok: true, subject: payload.sub, channel: "sealed" };
  }

  const licenseId = typeof body.licenseId === "string" ? body.licenseId.trim() : "";
  if (licenseId.length > 0) {
    const remoteBase = process.env.LICENSE_API_BASE_URL?.trim();
    if (!remoteBase) {
      return { ok: false };
    }
    const remote = await validateLicenseRemote({ subject: licenseId });
    if (!remote.ok) return { ok: false };
    return { ok: true, subject: `remote:${licenseId}`, channel: "remote_id" };
  }

  const providedKey = typeof body.key === "string" ? body.key.trim() : "";
  const effectiveVaultKey = process.env.AUTH_MASTER_KEY?.trim() || VAULT_ACCESS_KEY;
  if (utf8TimingSafeEqual(providedKey, effectiveVaultKey)) {
    return { ok: true, subject: MASTER_SUBJECT, channel: "master" };
  }
  return { ok: false };
}

/** @deprecated Prefer evaluatePortalAuthorization for cookies de sessão. */
export async function authorizePortalRequest(body: PortalAuthRequestBody): Promise<boolean> {
  const r = await evaluatePortalAuthorization(body);
  return r.ok;
}
