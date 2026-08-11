import Image from "next/image";
import Link from "next/link";
import {Button} from "@/components/ui/button"
import {BookOpen, ShoppingCart} from "@/lib/icons"

export default function Hero(){
  return(
    <section className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[90vh] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">
        {/* {Left} */}

        <div>

          <p className="mb-4 uppercase tracking-[0.3em] text-amber-500">
            Now Available
          </p>

          <h1 className="mb-10 text-5xl font-bold leading-tight lg:text-7xl">
            The Metal Within.
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-8 text-zinc-400">
            Power came with no warning. Control would not come so easily. As Imondo begins to uncover a transformation unlike anything he imagined, every choice pushes him closer to discovering who, and what, he is becoming.
          </p>

          <div className="flex flex-wrap gap-4">

            <Button size="lg">

              <BookOpen className="mr-2 h-5 w-5"/>
                <Link href={"/library/metal-within/read"}>Read Chapter One</Link>
            </Button>

            <Button size="lg" variant="secondary">
              <ShoppingCart className="mr-2 h-5 w-5"/>
              Read the Full Book
            </Button>

          </div>
        </div>

        {/* {Right} */}

        <div className="relative flex justify-center">
          {/* GLOW */}

          <div className="absolute h-96 w-96 rounded-full bg-amber-500/20 blur-3xl"/>
            <Image
             src="/books/metal-within/cover.png"
             alt="Book Cover"
             width={300}
             height={500}
             className="relative rounded-2xl shadow-2xl shadow-indigo-500/20"
             preload
            />

        </div>
      </div>
    </section>
  )
}