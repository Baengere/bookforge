import BookCard from "./BookCard";

export default function LibraryShelf() {
  return (
    <section className="mt-20">

      <div className="mb-8 flex items-center justify-between">

        <h2 className="text-3xl font-bold">
          Available Now
        </h2>

        <p className="text-zinc-500">
          1 Book
        </p>

      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

        <BookCard />

      </div>

    </section>
  );
}