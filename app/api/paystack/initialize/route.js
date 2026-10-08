
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  let purchaseId;

  try {
    const { bookId, email } = await request.json();

    const id = Number(bookId);
    const customerEmail = String(email || "").trim();

    if (!Number.isInteger(id) || id < 1) {
      return Response.json(
        { error: "A valid book ID is required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return Response.json(
        { error: "Paystack is not configured." },
        { status: 500 }
      );
    }

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return Response.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    const amount = Math.round(Number(book.price) * 100);

    if (!Number.isFinite(amount) || amount < 300) {
      return Response.json(
        { error: "The book price must be at least KES 3." },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.create({
      data: {
        bookId: book.id,
        email: customerEmail,
        amount: book.price,
        status: "pending",
      },
    });

    purchaseId = purchase.id;

    const reference = `BF-${purchase.id}-${Date.now()}`;

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { transactionId: reference },
    });

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount,
          currency: "KES",
          reference,
          channels: ["mobile_money"],
          callback_url:
            `https://bookforge-lilac.vercel.app/buy/${book.id}` +
            `?purchaseId=${purchase.id}`,
          metadata: {
            purchaseId: purchase.id,
            bookId: book.id,
            bookTitle: book.title,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status || !result.data?.authorization_url) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "failed" },
      });

      console.error("PAYSTACK INITIALIZE ERROR:", result);

      return Response.json(
        { error: "Could not start Paystack checkout." },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      purchaseId: purchase.id,
      reference,
      authorizationUrl: result.data.authorization_url,
    });
  } catch (error) {
    console.error("PAYSTACK INITIALIZE ERROR:", error);

    if (purchaseId) {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: "failed" },
      }).catch(console.error);
    }

    return Response.json(
      { error: "Could not start payment." },
      { status: 500 }
    );
  }
}