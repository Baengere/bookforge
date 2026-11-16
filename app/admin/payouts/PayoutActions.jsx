
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PayoutActions({ payoutId }) {
  const router = useRouter();

  const [transferReference, setTransferReference] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAction(action) {
    setSaving(true);
    setMessage("");

    const body =
      action === "paid"
        ? { action, transferReference }
        : { action, failureReason };

    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not update payout.");
        return;
      }

      setMessage(data.message);
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5 space-y-4 border-t border-zinc-800 pt-5">
      <div>
        <label className="block text-sm text-zinc-400">
          M-PESA transaction code or bank transfer reference
        </label>
        <input
          type="text"
          value={transferReference}
          onChange={(event) => setTransferReference(event.target.value)}
          placeholder="Enter transfer reference"
          maxLength={100}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <button
          type="button"
          onClick={() => handleAction("paid")}
          disabled={saving || !transferReference.trim()}
          className="mt-3 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Mark as paid"}
        </button>
      </div>

      <div>
        <label className="block text-sm text-zinc-400">
          Reason for failed payout
        </label>
        <textarea
          value={failureReason}
          onChange={(event) => setFailureReason(event.target.value)}
          placeholder="Explain why the transfer failed"
          maxLength={500}
          rows={3}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <button
          type="button"
          onClick={() => handleAction("failed")}
          disabled={saving || failureReason.trim().length < 5}
          className="mt-3 rounded-lg border border-red-500 px-5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Mark as failed"}
        </button>
      </div>

      {message && (
        <p className="text-sm text-zinc-300" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
