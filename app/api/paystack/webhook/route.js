import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const signature = request.headers.get("x-paystack-signature");

    if (!secretKey || !signature) {
      return Response.json(
        { error: "Missing configuration or signature." },
        { status: 401 }
      );
    }

    // Read the raw body because Paystack signs the exact payload.
    const rawBody = await request.text();

    const expectedSignature = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const received = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return Response.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);

    // We only care about successful payments.
    if (event.event !== "charge.success") {
      return Response.json({ received: true });
    }

    const reference = event.data?.reference;

    if (!reference) {
      return Response.json({ received: true });
    }

    // Find the BookForge purchase created when checkout started.
    const purchase = await prisma.purchase.findFirst({
      where: {
        transactionId: reference,
      },
    });

    if (!purchase) {
      console.error(
        "PAYSTACK WEBHOOK: Purchase not found:",
        reference
      );

      return Response.json(
        { error: "Purchase not found." },
        { status: 500 }
      );
    }

    /*
     * Ask Paystack directly whether this transaction
     * is actually successful.
     */
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const verifyResult = await verifyResponse.json();

    if (
      !verifyResponse.ok ||
      !verifyResult.status ||
      !verifyResult.data
    ) {
      console.error(
        "PAYSTACK VERIFY ERROR:",
        verifyResult
      );

      return Response.json(
        { error: "Could not verify transaction." },
        { status: 502 }
      );
    }

    const transaction = verifyResult.data;

    /*
     * These checks are the real gate.
     *
     * BookForge only unlocks the book if Paystack
     * confirms every important part of the transaction.
     */
    const expectedAmount =
      Math.round(Number(purchase.amount) * 100);

    if (
      transaction.status !== "success" ||
      transaction.reference !== reference ||
      transaction.currency !== "KES" ||
      Number(transaction.amount) !== expectedAmount ||
      transaction.domain !== "live"
    ) {
      console.error(
        "PAYSTACK TRANSACTION VERIFICATION FAILED:",
        {
          purchaseId: purchase.id,
          reference,
          transactionStatus: transaction.status,
          transactionAmount: transaction.amount,
          transactionCurrency: transaction.currency,
          transactionDomain: transaction.domain,
          expectedAmount,
        }
      );

      return Response.json(
        { error: "Transaction verification failed." },
        { status: 400 }
      );
    }

    /*
     * Prevent duplicate fulfillment.
     *
     * If Paystack sends the same webhook again,
     * we do not create another purchase or perform
     * another fulfillment.
     */
    if (purchase.status === "completed") {
      return Response.json({ received: true });
    }

    await prisma.purchase.update({
      where: {
        id: purchase.id,
      },
      data: {
        status: "completed",
      },
    });

    console.log(
      "PAYSTACK PAYMENT COMPLETED:",
      purchase.id
    );

    return Response.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "PAYSTACK WEBHOOK ERROR:",
      error
    );

    return Response.json(
      { error: "Could not process webhook." },
      { status: 500 }
    );
  }
}