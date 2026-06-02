"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";

type GeneratedContentValue = {
  mercariTitle: string;
  mercariDescription: string;
  instagramCaption: string;
  onlineStoreDescription: string;
  hashtags: string;
  priceSuggestion: string;
  conditionText: string;
  checkPoints: string;
  riskWarnings: string;
};

const fields: Array<{ key: keyof GeneratedContentValue; label: string; copy?: boolean; rows?: number }> = [
  { key: "mercariTitle", label: "Mercari title", copy: true, rows: 2 },
  { key: "mercariDescription", label: "Mercari description", copy: true, rows: 7 },
  { key: "instagramCaption", label: "Instagram caption", copy: true, rows: 6 },
  { key: "onlineStoreDescription", label: "Online store description", copy: true, rows: 5 },
  { key: "hashtags", label: "Hashtags", copy: true, rows: 3 },
  { key: "priceSuggestion", label: "Price suggestion", rows: 2 },
  { key: "conditionText", label: "Condition text", rows: 3 },
  { key: "checkPoints", label: "Check points", rows: 4 },
  { key: "riskWarnings", label: "Risk warnings", rows: 4 }
];

export function GeneratedContentForm({
  productId,
  initialValue
}: {
  productId: string;
  initialValue: GeneratedContentValue;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const response = await fetch(`/api/products/${productId}/generated`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value)
    });
    setSaving(false);
    if (response.ok) {
      setSaved(true);
    }
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="text-sm font-semibold text-zinc-700">{field.label}</label>
            {field.copy ? <CopyButton text={value[field.key]} /> : null}
          </div>
          <textarea
            value={value[field.key]}
            rows={field.rows ?? 3}
            onChange={(event) => setValue((current) => ({ ...current, [field.key]: event.target.value }))}
            className="w-full rounded-md border border-zinc-300 px-3 py-3"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="min-h-12 w-full rounded-md bg-rosso-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save generated content"}
      </button>
      {saved ? <p className="text-sm font-semibold text-rosso-700">Saved.</p> : null}
    </div>
  );
}
