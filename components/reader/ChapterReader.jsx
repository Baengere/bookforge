import Link from "next/link"
import {Button} from "@/components/ui/button"
import {ArrowLeft, Clock} from "@/lib/icons"

export default function ChapterReader({children}){
    return(
        <main className="min-h-screen bg-[#0f0f10] text-zinc-100">

            <div className="
                pointer-events-none
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_45%)]"
            />

            {/* Progress Bar */}

            <div className="sticky top-0 z-50 h-1 bg-zinc-800">
                <div className="h-full w-1/3 bg-amber-400 transition-all duration-500"/>
            </div>

            {/* Reading Area */}

            <div className="mx-auto max-w-2xl px-6 py-10">
                {/* Back */}

                <Link href={"/"} className="mb-12 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
                <ArrowLeft className="h-4 w-4"/>
                Back
                </Link>

                {/* Book Title */}

                <p className="uppercase tracking-[0.35em] text-amber-400">The Metal Within</p>

                {/* Chapter One */}

                <h1 className="mt-3 text-5xl font-bold">Chapter One</h1>

                {/* Reading Time */}

                <div className="mt-4 mb-14 flex items items-center gap-2 text-sm  text-zinc-500">

                    <Clock className="h-4 w-4"/>

                    <span>8 min read</span>
                </div>

                {/* Story */}

                <article className="
                    prose
                    prose-invert
                    prose-lg
                    lg:prose-xl
                    mx-auto
                    max-w-3xl
                    px-6
                    py-20
                    leading-9
                    pros-headings:text-white
                    prose-p:text-zinc-300
                    prose-p:tracking-wide">
                        {children}

        
            <div className="mt-24 rounded-3xl border border-amber-500/20            bg-zinc-900 p-10 text-center">

            <h2 className="text-3xl font-bold">
                End of Free Sample
            </h2>

            <p className="mt-6 text-zinc-400 leading-8">
                Thank you for reading the opening chapter of
                <span className="text-white font-semibold"> The Metal Within</span>.
                Imondo's journey is only beginning.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">

            <Button size="lg">
                Buy The Book
            </Button>

            <Button variant="secondary" size="lg">
                Explore More Books
            </Button>

        </div>

            </div>

                </article>


            </div>

                <button
                    className="
                    fixed
                    bottom-6
                    right-6
                    rounded-full
                    border
                    border-zinc-700
                    bg-zinc-900
                    p-4
                    shadow-xl
                    transition
                    hover:scale-105
                    "
                >
                📖
            </button>
        </main>
    )
}