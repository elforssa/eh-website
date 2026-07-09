"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { verifyCode, type VerifyCodeState } from "./actions";

const initialState: VerifyCodeState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-camp-navy px-6 py-3 font-camp-sans text-base font-semibold text-white transition-colors hover:bg-camp-navy/90 focus-visible:outline-camp-gold disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Vérification…" : "Accéder aux souvenirs"}
    </button>
  );
}

export function AccessGate() {
  const [state, formAction] = useActionState(verifyCode, initialState);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-camp-cream px-4 py-16 font-camp-sans">
      <div className="w-full max-w-md rounded-2xl border-2 border-camp-navy bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <Image
            src="/eh-logo-new.png"
            alt="English Hills"
            width={80}
            height={80}
            className="h-20 w-auto object-contain"
            priority
          />
        </div>

        <h1 className="font-camp-serif text-3xl leading-tight text-camp-navy sm:text-4xl">
          Les souvenirs de l&apos;été
        </h1>
        <p className="mt-2 font-camp-sans text-sm font-medium uppercase tracking-wide text-camp-gold">
          Active Minds Summer Camp
        </p>

        <p className="mt-5 font-camp-sans text-sm text-camp-navy/70">
          Cet espace est réservé aux familles du camp. Veuillez saisir votre code
          d&apos;accès pour découvrir les photos et la vidéo souvenir.
        </p>

        <form action={formAction} className="mt-7 space-y-4">
          <div className="text-left">
            <label
              htmlFor="code"
              className="mb-1.5 block font-camp-sans text-sm font-medium text-camp-navy"
            >
              Code d&apos;accès
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="EX. SOLEIL2026"
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? "code-error" : undefined}
              className="w-full rounded-lg border-2 border-camp-navy/20 bg-camp-cream px-4 py-3 text-center font-camp-sans text-lg uppercase tracking-widest text-camp-navy placeholder:text-camp-navy/30 focus:border-camp-navy focus:outline-none"
            />
          </div>

          {state.error && (
            <p
              id="code-error"
              role="alert"
              className="rounded-lg bg-camp-red/10 px-4 py-2 font-camp-sans text-sm font-medium text-camp-red"
            >
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
