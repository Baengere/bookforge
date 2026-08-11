import { prisma } from "@/lib/prisma";

export async function GET() {
  const books = await prisma.book.findMany({
    include: {
      chapters: {
        orderBy:{
          chapterNumber: 'asc'
        }
      },
    },
  });

  return Response.json(books);
}

export async function POST(request) {
  const body = await request.json();

  const book = await prisma.book.create({
    data: {
      title: body.title,
      author: body.author,
      description: body.description,
      price: body.price,
      coverImage: body.coverImage,
    },
  });

  return Response.json(book);
}