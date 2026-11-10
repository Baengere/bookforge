
"use client";

import { useState } from "react";
import { splitIntoChapters } from "@/lib/splitChapters";
import { UploadButton } from "@/lib/uploadthing";

export default function PublishPage() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [chapters, setChapters] = useState([]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setText("");
    setChapters([]);
    setSaved(false);
    setError("");
  }

  async function extractText() {
    if (!file) return;

    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not extract manuscript.");
      }

      const extractedText = data.text || "";

      setText(extractedText);

      const detectedChapters = splitIntoChapters(extractedText);
      setChapters(detectedChapters);

      if (detectedChapters.length === 0) {
        setError("No chapters were detected. Check your manuscript formatting.");
      }
    } catch (error) {
      console.error("EXTRACTION ERROR:", error);
      setError(error.message || "Something went wrong while reading the manuscript.");
    } finally {
      setLoading(false);
    }
  }

  async function saveBook() {
    if (!title.trim() || !author.trim() || !price || chapters.length === 0) {
      setError("Please provide the book title, author, price, and manuscript chapters.");
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid selling price greater than zero.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const bookResponse = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          description: description.trim(),
          price: numericPrice,
          coverImage,
        }),
      });

      const bookData = await bookResponse.json();

      if (!bookResponse.ok) {
        throw new Error(bookData.error || "Could not create the book.");
      }

      const chapterResponse = await fetch(
        `/api/books/${bookData.id}/chapters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chapters }),
        }
      );

      const chapterData = await chapterResponse.json();

      if (!chapterResponse.ok) {
        throw new Error(
          chapterData.error ||
            "The book was created, but its chapters could not be saved."
        );
      }

      setSaved(true);
      console.log("Book created:", bookData);
      console.log("Chapters saved:", chapterData);
    } catch (error) {
      console.error("BOOK PUBLISH ERROR:", error);
      setError(error.message || "Could not publish your book.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16 text-white">
      <h1 className="text-4xl font-bold">Publish a Book</h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-zinc-400">Bring your story to BookForge.</p>

        <a
          href="/author/books"
          className="text-sm font-semibold text-amber-400 transition hover:text-amber-300"
        >
          My Books →
        </a>
      </div>

      <div className="mt-10 space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
        <section>
          <h2 className="mb-5 text-xl font-semibold">Book Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Book Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Author</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
                placeholder="Author's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
                placeholder="Tell readers about your book"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Selling Price (KES)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
                placeholder="e.g. 500"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800 pt-8">
          <h2 className="mb-3 text-xl font-semibold">Book Cover</h2>
          <p className="mb-4 text-sm text-zinc-400">
            Choose a cover image from your device. Maximum size: 4 MB.
          </p>

          <UploadButton
            endpoint="bookCover"
            onClientUploadComplete={(res) => {
              const uploadedUrl = res?.[0]?.ufsUrl;

              if (uploadedUrl) {
                setCoverImage(uploadedUrl);
                setError("");
              }
            }}
            onUploadError={(error) => {
              setError(error.message || "Cover upload failed.");
            }}
          />

          {coverImage && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-medium text-green-400">
                Cover uploaded successfully!
              </p>

              <img
                src={coverImage}
                alt="Book cover preview"
                className="h-64 w-auto rounded-lg border border-zinc-700 object-contain"
              />

              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="mt-3 block text-sm text-red-400 hover:text-red-300"
              >
                Remove cover
              </button>
            </div>
          )}
        </section>

        <section className="border-t border-zinc-800 pt-8">
          <h2 className="mb-4 text-xl font-semibold">Manuscript</h2>

          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="block w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          />

          {file && (
            <>
              <p className="mt-4 text-sm text-amber-400">
                Selected: {file.name}
              </p>

              <button
                onClick={extractText}
                disabled={loading || saving}
                className="mt-5 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
              >
                {loading ? "Reading manuscript..." : "Extract Manuscript"}
              </button>
            </>
          )}
        </section>

        {text && (
          <section className="border-t border-zinc-800 pt-8">
            <h2 className="text-xl font-semibold">Extracted Text</h2>

            <pre className="mt-4 max-h-[400px] overflow-auto whitespace-pre-wrap rounded-lg bg-black p-5 text-sm text-zinc-300">
              {text}
            </pre>
          </section>
        )}

        {chapters.length > 0 && (
          <section className="border-t border-zinc-800 pt-8">
            <h2 className="text-xl font-semibold">
              Chapters Found ({chapters.length})
            </h2>

            <div className="mt-4 space-y-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.chapterNumber}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                >
                  <p className="font-semibold">
                    {chapter.chapterNumber}. {chapter.title}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {chapter.content.length.toLocaleString()} characters
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={saveBook}
              disabled={saving || saved}
              className="mt-6 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {saving
                ? "Publishing Book..."
                : saved
                  ? "Book Published"
                  : "Publish Book"}
            </button>
          </section>
        )}

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {saved && (
          <p className="rounded-lg border border-green-900 bg-green-950/40 p-4 text-sm text-green-400">
            Your book and chapters have been saved successfully!
          </p>
        )}
      </div>
    </main>
  );
}
