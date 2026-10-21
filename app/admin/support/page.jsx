
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export default async function AdminSupportPage() {
  const admin = await getAdminUser();

  // Do not fetch private support requests unless the admin check passes.
  if (!admin) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold">Administrator access required</h1>
          <p className="mt-4 text-zinc-400">
            Sign in with the authorized BookForge administrator account
            to access support requests.
          </p>
          <Link
            href="/api/auth/login?post_login_redirect_url=/admin/support"
            className="mt-6 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const requests = await prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
          BookForge administration
        </p>

        <h1 className="mt-3 text-4xl font-bold">Support requests</h1>
        <p className="mt-3 text-zinc-400">
          Review reader questions, payment problems, and feedback.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-zinc-700 px-4 py-2">
            Total shown: {requests.length}
          </span>
          <span className="rounded-full border border-amber-500/40 px-4 py-2 text-amber-300">
            Open: {requests.filter((item) => item.status === "open").length}
          </span>
          <span className="rounded-full border border-emerald-500/40 px-4 py-2 text-emerald-300">
            Resolved: {requests.filter((item) => item.status === "resolved").length}
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 p-8">
            <h2 className="text-xl font-semibold">No requests yet</h2>
            <p className="mt-2 text-zinc-400">
              New reader messages will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {requests.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Request #{item.id}: {item.category.replaceAll("_", " ")}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.email}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      item.status === "resolved"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.bookTitle && (
                  <p className="mt-4 text-sm text-zinc-300">
                    Book: {item.bookTitle}
                  </p>
                )}

                <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-200">
                  {item.message}
                </p>

                <p className="mt-4 text-xs text-zinc-500">
                  Submitted: {item.createdAt.toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}

        <p className="mt-10 text-sm text-zinc-500">
          Showing up to the 100 most recent requests.
        </p>
      </div>
    </main>
  );
}
