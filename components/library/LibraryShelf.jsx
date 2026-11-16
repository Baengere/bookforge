
"use client";

import { useEffect, useState } from "react";
import BookCard from "./BookCard";

export default function LibraryShelf() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch("/api/books");

        if (!response.ok) {
          throw new Error("Could not retrieve books.");
        }

        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("LIBRARY ERROR:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  return (
    <section className="mt-20">

      <div className="mb-8 flex items-center justify-between">

        <h2 className="text-3xl font-bold">
          Available Now
        </h2>

        <p className="text-zinc-500">
          {books.length} {books.length === 1 ? "Book" : "Books"}
        </p>

      </div>

      {loading && (
        <p className="text-zinc-400">
          Loading books...
        </p>
      )}

      {error && (
        <p className="text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && books.length === 0 && (
        <p className="text-zinc-400">
          No books are available yet. Check back soon!
        </p>
      )}

      {!loading && !error && books.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}

        </div>
      )}

    </section>
  );
}
