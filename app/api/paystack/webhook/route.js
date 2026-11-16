
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    // const secretKey = process.env.PAYSTACK_SECRET_KEY;
    // const signature = request.headers.get("x-paystack-signature");

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

  const signature = request.headers.get("x-paystack-signature");

    // 
    if (!secretKey || !signature) {
      return Response.json(
        { error: "Missing configuration or signature." },
        { status: 401 }
      );
    }

    // Verify Paystack's signature using the exact raw request body.
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

    // Only process successful payments.
    if (event.event !== "charge.success") {
      return Response.json({ received: true });
    }

    const reference = event.data?.reference;

    if (!reference) {
      return Response.json({ received: true });
    }

    // Find the purchase and its book owner's ID.
    const purchase = await prisma.purchase.findFirst({
      where: {
        transactionId: reference,
      },
      include: {
        book: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!purchase) {
      console.error("PAYSTACK WEBHOOK: Purchase not found:", reference);

      return Response.json(
        { error: "Purchase not found." },
        { status: 500 }
      );
    }

    // Verify the transaction directly with Paystack.
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
      console.error("PAYSTACK VERIFY ERROR:", verifyResult);

      return Response.json(
        { error: "Could not verify transaction." },
        { status: 502 }
      );
    }

    const transaction = verifyResult.data;

    // Confirm that the transaction matches the expected purchase.
    const expectedAmount = Math.round(Number(purchase.amount) * 100);

    if (
      transaction.status !== "success" ||
      transaction.reference !== reference ||
      transaction.currency !== "KES" ||
      Number(transaction.amount) !== expectedAmount ||
      transaction.domain !== paystackMode
    ) {
      console.error("PAYSTACK TRANSACTION VERIFICATION FAILED:", {
        purchaseId: purchase.id,
        reference,
        transactionStatus: transaction.status,
        transactionAmount: transaction.amount,
        transactionCurrency: transaction.currency,
        transactionDomain: transaction.domain,
        expectedAmount,
      });

      return Response.json(
        { error: "Transaction verification failed." },
        { status: 400 }
      );
    }

    // Do not process a purchase that is already completed.
    if (purchase.status === "completed") {
      return Response.json({ received: true });
    }

    // Identify the author.
    const authorId = purchase.authorId ?? purchase.book.ownerId;

    if (!authorId) {
      console.error("PURCHASE HAS NO ASSIGNED AUTHOR:", purchase.id);

      return Response.json(
        { error: "Purchase has no assigned author." },
        { status: 500 }
      );
    }

    // Paystack returns fees in the currency's smallest unit.
    const processingFeeCents = Number(transaction.fees);

    if (
      transaction.fees === null ||
      transaction.fees === undefined ||
      !Number.isSafeInteger(processingFeeCents) ||
      processingFeeCents < 0 ||
      processingFeeCents > expectedAmount
    ) {
      console.error("INVALID PAYSTACK PROCESSING FEE:", {
        purchaseId: purchase.id,
        fees: transaction.fees,
      });

      return Response.json(
        { error: "Could not determine the processing fee." },
        { status: 502 }
      );
    }

    // Use the commission rate saved when checkout was initialized.
    const commissionRate = purchase.commissionRate ?? 15;

    if (
      !Number.isInteger(commissionRate) ||
      commissionRate < 0 ||
      commissionRate > 100
    ) {
      return Response.json(
        { error: "Invalid commission rate." },
        { status: 500 }
      );
    }

    // Calculate the distribution in cents to avoid floating-point errors.
    const netAmountCents = expectedAmount - processingFeeCents;

    const platformCommissionCents = Math.round(
      netAmountCents * commissionRate / 100
    );

    const authorEarningsCents =
      netAmountCents - platformCommissionCents;

    // Convert cents to KES.
    const toKES = (cents) => (cents / 100).toFixed(2);

    // Complete the purchase only if it is still pending.
    // This protects against simultaneous duplicate webhooks.
    const updated = await prisma.purchase.updateMany({
      where: {
        id: purchase.id,
        status: {
          in:["pending","failed"]
        },
      },
      data: {
        status: "completed",
        authorId,
        commissionRate,
        processingFee: toKES(processingFeeCents),
        netAmount: toKES(netAmountCents),
        platformCommission: toKES(platformCommissionCents),
        authorEarnings: toKES(authorEarningsCents),
      },
    });

    if (updated.count === 0) {
      return Response.json({ received: true });
    }

    console.log("PAYSTACK PAYMENT COMPLETED:", {
      purchaseId: purchase.id,
      grossAmount: toKES(expectedAmount),
      processingFee: toKES(processingFeeCents),
      netAmount: toKES(netAmountCents),
      platformCommission: toKES(platformCommissionCents),
      authorEarnings: toKES(authorEarningsCents),
    });

    return Response.json({ received: true });
  } catch (error) {
    console.error("PAYSTACK WEBHOOK ERROR:", error);

    return Response.json(
      { error: "Could not process webhook." },
      { status: 500 }
    );
  }
}
