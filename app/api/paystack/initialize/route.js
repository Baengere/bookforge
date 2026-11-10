
import { prisma } from "@/lib/prisma";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server"; 

export async function POST(request) {
  let purchaseId;

  try {
    const {getUser} = await getKindeServerSession()
    const user = await getUser()

    if(!user?.email){
      return Response.json(
        {error: "Please sign in before purchasing a book."},
        {status:401}
      )
    }
    const {bookId} = await request.json();
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

    // const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const paystackMode = process.env.PAYSTACK_MODE

    if(paystackMode !== "test" && paystackMode !== "live"){
      return Response.json(
        {error:"Invalid paystack mode configuration"},
        {status:500}
      )
    }

    const secretKey = paystackMode === "test"? process.env.PAYSTACK_TEST_SECRET_KEY :
      process.env.PAYSTACK_SECRET_KEY

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

    if(book.isArchived){
      return Response.json(
        {error:"This book is nolonger available for Purchase!"},
        {status:410}
      )
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
        authorId: book.ownerId,
        email: customerEmail,
        amount: book.price,
        commissionRate: 15,
        status: "pending",
      },
    });

    purchaseId = purchase.id;

    const reference = `BF-${purchase.id}-${Date.now()}`;

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { transactionId: reference },
    });

    const appUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.APP_URL;

    if (!appUrl) {
      return Response.json(
        { error: "Application URL is not configured." },
        { status: 500 }
      );
      }

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
            `${appUrl}/buy/${book.id}?purchasedId=${purchase.id}`,
            metadata: JSON.stringify({
            purchaseId: purchase.id,
            bookId: book.id,
            bookTitle: book.title,
          }),
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
        { error: result.message || result.data?.message || "Could not start paystack checkout"},
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