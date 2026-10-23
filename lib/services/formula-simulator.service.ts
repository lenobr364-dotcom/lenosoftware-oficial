import { assertGeoAccessForSubject } from "@/lib/license-geofence";
import { runFormulaSimulation } from "@/lib/simulator/stability-engine";
import type { FormulaSimulatorReport, RunSimulatorInput } from "@/lib/simulator/types";
import { resolveRegionFromGeo } from "@/lib/simulator/regional-compliance";

export async function executeFormulaSimulation(
  input: RunSimulatorInput,
): Promise<FormulaSimulatorReport & { geoAllowed: boolean }> {
  const region = resolveRegionFromGeo({
    lat: input.coordinates?.lat,
    lng: input.coordinates?.lng,
    regionCode: input.regionCode,
  });

  const geo = await assertGeoAccessForSubject(input.actorSubject, region.regionCode);
  if (!geo.ok) {
    const report = runFormulaSimulation(input);
    return {
      ...report,
      geoAllowed: false,
      overallPassed: false,
      logs: [
        ...report.logs,
        {
          id: `log_geo_${Date.now()}`,
          at: new Date().toISOString(),
          level: "error",
          phase: "regional",
          messageKey: geo.reason === "suspended" ? "logGeoSuspended" : "logGeoDenied",
          messageParams: { region: region.regionCode },
        },
      ],
    };
  }

  const report = runFormulaSimulation(input);
  return { ...report, geoAllowed: true };
}
