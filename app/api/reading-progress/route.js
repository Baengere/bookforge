
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";

async function getReaderId() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return user?.id || null;
}

// Load the signed-in reader's progress for a book.
export async function GET(request) {
  try {
    const userId = await getReaderId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to load reading progress." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = Number(searchParams.get("bookId"));

    if (!Number.isInteger(bookId) || bookId < 1) {
      return NextResponse.json(
        { error: "A valid bookId is required." },
        { status: 400 }
      );
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("LOAD READING PROGRESS ERROR:", error);

    return NextResponse.json(
      { error: "Could not load reading progress." },
      { status: 500 }
    );
  }
}

// Save the signed-in reader's progress for a book.
export async function POST(request) {
  try {
    const userId = await getReaderId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to save reading progress." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const bookId = Number(body.bookId);
    const chapterNumber = Number(body.chapterNumber);
    const position = Number(body.position);

    if (
      !Number.isInteger(bookId) || bookId < 1 ||
      !Number.isInteger(chapterNumber) || chapterNumber < 1 ||
      !Number.isInteger(position) || position < 0
    ) {
      return NextResponse.json(
        { error: "Invalid reading progress." },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        chapters: {
          select: { chapterNumber: true },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    const chapterExists = book.chapters.some(
      (chapter) => chapter.chapterNumber === chapterNumber
    );

    if (!chapterExists) {
      return NextResponse.json(
        { error: "Chapter not found." },
        { status: 400 }
      );
    }

    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      create: {
        userId,
        bookId,
        chapterNumber,
        position,
      },
      update: {
        chapterNumber,
        position,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("SAVE READING PROGRESS ERROR:", error);

    return NextResponse.json(
      { error: "Could not save reading progress." },
      { status: 500 }
    );
  }
}
