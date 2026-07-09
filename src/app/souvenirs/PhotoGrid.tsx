"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Photo = { name: string; url: string };

/**
 * Client grid with a click-to-enlarge lightbox. Signed URLs are generated
 * server-side and passed in as props — this component never fetches anything.
 */
export function PhotoGrid({ photos, label }: { photos: Photo[]; label: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const show = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  // Keyboard controls + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(1);
      else if (e.key === "ArrowLeft") show(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, show]);

  const current = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <li key={photo.name}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Agrandir la photo ${index + 1} sur ${photos.length}`}
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl border border-camp-navy/10 bg-camp-navy/5 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camp-gold"
            >
              <Image
                src={photo.url}
                alt={`Photo souvenir — ${label}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo agrandie — ${label}`}
          onClick={close}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
          >
            ×
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  show(-1);
                }}
                aria-label="Photo précédente"
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition-colors hover:bg-white/20 sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  show(1);
                }}
                aria-label="Photo suivante"
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition-colors hover:bg-white/20 sm:right-4"
              >
                ›
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-camp-sans text-sm text-white/80">
                {openIndex! + 1} / {photos.length}
              </p>
            </>
          )}

          {/* The image itself — clicking it should not close the overlay. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[85vh] w-[92vw] max-w-6xl"
          >
            <Image
              src={current.url}
              alt={`Photo souvenir agrandie — ${label}`}
              fill
              sizes="92vw"
              priority
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
