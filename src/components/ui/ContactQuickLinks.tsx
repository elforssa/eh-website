import { MapPin, MessageCircle, Phone } from "lucide-react";

export const CONTACT_PAGE_HREF = "/contact";
export const PHONE_HREF = "tel:+212664239091";
export const PHONE_DISPLAY = "+212 6 64 23 90 91";
export const WHATSAPP_HREF = "https://wa.me/212664239091";
export const VISIT_HREF =
  "https://www.google.com/maps/search/?api=1&query=English+Hills+Almaz+2+Hills+Business+Center+Casablanca";

/**
 * Small secondary row of direct contact options (call / WhatsApp / visit),
 * shown under a « Nous contacter » button where the layout has room.
 * `tone="dark"` is for navy/dark backgrounds.
 */
export function ContactQuickLinks({
  tone = "light",
  showVisit = true,
  className = "",
}: {
  tone?: "light" | "dark";
  showVisit?: boolean;
  className?: string;
}) {
  const linkClass =
    tone === "dark"
      ? "inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
      : "inline-flex items-center gap-1.5 text-gray-500 hover:text-navy-primary transition-colors";

  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium ${className}`}>
      <a href={PHONE_HREF} className={linkClass} aria-label={`Appeler le ${PHONE_DISPLAY}`}>
        <Phone className="w-4 h-4" aria-hidden="true" />
        Appeler
      </a>
      <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        WhatsApp
      </a>
      {showVisit && (
        <a href={VISIT_HREF} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <MapPin className="w-4 h-4" aria-hidden="true" />
          Nous rendre visite
        </a>
      )}
    </div>
  );
}
