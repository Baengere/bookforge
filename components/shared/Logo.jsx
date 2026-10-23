
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-zinc-950">
            <Image
                src="/icons/icon-512.png"
                alt="BookForge"
                width={48}
                height={48}
                priority
                className="h-full w-full scale-[1.25] object-cover"
            />
        </div>

      <div className="leading-tight">
        <p className="font-semibold tracking-wide antialiased text-white">BookForge</p>
        <p className="text-xs text-zinc-500">
          Independent Publishing
        </p>
      </div>
    </Link>
  );
}
