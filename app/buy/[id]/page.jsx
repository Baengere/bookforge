
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function BuyPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [book, setBook] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [purchaseId, setPurchaseId] = useState(null);
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

  /*
   * Paystack returns the customer to:
   *
   * /buy/BOOK_ID?purchaseId=123&email=customer@example.com
   *
   * We restore the email and purchase ID from the URL.
   */
  useEffect(() => {
    const returnedPurchaseId = searchParams.get("purchaseId");
    const returnedEmail = searchParams.get("email");

    if (returnedEmail) {
      setEmail(returnedEmail);
    }

    if (!returnedPurchaseId) {
      return;
    }

    const numericPurchaseId = Number(returnedPurchaseId);

    if (!Number.isInteger(numericPurchaseId)) {
      setError("Invalid purchase information.");
      return;
    }

    setPurchaseId(numericPurchaseId);
    setCheckingPayment(true);
    setError("");

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
            purchaseId: numericPurchaseId,
          }),
        });

        const data = await response.json();

        console.log("PAYMENT STATUS:", data);

        if (data.purchased) {
          clearInterval(interval);
          setCheckingPayment(false);

          if(data.email){
            setEmail(data.email)
          }
          setPurchased(true);
          return;
        }

        if (data.status === "failed") {
          clearInterval(interval);
          setCheckingPayment(false);
          setError(
            "The payment was not completed. You can try again."
          );
          return;
        }

        if (attempts >= 20) {
          clearInterval(interval);
          setCheckingPayment(false);
          setError(
            "Your payment is still being confirmed. Please wait a moment and refresh this page."
          );
        }
      } catch (error) {
        console.error("PAYMENT CHECK ERROR:", error);

        if (attempts >= 20) {
          clearInterval(interval);
          setCheckingPayment(false);
          setError(
            "We could not confirm the payment yet. Please refresh the page in a moment."
          );
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [searchParams]);

  async function handlePurchase() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

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
          email: cleanEmail,
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

      /*
       * Keep the purchase ID and email in the callback URL.
       *
       * The purchase ID lets us identify the exact purchase.
       * The email lets us restore the reader's email after
       * Paystack sends them back.
       */
      const callbackUrl =
        `/buy/${id}` +
        `?purchaseId=${encodeURIComponent(data.purchaseId)}` +
        `&email=${encodeURIComponent(cleanEmail)}`;

      /*
       * We cannot change Paystack's already-created callback URL here,
       * so the initialize endpoint should create the correct callback.
       *
       * Redirect to Paystack.
       */
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
                onChange={(event) =>
                  setEmail(event.target.value)
                }
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

