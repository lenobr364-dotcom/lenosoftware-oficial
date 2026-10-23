/**
 * ChemVault Academy curriculum tracks — content shells; lessons wire up progressively.
 */
export type CourseModuleStatus = "ready" | "draft";

export type CourseModuleDef = {
  id: string;
  titleKey:
    | "courseModuleSafetyTitle"
    | "courseModuleSurfactantTitle"
    | "courseModuleArlaTitle"
    | "courseModuleLicensingTitle"
    | "courseModuleEcoBocalTitle"
    | "courseModuleOmegaTitle";
  summaryKey:
    | "courseModuleSafetySummary"
    | "courseModuleSurfactantSummary"
    | "courseModuleArlaSummary"
    | "courseModuleLicensingSummary"
    | "courseModuleEcoBocalSummary"
    | "courseModuleOmegaSummary";
  status: CourseModuleStatus;
};

export const CHEMVAULT_COURSE_MODULES: CourseModuleDef[] = [
  {
    id: "safety-sds",
    titleKey: "courseModuleSafetyTitle",
    summaryKey: "courseModuleSafetySummary",
    status: "ready",
  },
  {
    id: "surfactant-economics",
    titleKey: "courseModuleSurfactantTitle",
    summaryKey: "courseModuleSurfactantSummary",
    status: "ready",
  },
  {
    id: "scr-arla-logistics",
    titleKey: "courseModuleArlaTitle",
    summaryKey: "courseModuleArlaSummary",
    status: "draft",
  },
  {
    id: "licensing-desk",
    titleKey: "courseModuleLicensingTitle",
    summaryKey: "courseModuleLicensingSummary",
    status: "draft",
  },
  {
    id: "eco-bocal-telemetry",
    titleKey: "courseModuleEcoBocalTitle",
    summaryKey: "courseModuleEcoBocalSummary",
    status: "draft",
  },
  {
    id: "omega-sentinel",
    titleKey: "courseModuleOmegaTitle",
    summaryKey: "courseModuleOmegaSummary",
    status: "draft",
  },
];
