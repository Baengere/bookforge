
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { decryptPayoutDestination } from "@/lib/payout-encryption";
import CreatePayoutButton from "./CreatePayoutButton";
import PayoutActions from './PayoutActions'

const formatKES = (cents) => `KES ${(cents / 100).toFixed(2)}`;

export default async function AdminPayoutsPage() {
  const admin = await getAdminUser();

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold">
            Administrator access required
          </h1>
          <p className="mt-4 text-zinc-400">
            Sign in with the authorized BookForge administrator account
            to manage author payouts.
          </p>
          <Link
            href="/api/auth/login?post_login_redirect_url=/admin/payouts"
            className="mt-6 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  // Retrieve recent payout records.
  const payoutHistory = await prisma.authorPayout.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  // Retrieve completed earnings that have not been allocated to a payout.
  const purchases = await prisma.purchase.findMany({
    where: {
      status: "completed",
      authorId: { not: null },
      authorEarnings: { not: null },
      payoutItem: { is: null },
    },
    select: {
      id: true,
      authorId: true,
      authorEarnings: true,
    },
  });

  // Group the unallocated earnings by author.
  const earningsByAuthor = new Map();

  for (const purchase of purchases) {
    const authorId = purchase.authorId;
    const amountCents = Math.round(
      Number(purchase.authorEarnings) * 100
    );

    if (!earningsByAuthor.has(authorId)) {
      earningsByAuthor.set(authorId, {
        authorId,
        amountCents: 0,
        purchaseCount: 0,
      });
    }

    const author = earningsByAuthor.get(authorId);
    author.amountCents += amountCents;
    author.purchaseCount += 1;
  }

  const authors = Array.from(earningsByAuthor.values());

  // Retrieve payout profiles only for authors with unallocated earnings.
  const profiles = authors.length
    ? await prisma.authorPayoutProfile.findMany({
        where: {
          authorId: {
            in: authors.map((author) => author.authorId),
          },
        },
        select: {
          authorId: true,
          payoutMethod: true,
          destinationEncrypted: true,
          destinationLastFour: true,
        },
      })
    : [];

  const profileMap = new Map(
    profiles.map((profile) => [profile.authorId, profile])
  );

  // Decrypt destinations only after the administrator check.
  const payoutAuthors = authors.map((author) => {
    const profile = profileMap.get(author.authorId);

    let destination = null;

    if (profile) {
      try {
        destination = JSON.parse(
          decryptPayoutDestination(profile.destinationEncrypted)
        );
      } catch {
        destination = null;
      }
    }

    return {
      ...author,
      profile,
      destination,
    };
  });

  const totalUnallocated = authors.reduce(
    (total, author) => total + author.amountCents,
    0
  );

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
          BookForge administration
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Author payouts
        </h1>

        <p className="mt-3 text-zinc-400">
          Review author earnings and registered payment destinations.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm text-zinc-400">
            Total unallocated author earnings
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-400">
            {formatKES(totalUnallocated)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            These earnings have not yet been assigned to payout records.
            Confirm settlement before making payments.
          </p>
        </div>

        {/* Recent payout history */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Recent payout records
          </h2>

          {payoutHistory.length === 0 ? (
            <p className="mt-4 text-zinc-400">
              No payouts have been created yet.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {payoutHistory.map((payout) => (
                <article
                  key={payout.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        Payout #{payout.id}
                      </h3>
                      <p className="mt-1 break-all text-sm text-zinc-500">
                        {payout.authorId}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-amber-400">
                        KES {Number(payout.amount).toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {payout.status}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 border-t border-zinc-800 pt-4 text-sm text-zinc-400 sm:grid-cols-2">
                    <p>
                      Method: {payout.payoutMethod === "MPESA"
                        ? "M-PESA"
                        : "Bank"}
                    </p>
                    <p>
                      Destination ending: {payout.destinationLastFour || "Unavailable"}
                    </p>
                    <p>
                      Sales included: {payout._count.items}
                    </p>
                    <p>
                      Created: {payout.createdAt.toLocaleString("en-KE")}
                    </p>

                    {payout.paidAt && (
                      <p>
                        Paid: {payout.paidAt.toLocaleString("en-KE")}
                      </p>
                    )}

                    {payout.transferReference && (
                      <p className="sm:col-span-2">
                        Transfer reference: {payout.transferReference}
                      </p>
                    )}

                    {payout.failureReason && (
                      <p className="text-red-400 sm:col-span-2">
                        Failure reason: {payout.failureReason}
                      </p>
                    )}
                  </div>
                  {["PENDING", "PROCESSING"].includes(payout.status) && (
                    <PayoutActions payoutId={payout.id}/>
                  ) }
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Earnings available for new payouts */}
        {payoutAuthors.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 p-8">
            <h2 className="text-xl font-semibold">
              No unallocated earnings
            </h2>
            <p className="mt-2 text-zinc-400">
              Completed author earnings will appear here.
            </p>
          </div>
        ) : (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">
              Earnings available for payout
            </h2>

            <div className="mt-5 space-y-5">
              {payoutAuthors.map((author) => (
                <article
                  key={author.authorId}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        Author account
                      </h3>
                      <p className="mt-1 break-all text-sm text-zinc-500">
                        {author.authorId}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-zinc-400">
                        Unallocated earnings
                      </p>
                      <p className="mt-1 text-xl font-bold text-amber-400">
                        {formatKES(author.amountCents)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-zinc-800 pt-5">
                    <p className="text-sm text-zinc-400">
                      {author.purchaseCount} completed sale(s)
                    </p>

                    {!author.profile ? (
                      <p className="mt-4 text-amber-300">
                        No payout details registered.
                      </p>
                    ) : !author.destination ? (
                      <p className="mt-4 text-red-400">
                        Could not decrypt the saved payout destination.
                        Check the encryption key configuration.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-2 text-sm">
                        <p>
                          <span className="text-zinc-400">Method: </span>
                          {author.profile.payoutMethod === "MPESA"
                            ? "M-PESA"
                            : "Bank account"}
                        </p>

                        {author.profile.payoutMethod === "MPESA" ? (
                          <p>
                            <span className="text-zinc-400">Phone: </span>
                            {author.destination.phoneNumber}
                          </p>
                        ) : (
                          <>
                            <p>
                              <span className="text-zinc-400">
                                Account holder:{" "}
                              </span>
                              {author.destination.accountHolderName}
                            </p>
                            <p>
                              <span className="text-zinc-400">Bank: </span>
                              {author.destination.bankName}
                            </p>
                            <p>
                              <span className="text-zinc-400">
                                Account number:{" "}
                              </span>
                              {author.destination.accountNumber}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {author.profile && author.destination && (
                      <CreatePayoutButton authorId={author.authorId} />
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <Link
          href="/admin/support"
          className="mt-10 inline-block text-sm text-amber-400 hover:text-amber-300"
        >
          ← Back to support requests
        </Link>
      </div>
    </main>
  );
}
