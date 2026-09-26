"use client";

import Link from "next/link";

export function InquiryConsent({ checked, onChange, error }: {
  checked: boolean; onChange: (value: boolean) => void; error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-navy-deep">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}
          aria-required="true" aria-invalid={Boolean(error)} className="mt-1 h-4 w-4 flex-none accent-navy-primary" />
        <span>J’accepte que English Hills utilise mes coordonnées et les informations de ce formulaire pour me recontacter au sujet de ma demande. J’ai lu la <Link href="/privacy" target="_blank" className="font-bold underline">Politique de confidentialité</Link>. <span aria-hidden="true">*</span></span>
      </label>
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
