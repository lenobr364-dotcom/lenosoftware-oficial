import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";

import type { GeoCrsHint, ParsedGeoRecord } from "@/lib/geo/types";

export type StoredGeoIngest = {
  id: string;
  fileName: string;
  crsDetected: GeoCrsHint;
  points: ParsedGeoRecord[];
  warnings: string[];
  ingestedAt: string;
};

function ingestDir(): string {
  return path.join(process.cwd(), "chemvault-public", "nexus-geo-ingest");
}

export async function saveGeoIngest(
  fileName: string,
  payload: Omit<StoredGeoIngest, "id" | "ingestedAt" | "fileName"> & { points: ParsedGeoRecord[] },
): Promise<StoredGeoIngest> {
  const id = `geo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record: StoredGeoIngest = {
    id,
    fileName,
    crsDetected: payload.crsDetected,
    points: payload.points,
    warnings: payload.warnings,
    ingestedAt: new Date().toISOString(),
  };
  const dir = ingestDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function listGeoIngests(): Promise<StoredGeoIngest[]> {
  const dir = ingestDir();
  try {
    const files = await readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const records: StoredGeoIngest[] = [];
    for (const file of jsonFiles.slice(-20)) {
      try {
        const raw = await readFile(path.join(dir, file), "utf8");
        records.push(JSON.parse(raw) as StoredGeoIngest);
      } catch {
        /* skip corrupt */
      }
    }
    return records.sort((a, b) => Date.parse(b.ingestedAt) - Date.parse(a.ingestedAt));
  } catch {
    return [];
  }
}

export async function loadAllIngestedPoints(): Promise<ParsedGeoRecord[]> {
  const ingests = await listGeoIngests();
  return ingests.flatMap((i) => i.points);
}
