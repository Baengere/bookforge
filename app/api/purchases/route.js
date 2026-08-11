import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const bookId = Number(body.bookId);
    const email = body.email || null;

    if (!bookId) {
      return Response.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return Response.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    const purchase = await prisma.purchase.create({
      data: {
        bookId: book.id,
        email,
        amount: book.price,
        status: "completed",
        transactionId: `TEST-${Date.now()}`,
      },
    });

    return Response.json(purchase);
  } catch (error) {
    console.error("PURCHASE ERROR:", error);

    return Response.json(
      { error: "Could not create purchase", details:error.message },
      { status: 500 }
    );
  }
}