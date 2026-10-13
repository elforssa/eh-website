import { rateLimitHelp, rateLimitMessage } from "@/lib/crm/client";

// Inquiry submission error text. The rate-limit message links to WhatsApp so a
// blocked visitor can still reach the school. A plain <a> (not next/link)
// avoids prefetching the /contact-camp logging redirect.
export function InquiryErrorText({ message }: { message: string }) {
  if (message !== rateLimitMessage) return message;
  return <>{rateLimitHelp.text} <a href={rateLimitHelp.href} target="_blank" rel="noopener" className="underline">{rateLimitHelp.link}</a>.</>;
}
