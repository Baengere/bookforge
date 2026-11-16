
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import BookActions from "./BookActions";
import Link from "next/link";

const formatKES = (cents) =>
  `KES ${(cents / 100).toFixed(2)}`;

export default async function AuthorBooksPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-white px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Author Studio</h1>
          <p className="mt-4 text-zinc-400">
            Please sign in to manage your books.
          </p>
        </div>
      </main>
    );
  }

  const books = await prisma.book.findMany({
    where: {
      ownerId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Retrieve this author's completed sales and payout allocations.
  const purchases = await prisma.purchase.findMany({
    where: {
      authorId: user.id,
      status: "completed",
      authorEarnings: {
        not: null,
      },
    },
    select: {
      authorEarnings: true,
      payoutItem: {
        select: {
          amount: true,
          payout: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  const publishedCount = books.filter(
    (book) => !book.isArchived
  ).length;

  const archivedCount = books.filter(
    (book) => book.isArchived
  ).length;

  // Convert amounts to cents to avoid floating-point rounding errors.
  const totalEarnings = purchases.reduce(
    (total, purchase) =>
      total + Math.round(Number(purchase.authorEarnings) * 100),
    0
  );

  const paidEarnings = purchases.reduce(
    (total, purchase) => {
      const item = purchase.payoutItem;

      if (item?.payout.status === "PAID") {
        return total + Math.round(Number(item.amount) * 100);
      }

      return total;
    },
    0
  );

  const reservedEarnings = purchases.reduce(
    (total, purchase) => {
      const item = purchase.payoutItem;

      if (
        item?.payout.status === "PENDING" ||
        item?.payout.status === "PROCESSING"
      ) {
        return total + Math.round(Number(item.amount) * 100);
      }

      return total;
    },
    0
  );

  const availableEarnings =
    totalEarnings - paidEarnings - reservedEarnings;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <section className="border-b border-zinc-800 pb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-400">
            BookForge
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">
                Author Studio
              </h1>

              <p className="mt-4 max-w-xl text-zinc-400">
                Your stories, your publishing space.
                Manage your books and keep your work moving.
              </p>
            </div>

            <Link
              href="/publish"
              className="inline-flex w-fit items-center justify-center rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
            >
              + Publish a book
            </Link>
          </div>
        </section>

        {/* Book statistics */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-3xl font-bold">{publishedCount}</p>
            <p className="mt-1 text-sm text-zinc-400">
              Published books
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-3xl font-bold">{archivedCount}</p>
            <p className="mt-1 text-sm text-zinc-400">
              Archived books
            </p>
          </div>
        </section>

        {/* Author earnings */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Your earnings
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Track your book sales and payments.
            </p>
            <Link href="/author/payout" className="mt-3 inline-flex text-sm font-semibold text-amber-400 hover:text-amber-300">Manage Payout Details</Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">
                Total earned
              </p>
              <p className="mt-3 text-2xl font-bold text-white">
                {formatKES(totalEarnings)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">
                Already paid
              </p>
              <p className="mt-3 text-2xl font-bold text-emerald-400">
                {formatKES(paidEarnings)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">
                Available earnings
              </p>
              <p className="mt-3 text-2xl font-bold text-amber-400">
                {formatKES(availableEarnings)}
              </p>
              {reservedEarnings > 0 && (
                <p className="mt-2 text-xs text-zinc-500">
                  {formatKES(reservedEarnings)} reserved for pending payouts
                </p>
              )}
            </div>

          </div>
        </section>

        {/* Books */}
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Your books
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Manage your published work from one place.
            </p>
          </div>

          {books.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center">
              <h3 className="text-xl font-semibold">
                Your bookshelf is waiting.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-zinc-400">
                Once you publish a book, it will appear here.
              </p>

              <Link
                href="/publish"
                className="mt-6 inline-block rounded-full bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-300"
              >
                Publish your first book
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => (
                <article
                  key={book.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="flex gap-4 p-4">
                    <div className="h-36 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={`Cover of ${book.title}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                          No cover
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-lg font-semibold">
                        {book.title}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-400">
                        {book.author}
                      </p>

                      <p className="mt-4 font-semibold text-amber-400">
                        KES {Number(book.price).toFixed(2)}
                      </p>

                      <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs ${
                          book.isArchived
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-emerald-950 text-emerald-400"
                        }`}
                      >
                        {book.isArchived ? "Archived" : "Published"}
                      </span>
                    </div>
                  </div>

                  <BookActions
                    book={{
                      id: book.id,
                      title: book.title,
                      description: book.description,
                      price: Number(book.price),
                    }}
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
