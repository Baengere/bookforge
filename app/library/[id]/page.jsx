import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "@/lib/icons";

async function getBook(id) {
  const response = await fetch(
    `/api/books/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function BookPage({ params }) {
  const { id } = await params;

  const book = await getBook(id);

  if (!book) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-20 text-zinc-100">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">
            Book not found
          </h1>

          <Link
            href="/library"
            className="mt-6 inline-block text-amber-400"
          >
            ← Back to Library
          </Link>
        </div>
      </main>
    );
  }

  const chapterOne = book.chapters?.find(
    (chapter) => chapter.chapterNumber === 1
  );

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-zinc-100">

      <div className="mx-auto max-w-6xl px-6 py-16">

        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>

        <section className="mt-12 grid gap-12 md:grid-cols-[320px_1fr]">

          <div>
            {book.coverImage && (
              <Image
                src={book.coverImage}
                alt={book.title}
                width={500}
                height={750}
                className="w-full rounded-2xl shadow-2xl"
              />
            )}
          </div>

          <div className="flex flex-col justify-center">

            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
              BookForge
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight">
              {book.title}
            </h1>

            <p className="mt-4 text-lg text-zinc-500">
              By {book.author}
            </p>

            {book.description && (
              <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300">
                {book.description}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href={`/library/${book.id}/read`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
              >
                <BookOpen className="h-5 w-5" />
                Read Chapter One Free
              </Link>

              <Link
                href={`/buy/${book.id}`}
                className="inline-flex items-center rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-100 transition hover:border-amber-500 hover:text-amber-400"
              >
                Buy The Book · KES {book.price}
              </Link>

            </div>

          </div>

        </section>

        {chapterOne && (
          <section className="mt-24 max-w-3xl">

            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
              Free Preview
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Start with Chapter One
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              Read the opening chapter of {book.title} for free.
              If the story pulls you in, you can unlock the complete book.
            </p>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">

              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                Chapter One
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                {chapterOne.title}
              </h3>

              <p className="mt-5 line-clamp-6 whitespace-pre-wrap leading-8 text-zinc-400">
                {chapterOne.content}
              </p>

              
                <BookOpen className="h-5 w-5" />
                Read Chapter one
                
              

            </div>

          </section>
        )}

      </div>

    </main>
  );
}