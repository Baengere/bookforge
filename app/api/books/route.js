
import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// GET: Retrieve publicly available books
export async function GET() {
  const books = await prisma.book.findMany({
    where: {
      isArchived: false,
    },
    include: {
      chapters: {
        orderBy: {
          chapterNumber: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(books);
}

// POST: Create a new book
export async function POST(request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return Response.json(
      { error: "You must be signed in to publish." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const book = await prisma.book.create({
    data: {
      title: body.title,
      author: body.author,
      ownerId: user.id,
      description: body.description,
      price: body.price,
      coverImage: body.coverImage,
    },
  });

  return Response.json(book, { status: 201 });
}
