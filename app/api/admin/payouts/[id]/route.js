import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function PATCH(request, { params }) {
  const admin = await getAdminUser();

  if (!admin) {
    return Response.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const payoutId = Number(id);

  if (!Number.isSafeInteger(payoutId) || payoutId <= 0) {
    return Response.json(
      { error: "Invalid payout ID." },
      { status: 400 }
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

  try {
    if (body.action === "paid") {
      const transferReference =
        typeof body.transferReference === "string"
          ? body.transferReference.trim()
          : "";

      if (
        transferReference.length < 3 ||
        transferReference.length > 100
      ) {
        return Response.json(
          { error: "Enter a valid transfer reference." },
          { status: 400 }
        );
      }

      const result = await prisma.authorPayout.updateMany({
        where: {
          id: payoutId,
          status: { in: ["PENDING", "PROCESSING"] },
        },
        data: {
          status: "PAID",
          transferReference,
          paidAt: new Date(),
          failureReason: null,
        },
      });

      if (result.count === 0) {
        return Response.json(
          { error: "Payout not found or is no longer awaiting payment." },
          { status: 409 }
        );
      }

      return Response.json({
        success: true,
        message: "Payout marked as paid.",
      });
    }

    if (body.action === "failed") {
      const failureReason =
        typeof body.failureReason === "string"
          ? body.failureReason.trim()
          : "";

      if (
        failureReason.length < 5 ||
        failureReason.length > 500
      ) {
        return Response.json(
          { error: "Enter a failure reason between 5 and 500 characters." },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const payout = await tx.authorPayout.findUnique({
          where: { id: payoutId },
          select: { id: true, status: true },
        });

        if (
          !payout ||
          !["PENDING", "PROCESSING"].includes(payout.status)
        ) {
          return false;
        }

        // Release the earnings so they can be included in a future payout.
        await tx.payoutItem.deleteMany({
          where: { payoutId },
        });

        await tx.authorPayout.update({
          where: { id: payoutId },
          data: {
            status: "FAILED",
            failureReason,
          },
        });

        return true;
      });

      if (!result) {
        return Response.json(
          { error: "Payout not found or is no longer awaiting payment." },
          { status: 409 }
        );
      }

      return Response.json({
        success: true,
        message: "Payout marked as failed. Its earnings have been released.",
      });
    }

    return Response.json(
      { error: "Choose a valid payout action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("ADMIN PAYOUT UPDATE ERROR:", error);

    if (error.code === "P2002") {
      return Response.json(
        { error: "That transfer reference has already been used." },
        { status: 409 }
      );
    }

    return Response.json(
      { error: "Could not update the payout." },
      { status: 500 }
    );
  }
}