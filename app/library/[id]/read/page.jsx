import Link from "next/link";


import ChapterReader from "@/components/reader/ChapterReader";

async function getBook(id) {
  const response = await fetch(
    `http://localhost:3000/api/books/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Could not load book");
  }

  return response.json();
}

async function checkPurchase(bookId, email) {
  const response = await fetch(
    "http://localhost:3000/api/purchases/check",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookId,
        email,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  return data.purchased;
}

export default async function ReadPage({ params, searchParams }) {

  const { id } = await params;

  const { email } = await searchParams;

  const book = await getBook(id);

  const readerEmail = email;

  const purchased = readerEmail ? await checkPurchase(book.id, readerEmail) : false;

  const chapters = [...book.chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  if (chapters.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-bold">
          No chapters are available.
        </h1>
      </main>
    );
  }

  const chaptersToShow = purchased
    ? chapters
    : chapters.slice(0, 1);

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-zinc-100">
      <ChapterReader>
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
            {book.title}
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            By {book.author}
          </h1>
        </header>

        {chaptersToShow.map((chapter) => (
          <section
            key={chapter.id}
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
    </main>
  );
}