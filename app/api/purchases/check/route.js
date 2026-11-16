
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request) {
  try {
    // Identify the signed-in reader
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return Response.json(
        { error: "Please sign in to check your purchase." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const purchaseId = Number(body.purchaseId);

    if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
      return Response.json(
        { error: "A valid purchase ID is required." },
        { status: 400 }
      );
    }

    // Find the purchase only if it belongs to this reader
    const purchase = await prisma.purchase.findFirst({
      where: {
        id: purchaseId,
        email: {
          equals: user.email,
          mode: "insensitive",
        },
      },
      select: {
        status: true,
      },
    });

    if (!purchase) {
      return Response.json(
        { purchased: false, status: "not_found" }
      );
    }

    return Response.json({
      purchased: purchase.status === "completed",
      status: purchase.status,
    });

  } catch (error) {
    console.error("PURCHASE CHECK ERROR:", error);

    return Response.json(
      { error: "Could not check purchase." },
      { status: 500 }
    );
  }
}
