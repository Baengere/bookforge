import { prisma } from "@/lib/prisma";

function normalizePhone(phone) {
  let value = String(phone || "").replace(/\s+/g, "");

  if (value.startsWith("+")) {
    value = value.slice(1);
  }

  if (value.startsWith("0")) {
    value = "254" + value.slice(1);
  }

  return value;
}

function getTimestamp() {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const bookId = Number(body.bookId);
    const email = body.email || null;
    const phone = normalizePhone(body.phone);

    if (!bookId) {
      return Response.json(
        { error: "Book ID is required." },
        { status: 400 }
      );
    }

    if (!phone) {
      return Response.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!/^2547\d{8}$/.test(phone)) {
      return Response.json(
        {
          error:
            "Please enter a valid Kenyan M-Pesa number, for example 0712345678.",
        },
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
        { error: "Book not found." },
        { status: 404 }
      );
    }

    const amount = Math.round(Number(book.price));

    if (!amount || amount < 1) {
      return Response.json(
        { error: "Invalid book price." },
        { status: 400 }
      );
    }

    /*
     * Create a pending purchase before contacting Safaricom.
     * The purchase ID will be used to identify this payment.
     */
    const purchase = await prisma.purchase.create({
      data: {
        bookId: book.id,
        email,
        amount: book.price,
        status: "pending",
      },
    });

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (
      !consumerKey ||
      !consumerSecret ||
      !passkey ||
      !shortcode ||
      !callbackUrl
    ) {
      return Response.json(
        {
          error: "M-Pesa environment variables are not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * Get OAuth access token from Safaricom.
     */
    const credentials = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("MPESA TOKEN ERROR:", tokenData);

      await prisma.purchase.update({
        where: {
          id: purchase.id,
        },
        data: {
          status: "failed",
        },
      });

      return Response.json(
        { error: "Could not connect to M-Pesa." },
        { status: 502 }
      );
    }

    const timestamp = getTimestamp();

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString("base64");

    /*
     * Send STK Push to the customer's phone.
     */
    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: callbackUrl,
          AccountReference: `BOOK-${purchase.id}`,
          TransactionDesc: `Purchase ${book.title}`,
        }),
      }
    );

    const stkData = await stkResponse.json();

    console.log("MPESA STK RESPONSE:", stkData);

    if (!stkResponse.ok || !stkData.CheckoutRequestID) {
      await prisma.purchase.update({
        where: {
          id: purchase.id,
        },
        data: {
          status: "failed",
        },
      });

      return Response.json(
        {
          error:
            stkData.errorMessage ||
            stkData.ResponseDescription ||
            "Could not send M-Pesa payment request.",
        },
        { status: 502 }
      );
    }

    /*
     * Store the CheckoutRequestID so the callback
     * can find this purchase later.
     */
    await prisma.purchase.update({
      where: {
        id: purchase.id,
      },
      data: {
        transactionId: stkData.CheckoutRequestID,
      },
    });

    return Response.json({
      success: true,
      purchaseId: purchase.id,
      checkoutRequestId: stkData.CheckoutRequestID,
      message:
        "M-Pesa payment request sent. Check your phone.",
    });
  } catch (error) {
    console.error("MPESA STK ERROR:", error);

    return Response.json(
      {
        error: "Could not start M-Pesa payment.",
      },
      { status: 500 }
    );
  }
}