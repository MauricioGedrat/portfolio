"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="border border-rule px-4 py-2.5 hover:border-ink">
      {label}
    </button>
  );
}
