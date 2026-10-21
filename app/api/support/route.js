
import { prisma } from "@/lib/prisma";

const allowedCategories = [
  "payment",
  "book_access",
  "bug",
  "suggestion",
  "other",
];

export async function POST(request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const category =
      typeof body.category === "string" ? body.category : "";

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    const bookTitle =
      typeof body.bookTitle === "string"
        ? body.bookTitle.trim()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return Response.json(
        { error: "Please select a valid issue category." },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return Response.json(
        { error: "Your message must be between 10 and 5000 characters." },
        { status: 400 }
      );
    }

    if (bookTitle.length > 200) {
      return Response.json(
        { error: "The book title is too long." },
        { status: 400 }
      );
    }

    const supportRequest = await prisma.supportRequest.create({
      data: {
        email,
        category,
        message,
        bookTitle: bookTitle || null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        message: "Your message has been received. Thank you for contacting BookForge.",
        reference: supportRequest.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Support request failed:", error.message);

    return Response.json(
      { error: "We couldn't send your message. Please try again later." },
      { status: 500 }
    );
  }
}
