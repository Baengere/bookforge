
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function BuyPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnedPurchaseId = searchParams.get("purchaseId");

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [error, setError] = useState("");

  // Load the book
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
        console.error("BOOK LOAD ERROR:", error);
        setError(error.message);
      } finally {
        setPageLoading(false);
      }
    }

    if (id) {
      loadBook();
    }
  }, [id]);

  // Check payment after returning from Paystack
  useEffect(() => {
    if (!returnedPurchaseId) {
      return;
    }

    const numericPurchaseId = Number(returnedPurchaseId);

    if (
      !Number.isInteger(numericPurchaseId) ||
      numericPurchaseId <= 0
    ) {
      setError("Invalid purchase information.");
      return;
    }

    setCheckingPayment(true);
    setError("");

    let attempts = 0;
    let timeoutId;
    let cancelled = false;

    async function checkPaymentStatus() {
      attempts++;

      try {
        const response = await fetch("/api/purchases/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            purchaseId: numericPurchaseId,
          }),
        });

        const data = await response.json();

        if (cancelled) return;

        console.log("PAYMENT STATUS:", data);

        // Authentication or invalid request
        if (response.status === 401 || response.status === 400) {
          setCheckingPayment(false);
          setError(
            data.error || "Please sign in to check your purchase."
          );
          return;
        }

        // Purchase not found or does not belong to this reader
        if (data.status === "not_found") {
          setCheckingPayment(false);
          setError(
            "We could not find this purchase. Please check your account and try again."
          );
          return;
        }

        // Payment successfully confirmed
        if (response.ok && data.purchased) {
          setCheckingPayment(false);
          setPurchased(true);
          return;
        }

      } catch (error) {
        console.error("PAYMENT CHECK ERROR:", error);
      }

      // Continue checking while confirmation is pending.
      // A locally failed purchase can still be recovered
      // if the webhook later verifies a successful payment.
      if (attempts >= 20) {
        setCheckingPayment(false);
        setError(
          "Your payment is still being confirmed. Please wait a moment and refresh this page."
        );
        return;
      }

      timeoutId = setTimeout(checkPaymentStatus, 3000);
    }

    // Start checking immediately
    checkPaymentStatus();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [returnedPurchaseId]);

  async function handlePurchase() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: Number(id),
        }),
      });

      const data = await response.json();

      console.log("PAYSTACK INITIALIZE:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Could not start payment."
        );
      }

      if (!data.authorizationUrl || !data.purchaseId) {
        throw new Error(
          "Paystack did not return the required checkout information."
        );
      }

      // The initialization API already creates the callback URL.
      // Redirect the reader to Paystack.
      window.location.href = data.authorizationUrl;

    } catch (error) {
      console.error("PAYSTACK PAYMENT ERROR:", error);
      setError(error.message);
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

  if (checkingPayment) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-zinc-100">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
            Paystack
          </p>

          <h1 className="mt-6 text-4xl font-bold">
            Confirming your payment
          </h1>

          <p className="mt-5 text-lg text-zinc-400">
            We&apos;re checking Paystack&apos;s confirmation.
          </p>

          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="text-4xl">
              💳
            </div>

            <p className="mt-5 text-zinc-300">
              Please give us a moment while we confirm your
              payment.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-zinc-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Waiting for confirmation...
            </div>
          </div>
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
            Your payment has been confirmed. You can now
            continue reading the full book.
          </p>

          <button
            onClick={() =>
              router.push(`/library/${book.id}/read`)
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

            <p className="mt-6 text-sm text-zinc-500">
              Your purchase will be associated with your
              signed-in BookForge account.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-base font-semibold leading-relaxed text-red-400"
              >
                {error}
              </p>
            )}

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-amber-500 px-6 py-4 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Opening secure checkout..."
                : `Pay KES ${book.price}`}
            </button>

            <p className="mt-4 text-center text-xs text-zinc-600">
              Secure payment powered by Paystack. Choose M-PESA
              at checkout.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
