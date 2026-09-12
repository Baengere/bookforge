import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("MPESA CALLBACK:", JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return Response.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    if (!checkoutRequestId) {
      return Response.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        transactionId: checkoutRequestId,
      },
    });

    if (!purchase) {
      console.error(
        "MPESA CALLBACK: Purchase not found",
        checkoutRequestId
      );

      return Response.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    if (resultCode === 0) {
      const metadata = callback.CallbackMetadata?.Item || [];

      const receiptItem = metadata.find(
        (item) => item.Name === "MpesaReceiptNumber"
      );

      const receiptNumber = receiptItem?.Value
        ? String(receiptItem.Value)
        : checkoutRequestId;

      await prisma.purchase.update({
        where: {
          id: purchase.id,
        },
        data: {
          status: "completed",
          transactionId: receiptNumber,
        },
      });

      console.log(
        `MPESA PAYMENT COMPLETED: Purchase ${purchase.id}`
      );
    } else {
      await prisma.purchase.update({
        where: {
          id: purchase.id,
        },
        data: {
          status: "failed",
        },
      });

      console.log(
        `MPESA PAYMENT FAILED: Purchase ${purchase.id}`
      );
    }

    return Response.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    console.error("MPESA CALLBACK ERROR:", error);

    /*
     * Still acknowledge the callback so Safaricom
     * does not keep retrying it unnecessarily.
     */
    return Response.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  }
}