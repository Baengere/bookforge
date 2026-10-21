
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getAdminUser() {
  const adminEmail = process.env.BOOKFORGE_ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  // Fail closed if the admin email is not configured.
  if (!adminEmail) {
    return null;
  }

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const userEmail = user?.email?.trim().toLowerCase();

  if (!userEmail || userEmail !== adminEmail) {
    return null;
  }

  return user;
}
