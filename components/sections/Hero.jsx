import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart } from "@/lib/icons";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[90vh] max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">

        {/* Left */}
        <div>

          <p className="mb-4 uppercase tracking-[0.3em] text-amber-500">
            Now Available
          </p>

          <h1 className="mb-6 text-5xl font-bold leading-tight lg:mb-10 lg:text-7xl">
            The Metal Within.
          </h1>

          <p className="mb-8 max-w-xl text-lg leading-8 text-zinc-400">
            Power came with no warning. Control would not come so easily.
            As Imondo begins to uncover a transformation unlike anything he
            imagined, every choice pushes him closer to discovering who, and
            what, he is becoming.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/library/1/read">
                  <Button size="lg">
                    <BookOpen className="mr-2 h-5 w-5" />
                      Read Chapter One
                  </Button>
              </Link>

              <Link href="/buy/1">
                <Button size="lg" variant="secondary">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy the Book
                </Button>
              </Link>
          </div>

        </div>

        {/* Right */}
        <div className="relative flex justify-center">

          {/* Glow */}
          <div className="absolute h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />

          <Image
            src="/books/metal-within/cover.png"
            alt="The Metal Within book cover"
            width={300}
            height={500}
            className="relative rounded-2xl shadow-2xl shadow-indigo-500/20"
            priority
          />

        </div>

      </div>
    </section>
  );
}