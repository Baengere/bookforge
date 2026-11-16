
"use client";

import { useEffect, useState } from "react";

export default function PayoutSettingsForm() {
  const [method, setMethod] = useState("MPESA");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [savedProfile, setSavedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/author/payout-profile");
        const data = await response.json();

        if (response.ok && data.payoutProfile) {
          setSavedProfile(data.payoutProfile);
          setMethod(data.payoutProfile.payoutMethod);
        }
      } catch {
        setMessage("Could not load your saved payout details.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload =
      method === "MPESA"
        ? { payoutMethod: method, phoneNumber }
        : {
            payoutMethod: method,
            accountHolderName,
            bankName,
            accountNumber,
          };

    try {
      const response = await fetch("/api/author/payout-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save payout details.");
        return;
      }

      setSavedProfile(data.payoutProfile);
      setPhoneNumber("");
      setAccountHolderName("");
      setBankName("");
      setAccountNumber("");
      setMessage("Your payout details have been saved securely.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="mt-8 text-zinc-400">Loading payout settings...</p>;
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-400";

  return (
    <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      {savedProfile && (
        <div className="mb-6 rounded-xl border border-zinc-700 p-4">
          <p className="font-semibold">Saved payout method</p>
          <p className="mt-2 text-sm text-zinc-400">
            {savedProfile.payoutMethod === "MPESA" ? "M-PESA" : "Bank account"}
            {" ending in "}
            {savedProfile.destinationLastFour}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Saving new details will replace this payout destination.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-medium">Payout method</label>
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className={inputClass}
          >
            <option value="MPESA">M-PESA</option>
            <option value="BANK">Bank account</option>
          </select>
        </div>

        {method === "MPESA" ? (
          <div>
            <label className="font-medium">M-PESA phone number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="e.g. 0712345678"
              required
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="font-medium">Account holder name</label>
              <input
                value={accountHolderName}
                onChange={(event) => setAccountHolderName(event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="font-medium">Bank name</label>
              <input
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="font-medium">Account number</label>
              <input
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
                required
                className={inputClass}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save payout details"}
        </button>
      </form>

      {message && (
        <p className="mt-5 text-sm text-zinc-300" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
