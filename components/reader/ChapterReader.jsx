"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen } from "@/lib/icons";

export default function ChapterReader({
  children,
  bookId,
  bookTitle,
  chapterCount,
  }) {
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);
  const progressReady = useRef(false)
  const canSaveProgress = useRef(false)

  
  useEffect(() => {
    let cancelled = false;

    async function loadReadingProgress() {
      try {
        const response = await fetch(
          `/api/reading-progress?bookId=${bookId}`
        );

        if (!response.ok) return;

        canSaveProgress.current = true;

        const data = await response.json();
        const saved = data.progress;

        if (!saved || cancelled) return;

        const chapter = document.querySelector(
        `[data-chapter="${saved.chapterNumber}"]`
        );

        // Restore only if this chapter is actually available to read.
        if (!chapter) return;

        const ratio = Math.min(
          1,
          Math.max(0, saved.position / 10000)
        );

        const scrollableHeight = Math.max(
          0,
          chapter.offsetHeight - window.innerHeight
        );

        const targetTop =
          window.scrollY +
          chapter.getBoundingClientRect().top +
          ratio * scrollableHeight;

        window.scrollTo({
          top: targetTop,
          behavior: "auto",
        });

        setCurrentChapter(saved.chapterNumber);
      } catch (error) {
        console.error("Could not load reading progress:", error);
      } finally {
        if (!cancelled) {
          progressReady.current = true;
        }
      }
    }

    loadReadingProgress();

    return () => {
      cancelled = true;
    };
  }, [bookId]);


  
    useEffect(() => {
      let saveTimer;
      let visibleChapterNumber = 1;

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

        visibleChapterNumber = visibleChapter;
        setCurrentChapter(visibleChapter);
      }

      async function saveReadingProgress() {
        // Wait until the saved bookmark has finished loading.
        if (!progressReady.current || !canSaveProgress.current) {
          return;
        }

        const chapter = document.querySelector(
          `[data-chapter="${visibleChapterNumber}"]`
        );

        if (!chapter) return;

        const scrollableHeight = Math.max(
          1,
          chapter.offsetHeight - window.innerHeight
        );

        const distanceScrolled = -chapter.getBoundingClientRect().top;

        const ratio = Math.min(
          1,
          Math.max(0, distanceScrolled / scrollableHeight)
        );

        const position = Math.round(ratio * 10000);

        try {
          const response = await fetch("/api/reading-progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
            bookId,
            chapterNumber: visibleChapterNumber,
            position,
            }),
          });

          if (!response.ok) {
            console.error("Could not save reading progress.");
          }
        } catch (error) {
          console.error("Could not save reading progress:", error);
        }
      }

      function handleScroll() {
        updateProgress();
        updateChapter();

        // Reset the timer whenever scrolling continues.
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveReadingProgress, 1200);
      }

      updateProgress();
      updateChapter();

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll);

      return () => {
        clearTimeout(saveTimer);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, [bookId]);


    function goToChapter(chapterNumber) {
      const chapter = document.querySelector(
        `[data-chapter="${chapterNumber}"]`
      );

      if (!chapter) {
        return;
      }

      chapter.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

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
        <div
          className="
            sticky
            top-1
            z-40
            mt-6
            flex
            items-center
            justify-between
            gap-4
            border-y
            border-zinc-800/60
            bg-[#0f0f10]/90
            px-1
            py-3
            text-xs
            text-zinc-500
            backdrop-blur
          "
        >
          <span className="truncate">
            {bookTitle}
          </span>

          <span className="shrink-0 text-amber-400">
            Chapter {currentChapter} of {chapterCount}
          </span>
        </div>

        {/* Book heading */}
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

        {/* Chapter navigation */}
        {chapterCount > 1 && (
          <div className="my-20 border-t border-zinc-800 pt-8">

            <div className="flex items-center justify-between gap-4">

              {currentChapter > 1 ? (
                <button
                  type="button"
                  onClick={() => goToChapter(currentChapter - 1)}
                  className="
                    rounded-xl
                    border
                    border-zinc-700
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-zinc-300
                    transition
                    hover:border-amber-500
                    hover:text-amber-400
                  "
                >
                  ← Previous Chapter
                </button>
              ) : (
                <div />
              )}

              {currentChapter < chapterCount && (
                <button
                  type="button"
                  onClick={() => goToChapter(currentChapter + 1)}
                  className="
                    rounded-xl
                    bg-amber-500
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-black
                    transition
                    hover:bg-amber-400
                  "
                >
                  Next Chapter →
                </button>
              )}

            </div>

          </div>
        )}

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