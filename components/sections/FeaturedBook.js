
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FeaturedBook() {
  const book = await prisma.book.findFirst({
    where: {
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!book) {
    return (
      <section className="border-t border-zinc-800/60 py-20 text-center">
        <h2 className="text-3xl font-bold">
          Your Next Great Read Awaits
        </h2>
        <p className="mt-4 text-zinc-400">
          We are preparing stories for curious readers. Check back soon!
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-zinc-800/60 py-20 lg:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">

        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              width={500}
              height={750}
              className="h-auto w-full"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center bg-zinc-800 text-zinc-400">
              No cover available
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-amber-500">
            Featured Read
          </p>

          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            {book.title}
          </h2>

          <p className="mb-6 text-zinc-400">
            By {book.author}
          </p>

          <p className="mb-8 leading-7 text-zinc-400">
            {book.description || "Discover this story on BookForge."}
          </p>

          <Link
            href={`/library/${book.id}`}
            className="inline-flex items-center rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Discover This Book
          </Link>
        </div>

      </div>
    </section>
  );
}
