
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "@/lib/icons";

export default function BookCard({ book }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-amber-500">

      {book.coverImage ? (
        <Image
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          width={400}
          height={600}
          className="w-full h-auto"
        />
      ) : (
        <div className="flex aspect-[2/3] items-center justify-center bg-zinc-800 text-zinc-500">
          No cover available
        </div>
      )}

      <div className="p-6">

        <h3 className="mt-2 text-2xl font-bold">
          {book.title}
        </h3>

        <p className="mt-2 text-sm font-medium text-zinc-400">
          {book.author}
        </p>

        <p className="mt-4 text-sm leading-7 text-zinc-400">
          {book.description || "Discover this story on BookForge."}
        </p>

        <Link
          href={`/library/${book.id}`}
          className="mt-8 inline-flex items-center gap-2 text-amber-400 transition group-hover:gap-4"
        >
          <BookOpen className="h-5 w-5" />
          View Book
        </Link>

      </div>

    </div>
  );
}
