import Link from "next/link";
import { BookOpen, Menu } from "@/lib/icons";
import {Button} from "@/components/ui/button"
import Logo from "@/components/shared/Logo"

export default function Navbar(){
    return(
        <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0B0B0B]/80 backdrop-blur">

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Logo/>

                {/*Desktop Navigation*/}
               <nav className="hidden items-center gap-8 md:flex">
                <Link
                    href="/"
                    className="text-zinc-300 transition hover:text-white"
                    >
                    Home
                </Link>

                <Link
                    href="/library"
                    className="text-zinc-300 transition hover:text-white"
                    >
                    Library
                </Link>

                <Link
                    href="/about"
                    className="text-zinc-300 transition hover:text-white"
                    >
                    About
                </Link>
                
            </nav>

                {/*Mobile Menu Button*/}

                <button className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 md:hidden">
                    <Menu className="h-6 w-6"/>
                </button>
            </div>
        </header>
    )
}
