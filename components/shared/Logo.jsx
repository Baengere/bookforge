import Link from "next/link"
import { BookOpen } from "@/lib/icons"

export default function Logo(){
    return(
        <Link href={"/"} className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-amber-400"/>
            <div className="leading-tight">
                <p className="font-semibold tracking-wide">BooKForge</p>
                <p className="text-xs text-zinc-500">Independent Publishing</p>
            </div>
        </Link>
    )
}