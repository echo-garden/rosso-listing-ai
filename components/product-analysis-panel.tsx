import type { ProductAnalysis } from "@prisma/client";
import { applyProductAnalysis } from "@/app/actions";
import { Button, Card } from "@/components/ui";

type BrandCandidate = {
  name?: string;
  confidence?: number;
  reason?: string;
};

type ReferenceSource = {
  label?: string;
  type?: string;
  url?: string | null;
  note?: string;
};

export function ProductAnalysisPanel({
  productId,
  analysis
}: {
  productId: string;
  analysis: ProductAnalysis | null;
}) {
  const applyAction = applyProductAnalysis.bind(null, productId);

  return (
    <Card className="mt-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">AI image analysis</h2>
          <p className="mt-1 text-sm text-zinc-600">画像から候補を作ります。ブランド、サイズ、価格は必ず確認してください。</p>
        </div>
        {analysis?.mockMode ? <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">Mock</span> : null}
      </div>

      <form action={`/api/products/${productId}/analyze`} method="post">
        <Button type="submit" className="w-full">
          Analyze images
        </Button>
      </form>

      {analysis ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Candidate label="Type" value={analysis.productType} confidence={analysis.productTypeConfidence} />
            <Candidate label="Brand" value={analysis.brandName} confidence={analysis.brandConfidence} />
            <Candidate label="Character" value={analysis.characterName} confidence={analysis.characterConfidence} />
            <Candidate label="Size" value={analysis.size} confidence={analysis.sizeConfidence} />
            <Candidate label="Color" value={analysis.color} confidence={analysis.colorConfidence} />
            <Candidate
              label="Price"
              value={analysis.recommendedPrice ? `${analysis.recommendedPrice.toLocaleString()}円` : ""}
              subValue={
                analysis.priceMin || analysis.priceMax
                  ? `${analysis.priceMin?.toLocaleString() ?? "-"}円 - ${analysis.priceMax?.toLocaleString() ?? "-"}円`
                  : ""
              }
            />
          </div>

          {analysis.conditionSummary ? (
            <TextBlock label="Condition candidate" value={analysis.conditionSummary} />
          ) : null}
          {analysis.tags ? <TextBlock label="Image tags" value={analysis.tags} /> : null}
          {analysis.priceReason ? <TextBlock label="Price reason" value={analysis.priceReason} /> : null}
          {analysis.warnings ? <TextBlock label="Warnings" value={analysis.warnings} /> : null}

          <BrandCandidates value={analysis.brandCandidates} />
          <ReferenceSources value={analysis.referenceSources} />

          <form action={applyAction}>
            <Button type="submit" className="w-full">
              Apply candidates to product
            </Button>
          </form>
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-600">
          画像アップロード後に解析すると、商品タイプ、ブランド候補、サイズ、色、状態、価格候補を作成します。
        </p>
      )}
    </Card>
  );
}

function ReferenceSources({ value }: { value: unknown }) {
  const sources = Array.isArray(value) ? (value as ReferenceSource[]) : [];
  if (sources.length === 0) return null;

  return (
    <div className="border-t border-zinc-200 pt-3">
      <p className="text-xs font-semibold uppercase text-zinc-500">Debug references</p>
      <div className="mt-2 space-y-2">
        {sources.map((source, index) => (
          <div key={`${source.label}-${index}`} className="rounded-md bg-zinc-50 p-2 text-sm">
            <p className="font-semibold">{source.label ?? source.type ?? "Reference"}</p>
            {source.url ? (
              <a href={source.url} className="mt-1 block break-all text-rosso-700 underline">
                {source.url}
              </a>
            ) : (
              <p className="mt-1 text-zinc-600">URLなし</p>
            )}
            {source.note ? <p className="mt-1 text-zinc-600">{source.note}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Candidate({
  label,
  value,
  subValue,
  confidence
}: {
  label: string;
  value: string | null;
  subValue?: string;
  confidence?: number | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold">{value || "-"}</p>
      {subValue ? <p className="mt-1 text-xs text-zinc-500">{subValue}</p> : null}
      {confidence != null ? <p className="mt-1 text-xs text-zinc-500">confidence {Math.round(confidence * 100)}%</p> : null}
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-zinc-200 pt-3">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}

function BrandCandidates({ value }: { value: unknown }) {
  const candidates = Array.isArray(value) ? (value as BrandCandidate[]) : [];
  if (candidates.length === 0) return null;

  return (
    <div className="border-t border-zinc-200 pt-3">
      <p className="text-xs font-semibold uppercase text-zinc-500">Brand candidates</p>
      <div className="mt-2 space-y-2">
        {candidates.map((candidate, index) => (
          <div key={`${candidate.name}-${index}`} className="rounded-md bg-zinc-50 p-2 text-sm">
            <p className="font-semibold">
              {candidate.name} {candidate.confidence != null ? `(${Math.round(candidate.confidence * 100)}%)` : ""}
            </p>
            {candidate.reason ? <p className="mt-1 text-zinc-600">{candidate.reason}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
