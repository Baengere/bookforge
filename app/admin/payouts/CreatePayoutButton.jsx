
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePayoutButton({ authorId }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreate() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not create payout.");
        return;
      }

      setMessage(
        `Payout #${data.payoutId} created: KES ${data.amount}.`
      );

      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleCreate}
        disabled={saving}
        className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
      >
        {saving ? "Creating payout..." : "Create payout"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-zinc-300" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
