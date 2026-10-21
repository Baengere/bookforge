
"use client";

import { useState } from "react";

const categories = [
  { value: "payment", label: "Payment problem" },
  { value: "book_access", label: "I paid but can't access my book" },
  { value: "bug", label: "Something isn't working" },
  { value: "suggestion", label: "Suggestion or idea" },
  { value: "other", label: "Other question" },
];

export default function HelpPage() {
  const [form, setForm] = useState({
    email: "",
    category: "book_access",
    bookTitle: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      setResult({
        success: response.ok,
        message: response.ok
          ? `${data.message} Reference: ${data.reference}`
          : data.error || "Please try again.",
      });

      if (response.ok) {
        setForm({
          email: "",
          category: "book_access",
          bookTitle: "",
          message: "",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Connection problem. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-500">
          Help & Feedback
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          How can we help?
        </h1>

        <p className="mt-5 leading-7 text-zinc-400">
          Having trouble with a purchase, unable to open a book, or have an
          idea to share? Tell us what happened and we'll look into it.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-zinc-300">
              Your email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={updateField}
              className="w-full rounded-lg border border-zinc-700 bg-[#0B0B0B] px-4 py-3 outline-none focus:border-amber-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm text-zinc-300"
            >
              What do you need help with?
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={updateField}
              className="w-full rounded-lg border border-zinc-700 bg-[#0B0B0B] px-4 py-3 outline-none focus:border-amber-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bookTitle"
              className="mb-2 block text-sm text-zinc-300"
            >
              Book title (optional)
            </label>
            <input
              id="bookTitle"
              name="bookTitle"
              maxLength={200}
              value={form.bookTitle}
              onChange={updateField}
              className="w-full rounded-lg border border-zinc-700 bg-[#0B0B0B] px-4 py-3 outline-none focus:border-amber-500"
              placeholder="Which book is affected?"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm text-zinc-300"
            >
              Tell us what happened
            </label>
            <textarea
              id="message"
              name="message"
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              value={form.message}
              onChange={updateField}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-[#0B0B0B] px-4 py-3 leading-7 outline-none focus:border-amber-500"
              placeholder="Describe the issue or share your feedback..."
            />
            <p className="mt-2 text-xs text-zinc-500">
              Please don't include passwords, payment PINs, or sensitive
              financial details.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Sending..." : "Send message"}
          </button>

          {result && (
            <p
              role="status"
              aria-live="polite"
              className={result.success ? "text-green-400" : "text-red-400"}
            >
              {result.message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
