
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request, { params }) {
  try {
    // 1. Identify the signed-in reader.
    const { getUser } = await getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Please sign in to download this book." },
        { status: 401 }
      );
    }

    // 2. Validate the book ID.
    const { id } = await params;
    const bookId = Number(id);

    if (!Number.isSafeInteger(bookId) || bookId < 1) {
      return NextResponse.json(
        { error: "Invalid book ID." },
        { status: 400 }
      );
    }

    const email = user.email.trim().toLowerCase();

    // 3. Check for a completed purchase.
    // Select only the ID to avoid reading unrelated Purchase columns.
    const purchase = await prisma.purchase.findFirst({
      where: {
        bookId,
        email,
        status: "completed",
      },
      select: {
        id: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "A completed purchase is required to download this book." },
        { status: 403 }
      );
    }

    // 4. Fetch the book and its chapters.
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        author: true,
        chapters: {
          orderBy: { chapterNumber: "asc" },
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            content: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    // 5. Return the authorized copy to the browser.
    return NextResponse.json(book, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Offline book download failed:", error);

    return NextResponse.json(
      { error: "Unable to prepare this book for download." },
      { status: 500 }
    );
  }
}
