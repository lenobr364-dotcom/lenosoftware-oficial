import { SecuritySeverity } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { applyCoreLicenseCookie, mintCoreLicenseSession } from "@/lib/core-license-session";
import { assertGeoAccessForSubject, evaluateRegionalMassAnomaly } from "@/lib/license-geofence";
import { evaluatePortalAuthorization } from "@/lib/portal-license-auth";
import { clientIpHint, inferRegionFromHeaders } from "@/lib/request-meta";
import {
  computeGateToken,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/lib/vault-session";
import { recordLicenseActivity, recordSecurityEvent } from "@/lib/telemetry-db";
import { dispatchLicenseActivatedWebhook } from "@/lib/webhook-dispatch";
import { portalAuthBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

function telemetryChannel(channel: "sealed" | "remote_id" | "master"): string {
  if (channel === "sealed") return "portal_sealed";
  if (channel === "remote_id") return "portal_remote";
  return "portal_master";
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = portalAuthBodySchema.safeParse(raw);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const record = parsed.data;
  const auth = await evaluatePortalAuthorization({
    key: record.key,
    licenseToken: record.licenseToken,
    licenseId: record.licenseId,
  });

  const region = inferRegionFromHeaders(request);
  const ip = clientIpHint(request);

  if (!auth.ok) {
    void recordSecurityEvent({
      type: "portal_auth_failure",
      severity: SecuritySeverity.WARNING,
      title: "Portal authentication failed",
      detail: "Invalid key, license token, or remote license desk rejection.",
      requestPath: "/api/auth",
      requestId: null,
      ip,
      userAgent: request.headers.get("user-agent"),
      region,
    });
    return NextResponse.json({ authorized: false as const });
  }

  const access = await assertGeoAccessForSubject(auth.subject, region);
  if (!access.ok) {
    if (access.reason === "geo_policy") {
      void recordLicenseActivity({
        subject: auth.subject,
        channel: "portal_geo_off_region",
        region,
        ip,
      });
      void recordSecurityEvent({
        type: "geofence_policy_denied",
        severity: SecuritySeverity.WARNING,
        title: "Geofencing: login denied (region not allowed for license)",
        detail: `subject=${auth.subject}; region=${region}`,
        requestPath: "/api/auth",
        requestId: null,
        ip,
        userAgent: request.headers.get("user-agent"),
        region,
      });
      void evaluateRegionalMassAnomaly(auth.subject);
    } else {
      void recordSecurityEvent({
        type: "portal_license_suspended",
        severity: SecuritySeverity.WARNING,
        title: "Portal login blocked: license temporarily suspended",
        detail: `subject=${auth.subject}`,
        requestPath: "/api/auth",
        requestId: null,
        ip,
        userAgent: request.headers.get("user-agent"),
        region,
      });
    }
    return NextResponse.json({ authorized: false as const, reason: access.reason });
  }

  void recordLicenseActivity({
    subject: auth.subject,
    channel: telemetryChannel(auth.channel),
    region,
    ip,
  });
  void evaluateRegionalMassAnomaly(auth.subject);

  const res = NextResponse.json({ authorized: true as const });

  const token = computeGateToken();
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  const core = await mintCoreLicenseSession(auth.subject, SESSION_COOKIE_MAX_AGE);
  applyCoreLicenseCookie(res, core);

  dispatchLicenseActivatedWebhook({
    source: "portal",
    subject: auth.subject,
    region,
    ip,
    channel: telemetryChannel(auth.channel),
  });

  return res;
}
