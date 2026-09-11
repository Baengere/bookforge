"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "@/lib/icons";
import Logo from "@/components/shared/Logo";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0B0B0B]/80 backdrop-blur">

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Logo />

                {/* Desktop Navigation */}
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

                    <Link
                        href="/publish"
                        className="text-zinc-300 transition hover:text-white"
                    >
                        Publish
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    className="rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white md:hidden"
                >
                    {menuOpen?(
                        <span className="text-3xl leading-none">x</span>
                    ):(<Menu className="h-7 w-7"/>)}
                </button>
            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <nav className="border-t border-zinc-800/60 bg-[#0B0B0B] px-6 py-5 md:hidden">
                    <div className="flex flex-col gap-1">

                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                        >
                            Home
                        </Link>

                        <Link
                            href="/library"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                        >
                            Library
                        </Link>

                        <Link
                            href="/about"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                        >
                            About
                        </Link>

                        <Link
                            href="/publish"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-4 py-3 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                        >
                            Publish
                        </Link>

                    </div>
                </nav>
            )}
        </header>
    );
}