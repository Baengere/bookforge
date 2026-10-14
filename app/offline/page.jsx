export const metadata = {
  title: "You're offline | BookForge",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0B] px-6 text-center text-zinc-100">
      <h1 className="text-3xl font-bold">You're offline</h1>
      <p className="mt-4 max-w-md text-zinc-400">
        Connect to the internet to explore BookForge.
        Books saved for offline reading will be available here
        once offline reading is set up.
      </p>
      <a
        href="/"
        className="mt-8 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black"
      >
        Try again
      </a>
    </main>
  );
}
