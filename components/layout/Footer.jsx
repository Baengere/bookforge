import Link from "next/link";
import { BookOpen } from "@/lib/icons";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#080808] px-6 py-12 text-zinc-400">
      <div className="mx-auto max-w-6xl">

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-zinc-100"
            >
              <BookOpen className="h-6 w-6 text-amber-500" />
              BookForge
            </Link>

            <p className="mt-4 leading-7 text-zinc-500">
              Stories for the curious. A place to read, question, imagine,
              and explore.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <Link
              href="/library"
              className="transition hover:text-amber-400"
            >
              Library
            </Link>

            <Link
              href="/#about"
              className="transition hover:text-amber-400"
            >
              About
            </Link>
          </nav>

        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-zinc-800 pt-6 text-sm text-zinc-600 md:flex-row md:items-center md:justify-between">

          <p>
            © {new Date().getFullYear()} BookForge. All rights reserved.
          </p>

          <p>
            Read. Question. Imagine. Explore.
          </p>

        </div>

      </div>
    </footer>
  );
}