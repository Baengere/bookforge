"use client";

import { useState } from "react";
import { splitIntoChapters } from "@/lib/splitChapters";

export default function PublishPage() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setText("");
    setChapters([]);
    setSaved(false);
  }

  async function extractText() {
    if (!file) return;

    setLoading(true);
    setSaved(false);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      const extractedText = data.text || "";

      setText(extractedText);

      const detectedChapters =
        splitIntoChapters(extractedText);

      setChapters(detectedChapters);
    } catch (error) {
      console.error("EXTRACTION ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveChapters() {
    if (chapters.length === 0) return;

    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch(
        "/api/books/1/chapters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chapters,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setSaved(true);

      console.log("Saved chapters:", data);
    } catch (error) {
      console.error("SAVE ERROR:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold">
        Publish a Book
      </h1>

      <p className="mt-4 text-zinc-400">
        Upload your manuscript to BookForge.
      </p>

      <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        <label className="block text-sm font-medium">
          Manuscript
        </label>

        <input
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="mt-4 block w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
        />

        {file && (
          <>
            <p className="mt-4 text-sm text-amber-400">
              Selected: {file.name}
            </p>

            <button
              onClick={extractText}
              disabled={loading}
              className="mt-6 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {loading
                ? "Reading manuscript..."
                : "Extract Manuscript"}
            </button>
          </>
        )}

        {text && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">
              Extracted Text
            </h2>

            <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap rounded-lg bg-black p-6 text-sm text-zinc-300">
              {text}
            </pre>
          </div>
        )}

        {chapters.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold">
              Chapters Found
            </h2>

            <div className="mt-4 space-y-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.chapterNumber}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                >
                  <p className="font-semibold">
                    {chapter.chapterNumber}.{" "}
                    {chapter.title}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {chapter.content.length.toLocaleString()}{" "}
                    characters
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={saveChapters}
              disabled={saving}
              className="mt-6 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {saving
                ? "Saving Chapters..."
                : "Save Chapters"}
            </button>

            {saved && (
              <p className="mt-4 text-sm text-green-400">
                Chapters saved successfully.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}