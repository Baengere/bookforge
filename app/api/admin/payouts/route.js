
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function POST(request) {
  const admin = await getAdminUser();

  if (!admin) {
    return Response.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request data." },
      { status: 400 }
    );
  }

  const authorId =
    typeof body.authorId === "string" ? body.authorId.trim() : "";

  if (!authorId || authorId.length > 255) {
    return Response.json(
      { error: "A valid author account is required." },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // An author must have a saved payout destination.
        const profile = await tx.authorPayoutProfile.findUnique({
          where: { authorId },
        });

        if (!profile) {
          return {
            error: "This author has not registered payout details.",
            status: 400,
          };
        }

        // Find completed earnings that have not been allocated.
        const purchases = await tx.purchase.findMany({
          where: {
            authorId,
            status: "completed",
            authorEarnings: { not: null },
            payoutItem: { is: null },
          },
          select: {
            id: true,
            authorEarnings: true,
          },
        });

        if (purchases.length === 0) {
          return {
            error: "This author has no available earnings.",
            status: 400,
          };
        }

        // Calculate the payout in cents to avoid rounding errors.
        const totalCents = purchases.reduce(
          (total, purchase) =>
            total +
            Math.round(Number(purchase.authorEarnings) * 100),
          0
        );

        if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
          return {
            error: "The available earnings amount is invalid.",
            status: 400,
          };
        }

        // Create the payout and snapshot the registered destination.
        const payout = await tx.authorPayout.create({
          data: {
            authorId,
            amount: (totalCents / 100).toFixed(2),
            payoutMethod: profile.payoutMethod,
            destinationEncrypted: profile.destinationEncrypted,
            destinationLastFour: profile.destinationLastFour,
            status: "PENDING",
          },
        });

        // Reserve every eligible purchase for this payout.
        await tx.payoutItem.createMany({
          data: purchases.map((purchase) => ({
            payoutId: payout.id,
            purchaseId: purchase.id,
            amount: purchase.authorEarnings,
          })),
        });

        return {
          success: true,
          payoutId: payout.id,
          amount: (totalCents / 100).toFixed(2),
          purchaseCount: purchases.length,
        };
      },
      {
        isolationLevel: "Serializable",
      }
    );

    if (result.error) {
      return Response.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error("ADMIN PAYOUT CREATION ERROR:", error);

    if (error.code === "P2002" || error.code === "P2034") {
      return Response.json(
        {
          error:
            "Some earnings may already have been reserved. Refresh the dashboard and try again.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { error: "Could not create the payout." },
      { status: 500 }
    );
  }
}
