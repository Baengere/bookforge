import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const purchaseId = Number(body.purchaseId);
    const bookId = Number(body.bookId);
    const email = body.email;

    if (purchaseId) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          id: purchaseId,
        },
      });

      return Response.json({
        purchased: purchase?.status === "completed",
        status: purchase?.status || "not_found",
      });
    }

    if (!bookId || !email) {
      return Response.json(
        { purchased: false },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        bookId,
        email,
        status: "completed",
      },
    });

    return Response.json({
      purchased: !!purchase,
    });
  } catch (error) {
    console.error("PURCHASE CHECK ERROR:", error);

    return Response.json(
      {
        purchased: false,
        error: "Could not check purchase",
      },
      { status: 500 }
    );
  }
}