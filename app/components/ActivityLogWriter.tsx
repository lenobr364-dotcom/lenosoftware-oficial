"use client";

import { appendFormulaViewLog } from "@/lib/activity-log";
import { useEffect, useRef } from "react";

type Props = {
  formulaId: string;
  formulaName: string;
  actorRole?: string;
};

export function ActivityLogWriter({ formulaId, formulaName, actorRole = "Admin" }: Props) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    appendFormulaViewLog(formulaId, formulaName, actorRole);
  }, [formulaId, formulaName, actorRole]);

  return null;
}
