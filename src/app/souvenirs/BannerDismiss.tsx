"use client";

/**
 * Client dismiss button for SouvenirsBanner. Hides the banner by finding its
 * ancestor via a data attribute, so the banner itself can stay a Server
 * Component. Mirrors the site's existing announcement-bar close button.
 */
export function BannerDismiss() {
  return (
    <button
      type="button"
      aria-label="Fermer"
      onClick={(e) => {
        const banner = (e.currentTarget as HTMLElement).closest<HTMLElement>(
          "[data-souvenirs-banner]",
        );
        if (banner) banner.style.display = "none";
      }}
      className="p-1 ml-4 text-camp-cream/80 hover:text-camp-cream"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
