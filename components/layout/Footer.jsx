
import Link from "next/link";
import { BookOpen, ArrowUp } from "@/lib/icons";
import { InstagramIcon, FacebookIcon } from "./SocialIcons";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#080808] px-6 py-16 text-zinc-400">
      <div className="mx-auto max-w-6xl">
        {/* Main Footer */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100"
            >
              <BookOpen className="h-6 w-6 text-amber-500" />
              BookForge
            </Link>

            <p className="mt-5 max-w-sm text-base leading-7 text-zinc-500">
              A place for stories that make you curious, challenge what you
              know, and give you another reason to keep reading.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-4 text-sm">
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-zinc-600">
              Explore
            </p>

            <Link href="/library" className="w-fit transition hover:text-amber-400">
              Library
            </Link>

            <Link href="/about" className="w-fit transition hover:text-amber-400">
              About
            </Link>

            <Link href="/publish" className="w-fit transition hover:text-amber-400">
              Publish
            </Link>
          </nav>

          {/* Social Media */}
          <div className="flex flex-col gap-4">
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-zinc-600">
              Follow BookForge
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/bookforge.team/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow BookForge on Instagram"
                className="rounded-lg border border-[#1306C]/40 bg-[#E1306C]/10 text-[#E1306C] p-3 transition hover:border-[#1306C] hover:bg-[#E1306C]/20"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>

              <a
                href="https://web.facebook.com/profile.php?id=61595435114889"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow BookForge on Facebook"
                className="rounded-lg border border-[#1877F2]/40 bg-[#1877F2]/10 p-3 text-[#1877F2] transition hover:border-[#1877F2] hover:bg-[#1877F2]/20"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col gap-5 border-t border-zinc-800 pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-zinc-600">
            © {new Date().getFullYear()} BookForge. All rights reserved.
          </p>

          <p className="text-zinc-600">
            Read. Question. Imagine. Explore.
          </p>

          <Link
            href="#"
            className="inline-flex w-fit items-center gap-2 text-zinc-500 transition hover:text-amber-400"
          >
            Back to top
            <ArrowUp className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
