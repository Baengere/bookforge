
import Navbar from "@/components/layout/Navbar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getAdminUser } from "@/lib/admin";

export default async function NavbarWithAuth() {
  const { isAuthenticated } = getKindeServerSession();
  const signedIn = await isAuthenticated();

  const admin = signedIn ? await getAdminUser() : null;

  return (
    <Navbar
      isAuthenticated={signedIn}
      isAdmin={Boolean(admin)}
    />
  );
}
