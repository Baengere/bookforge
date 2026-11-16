
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request) {
  try {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return Response.json(
        { error: "Please sign in before purchasing a book." },
        { status: 401 }
      );
    }

    const { bookId } = await request.json();
    const customerEmail = user.email.trim().toLowerCase();
    const id = Number(bookId);

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

    // Select the correct Paystack environment.
    const paystackMode = process.env.PAYSTACK_MODE;

    if (paystackMode !== "test" && paystackMode !== "live") {
      return Response.json(
        { error: "Invalid Paystack mode configuration." },
        { status: 500 }
      );
    }

    const secretKey =
      paystackMode === "test"
        ? process.env.PAYSTACK_TEST_SECRET_KEY
        : process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return Response.json(
        { error: "Paystack is not configured." },
        { status: 500 }
      );
    }

    // Validate the application URL before creating a purchase.
    const appUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.APP_URL;

    if (!appUrl) {
      return Response.json(
        { error: "Application URL is not configured." },
        { status: 500 }
      );
    }

    const normalizedAppUrl = appUrl.replace(/\/+$/, "");

    // Retrieve the book from the database.
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return Response.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    if (book.isArchived) {
      return Response.json(
        { error: "This book is no longer available for purchase." },
        { status: 410 }
      );
    }

    // Calculate the amount using the database price.
    const amount = Math.round(Number(book.price) * 100);

    if (!Number.isSafeInteger(amount) || amount < 300) {
      return Response.json(
        { error: "The book price must be at least KES 3." },
        { status: 400 }
      );
    }

    // Create a pending purchase.
    const purchase = await prisma.purchase.create({
      data: {
        bookId: book.id,
        authorId: book.ownerId,
        email: customerEmail,
        amount: book.price,
        commissionRate: 15,
        status: "pending",
      },
    });

    // Generate and save the transaction reference.
    const reference = `BF-${purchase.id}-${Date.now()}`;

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { transactionId: reference },
    });

    // Initialize checkout with Paystack.
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
          callback_url: `${normalizedAppUrl}/buy/${book.id}?purchaseId=${purchase.id}`,
          metadata: {
            purchaseId: purchase.id,
            bookId: book.id,
            bookTitle: book.title,
          },
        }),
      }
    );

    const result = await response.json();

    // An explicit rejection from Paystack is a confirmed failure.
    if (
      !response.ok &&
      response.status >=400 &&
      response.status < 500
    ) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "failed" },
      });

      console.error("PAYSTACK INITIALIZE REJECTED:", result);

      return Response.json(
        {
          error:
            result.message ||
            result.data?.message ||
            "Could not start Paystack checkout.",
        },
        { status: 502 }
      );
    }

    // An unclear response must not automatically fail the purchase.
    if (!response.ok || !result.status || !result.data?.authorization_url) {
      console.error("PAYSTACK INITIALIZE UNCERTAIN:", result);

      return Response.json(
        {
          error:
            "Checkout initialization could not be confirmed. Please check your purchase status before trying again.",
        },
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

    // Leave an existing purchase pending.
    // The request may have reached Paystack despite the error.

    return Response.json(
      { error: "Could not confirm payment initialization." },
      { status: 500 }
    );
  }
}
