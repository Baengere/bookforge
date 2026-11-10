
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookActions({ book }) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description || "");
  const [price, setPrice] = useState(String(book.price));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update book.");
      }

      setEditing(false);
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${book.title}"? Books with purchase records will be archived instead of permanently deleted.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not remove book.");
      }

      alert(
        data.action === "archived"
          ? "This book has been archived."
          : "This book has been deleted."
      );

      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="border-t border-zinc-800 p-4">
        <h4 className="mb-4 font-semibold">Edit book details</h4>

        <label className="block text-sm text-zinc-400">
          Book title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
        />

        <label className="mt-4 block text-sm text-zinc-400">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
        />

        <label className="mt-4 block text-sm text-zinc-400">
          Selling price (KES)
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
        />

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError("");
              setTitle(book.title);
              setDescription(book.description || "");
              setPrice(String(book.price));
            }}
            disabled={loading}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="border-t border-zinc-800 p-4">
      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setEditing(true)}
          disabled={loading}
          className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-400 hover:text-black"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950 disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
