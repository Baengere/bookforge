"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen } from "@/lib/icons";

export default function ChapterReader({
  children,
  bookTitle,
  chapterCount,
}) {
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (documentHeight <= 0) {
        setProgress(0);
        return;
      }

      const percentage = (scrollTop / documentHeight) * 100;

      setProgress(Math.min(100, Math.max(0, percentage)));
    }

    function updateChapter() {
      const chapterElements = document.querySelectorAll("[data-chapter]");

      let visibleChapter = 1;

      chapterElements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        if (rect.top <= window.innerHeight * 0.35) {
          visibleChapter = Number(element.dataset.chapter);
        }
      });

      setCurrentChapter(visibleChapter);
    }

    function handleScroll() {
      updateProgress();
      updateChapter();
    }

    updateProgress();
    updateChapter();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0f0f10] text-zinc-100">

      {/* Soft reading-room glow */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_45%)]
        "
      />

      {/* Reading progress */}
      <div className="sticky top-0 z-50 h-1 bg-zinc-800">
        <div
          className="h-full bg-amber-400 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Reading area */}
      <div className="relative mx-auto max-w-3xl px-5 sm:px-6">

        {/* Back */}
        <div className="pt-8 sm:pt-10">
          <Link
            href="/library"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-zinc-500
              transition
              hover:text-amber-400
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
        </div>

        {/* Reading status */}
        <div className="sticky top-1 z-40 mt-6 flex justify-between border-y border-zinc-800/60 bg-[#0f0f10]/90 px-1 py-3 text-xs text-zinc-500 backdrop-blur">
          <span className="truncate pr-4">
            {bookTitle}
          </span>

          <span className="shrink-0 text-amber-400">
            Chapter {currentChapter} of {chapterCount}
          </span>
        </div>

        {/* Chapter heading */}
        <header className="pb-12 pt-14 sm:pb-16 sm:pt-16">

          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
            {bookTitle}
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Reading
          </h1>

        </header>

        {/* Story */}
        <article
          className="
            prose
            prose-invert
            prose-lg
            mx-auto
            max-w-none
            leading-8
            sm:prose-xl
            sm:leading-9
            prose-headings:text-white
            prose-p:text-zinc-300
            prose-p:leading-8
            sm:prose-p:leading-9
            prose-p:tracking-wide
            prose-strong:text-zinc-100
          "
        >
          {children}
        </article>

      </div>

      {/* Floating reading button */}
      <button
        type="button"
        aria-label="Reading options"
        className="
          fixed
          bottom-5
          right-5
          z-40
          rounded-full
          border
          border-zinc-700
          bg-zinc-900/95
          p-4
          text-zinc-300
          shadow-xl
          backdrop-blur
          transition
          hover:scale-105
          hover:border-amber-500
          hover:text-amber-400
        "
      >
        <BookOpen className="h-5 w-5" />
      </button>

    </main>
  );
}