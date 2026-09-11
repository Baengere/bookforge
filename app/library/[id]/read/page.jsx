import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ChapterReader from "@/components/reader/ChapterReader";

async function getBook(id) {
  return prisma.book.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      chapters: true,
    },
  });
}

async function checkPurchase(bookId, email) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      bookId,
      email,
      status: "completed",
    },
  });

  return Boolean(purchase);
}

export default async function ReadPage({ params, searchParams }) {
  const { id } = await params;
  const { email } = await searchParams;

  // Make sure a valid book ID was provided.
  if (!id || Number.isNaN(Number(id))) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-20 text-zinc-100">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">
            Book not found
          </h1>

          <p className="mt-4 text-zinc-400">
            We couldn't find the book you're looking for.
          </p>

          <Link
            href="/library"
            className="mt-8 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Back to Library
          </Link>
        </div>
      </main>
    );
  }

  const book = await getBook(id);

  if (!book) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-20 text-zinc-100">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">
            Book not found
          </h1>

          <p className="mt-4 text-zinc-400">
            We couldn't find the book you're looking for.
          </p>

          <Link
            href="/library"
            className="mt-8 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Back to Library
          </Link>
        </div>
      </main>
    );
  }

  const readerEmail = email || null;

  const purchased = readerEmail
    ? await checkPurchase(book.id, readerEmail)
    : false;

  const chapters = [...book.chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  if (chapters.length === 0) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-20 text-zinc-100">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">
            No chapters are available.
          </h1>

          <Link
            href={`/library/${book.id}`}
            className="mt-6 inline-block text-amber-400 transition hover:text-amber-300"
          >
            ← Back to Book
          </Link>
        </div>
      </main>
    );
  }

  const chaptersToShow = purchased
    ? chapters
    : chapters.slice(0, 1);

  return (
    <ChapterReader bookTitle={book.title} chapterCount={chapters.length}>
      <header className="mb-12 border-b border-zinc-800 pb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
          {book.title}
        </p>

        <p className="mt-4 text-lg text-zinc-500">
          By {book.author}
        </p>
      </header>

      {chaptersToShow.map((chapter) => (
        <section
          key={chapter.id}
          data-chapter={chapter.chapterNumber}
          className="mb-20"
        >
          <header className="mb-8 border-b border-zinc-800 pb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-500">
              Chapter {chapter.chapterNumber}
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {chapter.title}
            </h2>
          </header>

          <div className="whitespace-pre-wrap leading-8 text-zinc-300">
            {chapter.content}
          </div>
        </section>
      ))}

      {!purchased && (
        <div className="mt-16 border-t border-zinc-800 pt-10 text-center">
          <p className="text-lg text-zinc-400">
            You've reached the end of the sample.
          </p>

          <Link
            href={`/buy/${book.id}`}
            className="mt-6 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Buy The Book
          </Link>
        </div>
      )}
    </ChapterReader>
  );
}