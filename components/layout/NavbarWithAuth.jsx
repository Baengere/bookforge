
import Navbar from "@/components/layout/Navbar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function NavbarWithAuth() {
  const { isAuthenticated } = getKindeServerSession();
  const signedIn = await isAuthenticated();

  return <Navbar isAuthenticated={signedIn} />;
}
