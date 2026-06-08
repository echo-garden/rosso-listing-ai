import type { BrandCandidate, ProductImageAnalysis } from "@/lib/ai/analyze";

const BRAND_CATALOG = [
  "Disney",
  "Nike",
  "adidas",
  "Puma",
  "Converse",
  "Vans",
  "Champion",
  "Levi's",
  "Carhartt",
  "The North Face",
  "Supreme",
  "Stussy",
  "Uniqlo",
  "GU"
];

export function normalizeBrandCandidates(analysis: ProductImageAnalysis): ProductImageAnalysis {
  const candidates = analysis.brandCandidates.map(normalizeCandidate);
  const matched = candidates.find((candidate) => candidate.name && isCatalogBrand(candidate.name));

  return {
    ...analysis,
    brandName: matched?.name ?? analysis.brandName,
    brandConfidence: matched ? Math.max(analysis.brandConfidence, matched.confidence) : analysis.brandConfidence,
    brandCandidates: candidates
  };
}

function normalizeCandidate(candidate: BrandCandidate): BrandCandidate {
  const catalogName = BRAND_CATALOG.find((brand) => sameBrandName(brand, candidate.name));
  if (!catalogName) return candidate;

  return {
    ...candidate,
    name: catalogName,
    reason: candidate.reason ? `${candidate.reason} / Known brand catalog match.` : "Known brand catalog match."
  };
}

function isCatalogBrand(name: string) {
  return BRAND_CATALOG.some((brand) => sameBrandName(brand, name));
}

function sameBrandName(a: string, b: string) {
  return normalizeBrandName(a) === normalizeBrandName(b);
}

function normalizeBrandName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
