import PayoutSettingsForm from "./PayoutSettingsForm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function AuthorPayoutPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] px-5 py-16 text-white">
        <h1 className="text-3xl font-bold">Payout Settings</h1>
        <p className="mt-4 text-zinc-400">
          Please sign in to manage your payout details.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-400">
          BookForge
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          Payout Settings
        </h1>

        <p className="mt-3 text-zinc-400">
          Choose where you would like to receive your book earnings.
          You can use an M-PESA number or a bank account.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <PayoutSettingsForm/>
        </div>
      </div>
    </main>
  );
}
