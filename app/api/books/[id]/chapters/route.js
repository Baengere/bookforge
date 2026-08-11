import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    const bookId = Number(id);

    const body = await request.json();

    const chapters = body.chapters;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return Response.json(
        { error: "No chapters provided" },
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
        { error: "Book not found" },
        { status: 404 }
      );
    }

    await prisma.chapter.deleteMany({
      where: {
        bookId,
      },
    });

    const createdChapters = await prisma.chapter.createManyAndReturn({
      data: chapters.map((chapter) => ({
        bookId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        content: chapter.content,
        isFree: chapter.chapterNumber === 1,
      })),
    });

    return Response.json(createdChapters);
  } catch (error) {
    console.error("CHAPTER SAVE ERROR:", error);

    return Response.json(
      { error: "Could not save chapters" },
      { status: 500 }
    );
  }
}