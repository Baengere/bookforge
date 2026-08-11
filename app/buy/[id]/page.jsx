"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BuyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [book, setBook] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        const response = await fetch(`/api/books/${id}`);

        if (!response.ok) {
          throw new Error("Book not found");
        }

        const data = await response.json();

        setBook(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setPageLoading(false);
      }
    }

    loadBook();
  }, [id]);

  async function handlePurchase() {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: Number(id),
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Purchase failed");
      }

      setPurchased(true);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-zinc-100">
        <div className="mx-auto max-w-xl">
          <p className="text-zinc-500">
            Loading book...
          </p>
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-zinc-100">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold">
            Book not found
          </h1>

          <p className="mt-4 text-zinc-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (purchased) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-zinc-100">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
            Purchase Complete
          </p>

          <h1 className="mt-6 text-4xl font-bold">
            {book.title} is yours.
          </h1>

          <p className="mt-5 text-zinc-400">
            Your purchase has been recorded. You can now continue reading
            the full book.
          </p>

          <button
            onClick={() =>
              router.push(`/library/${book.id}/read?email=${encodeURIComponent(email)}`)
            }
            className="mt-10 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Continue Reading
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-zinc-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 md:flex-row">

        {book.coverImage && (
          <div className="shrink-0">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-48 rounded-xl shadow-2xl"
            />
          </div>
        )}

        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
            BookForge
          </p>

          <h1 className="mt-5 text-4xl font-bold">
            {book.title}
          </h1>

          <p className="mt-3 text-zinc-400">
            By {book.author}
          </p>

          {book.description && (
            <p className="mt-6 leading-7 text-zinc-400">
              {book.description}
            </p>
          )}

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">
                Full book
              </span>

              <span className="text-2xl font-bold">
                KES {book.price}
              </span>
            </div>

            <div className="mt-8">
              <label className="text-sm text-zinc-400">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
              />
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-amber-500 px-6 py-4 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : `Buy ${book.title}`}
            </button>

            <p className="mt-4 text-center text-xs text-zinc-600">
              Test payment for now. Real payment will be connected later.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}