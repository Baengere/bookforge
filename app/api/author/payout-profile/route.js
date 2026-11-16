
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { encryptPayoutDestination } from "@/lib/payout-encryption";

export async function POST(request) {
  try {
    // 1. Identify the signed-in author
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return Response.json(
        { error: "Please sign in to save payout details." },
        { status: 401 }
      );
    }

    // 2. Read the submitted details
    const body = await request.json();
    const { payoutMethod } = body;

    if (!["MPESA", "BANK"].includes(payoutMethod)) {
      return Response.json(
        { error: "Choose a valid payout method." },
        { status: 400 }
      );
    }

    let destination;
    let lastFour;

    // 3. Validate M-PESA details
    if (payoutMethod === "MPESA") {
      const phoneNumber = body.phoneNumber;

      if (typeof phoneNumber !== "string") {
        return Response.json(
          { error: "Enter a valid M-PESA phone number." },
          { status: 400 }
        );
      }

      const cleanedPhone = phoneNumber.replace(/[\s-]/g, "");
      const match = cleanedPhone.match(/^(?:\+254|254|0)([17]\d{8})$/);

      if (!match) {
        return Response.json(
          { error: "Enter a valid Kenyan mobile number." },
          { status: 400 }
        );
      }

      const normalizedPhone = `+254${match[1]}`;

      destination = {
        phoneNumber: normalizedPhone,
      };

      lastFour = normalizedPhone.slice(-4);
    }

    // 4. Validate bank details
    if (payoutMethod === "BANK") {
      const {
        accountHolderName,
        bankName,
        accountNumber,
      } = body;

      if (
        typeof accountHolderName !== "string" ||
        typeof bankName !== "string" ||
        typeof accountNumber !== "string"
      ) {
        return Response.json(
          { error: "Complete all bank account fields." },
          { status: 400 }
        );
      }

      const holder = accountHolderName.trim();
      const bank = bankName.trim();
      const account = accountNumber.trim();

      if (
        holder.length < 2 ||
        holder.length > 100 ||
        bank.length < 2 ||
        bank.length > 100 ||
        !/^[A-Za-z0-9-]{4,34}$/.test(account)
      ) {
        return Response.json(
          { error: "Please check your bank account details." },
          { status: 400 }
        );
      }

      destination = {
        accountHolderName: holder,
        bankName: bank,
        accountNumber: account,
      };

      lastFour = account.slice(-4);
    }

    // 5. Encrypt the complete destination
    const destinationEncrypted = encryptPayoutDestination(
      JSON.stringify(destination)
    );

    // 6. Save or update this author's payout profile
    await prisma.authorPayoutProfile.upsert({
      where: {
        authorId: user.id,
      },
      create: {
        authorId: user.id,
        payoutMethod,
        destinationEncrypted,
        destinationLastFour: lastFour,
      },
      update: {
        payoutMethod,
        destinationEncrypted,
        destinationLastFour: lastFour,
      },
    });

    // 7. Return only safe information
    return Response.json({
      success: true,
      message: "Payout details saved securely.",
      payoutProfile: {
        payoutMethod,
        destinationLastFour: lastFour,
      },
    });

  } catch (error) {
    console.error("PAYOUT PROFILE SAVE ERROR:", error);

    return Response.json(
      { error: "Could not save payout details." },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return Response.json(
        { error: "Please sign in to view payout details." },
        { status: 401 }
      );
    }

    const profile = await prisma.authorPayoutProfile.findUnique({
      where: {
        authorId: user.id,
      },
      select: {
        payoutMethod: true,
        destinationLastFour: true,
        updatedAt: true,
      },
    });

    return Response.json({
      success: true,
      payoutProfile: profile
        ? {
            payoutMethod: profile.payoutMethod,
            destinationLastFour: profile.destinationLastFour,
            updatedAt: profile.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("PAYOUT PROFILE FETCH ERROR:", error);

    return Response.json(
      { error: "Could not retrieve payout details." },
      { status: 500 }
    );
  }
}
