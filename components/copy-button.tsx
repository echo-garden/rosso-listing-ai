"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="min-h-10 rounded-md border border-zinc-300 px-3 text-xs font-bold text-zinc-800"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
