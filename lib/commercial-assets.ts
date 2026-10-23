/** Stable keys for commercial funnel (URLs, mock reference data, i18n). */
export const COMMERCIAL_ASSET_KEYS = ["solupan", "intercap", "arla32", "detergentPremium", "softenerPro"] as const;

export type CommercialAssetKey = (typeof COMMERCIAL_ASSET_KEYS)[number];

export const COMMERCIAL_ASSET_REFERENCE: Record<CommercialAssetKey, { baseCost: number; suggestedPrice: number }> = {
  solupan: { baseCost: 12_400, suggestedPrice: 18_900 },
  intercap: { baseCost: 8_200, suggestedPrice: 13_250 },
  arla32: { baseCost: 3_400, suggestedPrice: 5_100 },
  detergentPremium: { baseCost: 6_800, suggestedPrice: 11_200 },
  softenerPro: { baseCost: 5_900, suggestedPrice: 9_800 },
};

export function isCommercialAssetKey(value: string): value is CommercialAssetKey {
  return (COMMERCIAL_ASSET_KEYS as readonly string[]).includes(value);
}
