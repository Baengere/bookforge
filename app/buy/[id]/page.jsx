"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BuyPage() {
  const {id} = useParams();

  const router = useRouter();

  const [book, setBook] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [purchaseId, setPurchaseId] = useState(null);
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
    console.log("BOOK ID:", id)
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone) {
      setError("Please enter your M-Pesa phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: Number(id),
          email,
          phone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not start payment.");
      }

      setPurchaseId(data.purchaseId);
      setWaitingForPayment(true);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!waitingForPayment || !purchaseId) {
      return;
    }

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch("/api/purchases/check", {
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

        if (data.purchased) {
          clearInterval(interval);
          setWaitingForPayment(false);
          setPurchased(true);
        }

        if (attempts >= 20) {
          clearInterval(interval);
          setWaitingForPayment(false);
          setError(
            "We could not confirm the payment yet. If you completed the M-Pesa payment, please wait a moment and try again."
          );
        }
      } catch (error) {
        console.error("PAYMENT CHECK ERROR:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [waitingForPayment, purchaseId, id, email]);

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
            Your M-Pesa payment has been confirmed. You can now
            continue reading the full book.
          </p>

          <button
            onClick={() =>
              router.push(
                `/library/${book.id}/read?email=${encodeURIComponent(email)}`
              )
            }
            className="mt-10 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Continue Reading
          </button>
        </div>
      </main>
    );
  }

  if (waitingForPayment) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-zinc-100">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
            M-Pesa
          </p>

          <h1 className="mt-6 text-4xl font-bold">
            Check your phone
          </h1>

          <p className="mt-5 text-lg text-zinc-400">
            An M-Pesa payment request has been sent to:
          </p>

          <p className="mt-3 text-xl font-semibold">
            {phone}
          </p>

          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="text-4xl">
              📱
            </div>

            <p className="mt-5 text-zinc-300">
              Enter your M-Pesa PIN on your phone to complete
              the payment.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-zinc-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Waiting for payment confirmation...
            </div>
          </div>

          <p className="mt-8 text-xs text-zinc-600">
            Please keep this page open while completing the payment.
          </p>
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

            <div className="mt-5">
              <label className="text-sm text-zinc-400">
                M-Pesa phone number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0712345678"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Enter the number that should receive the M-Pesa payment prompt.
              </p>
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
                ? "Sending M-Pesa request..."
                : `Pay KES ${book.price}`}
            </button>

            <p className="mt-4 text-center text-xs text-zinc-600">
              You will receive an M-Pesa payment prompt on your phone.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}