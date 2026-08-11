import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "@/lib/icons";

export default function BookCard() {
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-amber-500">

      <Image
        src="/books/metal-within/cover.png"
        alt="The Metal Within"
        width={400}
        height={600}
        className="w-full h-auto"
      />

      <div className="p-6">

        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
          Science Fiction
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          The Metal Within
        </h3>

        <p className="mt-4 text-sm leading-7 text-zinc-400">
          A young man discovers that true strength comes at an unimaginable cost.
        </p>

        <Link
          href="/library/1"
          className="mt-8 inline-flex items-center gap-2 text-amber-400 transition group-hover:gap-4"
        >
          <BookOpen className="h-5 w-5" />
          View Book
        </Link>

      </div>

    </div>
  );
}