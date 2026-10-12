
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function MyBooksPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const email = user?.email?.trim().toLowerCase();

  if (!email) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold">My Books</h1>
          <p className="mt-4 text-zinc-400">
            Sign in to access your purchased books.
          </p>
          <Link
            href="/api/auth/login"
            className="mt-8 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      email,
      status: "completed",
    },
    include: {
      book: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const books = [
    ...new Map(
      purchases.map((purchase) => [
        purchase.bookId,
        purchase.book,
      ])
    ).values(),
  ];

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
          Your collection
        </p>

        <h1 className="mt-3 text-4xl font-bold">My Books</h1>

        <p className="mt-4 text-zinc-400">
          Your stories, ready whenever you are.
        </p>

        {books.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-zinc-800 p-10 text-center">
            <h2 className="text-2xl font-semibold">
              Your shelf is waiting.
            </h2>
            <p className="mt-3 text-zinc-400">
              Books you purchase will appear here.
            </p>
            <Link
              href="/library"
              className="mt-6 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black"
            >
              Explore the Library
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <article
                key={book.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                {book.coverImage && (
                  <img
                    src={book.coverImage}
                    alt={`Cover of ${book.title}`}
                    className="h-72 w-full object-contain bg-black"
                  />
                )}

                <div className="p-6">
                  <h2 className="text-xl font-bold">{book.title}</h2>
                  <p className="mt-2 text-zinc-400">
                    By {book.author}
                  </p>

                  <Link
                    href={`/library/${book.id}/read`}
                    className="mt-6 inline-block rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black hover:bg-amber-400"
                  >
                    Continue Reading
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
