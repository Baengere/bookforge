
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request, { params }) {
  try {
    // 1. Check who is signed in
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return Response.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bookId = Number(id);

    if (!Number.isInteger(bookId) || bookId <= 0) {
      return Response.json(
        { error: "Invalid book ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const chapters = body.chapters;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return Response.json(
        { error: "No chapters provided." },
        { status: 400 }
      );
    }

    // 2. Find the book and verify its owner
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return Response.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    if (book.ownerId !== user.id) {
      return Response.json(
        { error: "You are not allowed to edit this book." },
        { status: 403 }
      );
    }

    // 3. Replace chapters safely in one transaction
    const createdChapters = await prisma.$transaction(async (tx) => {
      await tx.chapter.deleteMany({
        where: { bookId },
      });

      return tx.chapter.createManyAndReturn({
        data: chapters.map((chapter) => ({
          bookId,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          content: chapter.content,
          isFree: chapter.chapterNumber === 1,
        })),
      });
    });

    return Response.json(createdChapters);

  } catch (error) {
    console.error("CHAPTER SAVE ERROR:", error);

    return Response.json(
      { error: "Could not save chapters." },
      { status: 500 }
    );
  }
}
