import LibraryShelf from "@/components/library/LibraryShelf";

export default function LibraryPage() {
  return (
    <main className="min-h-screen p-10 bg-[#0B0B0B] text-white">

      {/* Header */}

      <section className="border-b border-zinc-800">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <p className="uppercase tracking-[0.4em] text-amber-400">
            Library
          </p>

          <h1 className="mt-4 text-5xl font-bold">
            Discover Your Next Story
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400">
            A growing collection of independent stories crafted to be read,
            remembered, and shared.
          </p>

        </div>

      </section>

      <LibraryShelf />

      <section className="mt-24">

            <h2 className="text-3xl font-bold">
                Coming Soon
            </h2>

            <div className="mt-8 rounded-3xl p-12 text-center">

                <p className="text-2xl font-semibold">
                    More stories are on their way.
                </p>

                <p className="mt-4 text-zinc-500">
                    This library grows with every new adventure.
                </p>

            </div>

        </section>

    </main>
  );
}