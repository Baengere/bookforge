
"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);

      if (response.ok) {
        setEmail("");
        setConsent(false);
      }
    } catch {
      setMessage("Connection problem. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-t border-zinc-800 bg-[#0B0B0B] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-500">
          From BookForge
        </p>

        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
          Stories worth returning for.
        </h2>

        <p className="mt-4 leading-7 text-zinc-400">
          Get occasional updates about new books, stories, and what is
          happening at BookForge.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>

          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            className="w-full rounded-lg border border-zinc-700 bg-[#0B0B0B] px-4 py-3 text-white outline-none focus:border-amber-500"
          />

          <label className="flex items-start gap-3 text-sm leading-6 text-zinc-400">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              required
              className="mt-1 accent-amber-500"
            />
            I agree to receive occasional BookForge updates by email.
          </label>

          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>

          {message && (
            <p role="status" aria-live="polite" className="text-sm text-zinc-300">
              {message}
            </p>
          )}
        </form>

        <p className="mt-4 text-xs text-zinc-500">
          You can unsubscribe from newsletter emails at any time.
        </p>
      </div>
    </section>
  );
}
