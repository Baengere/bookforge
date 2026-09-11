import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, BookOpen } from "@/lib/icons";

export default function ChapterReader({ children }) {
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
        <div className="h-full w-1/3 bg-amber-400 transition-all duration-500" />
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

        {/* Chapter heading */}
        <header className="pb-12 pt-14 sm:pb-16 sm:pt-16">

          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
            The Metal Within
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Chapter One
          </h1>

          <div className="mt-5 flex items-center gap-2 text-sm text-zinc-500">
            <Clock className="h-4 w-4" />
            <span>8 min read</span>
          </div>

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

        {/* End of sample */}
        <section
          className="
            my-24
            rounded-3xl
            border
            border-amber-500/20
            bg-zinc-900/70
            p-7
            text-center
            sm:p-10
          "
        >
          <BookOpen className="mx-auto h-7 w-7 text-amber-400" />

          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
            End of Free Sample
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-8 text-zinc-400">
            Thank you for reading the opening chapter of{" "}
            <span className="font-semibold text-white">
              The Metal Within
            </span>
            .
            Imondo's journey is only beginning.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link href="/buy/1">
              <Button size="lg" className="w-full sm:w-auto">
                Buy The Book
              </Button>
            </Link>

            <Link href="/library">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Explore More Books
              </Button>
            </Link>

          </div>
        </section>

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