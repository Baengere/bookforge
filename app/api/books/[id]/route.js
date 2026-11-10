import {prisma} from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request, {params}){
    const {id} = await params;

    const book = await prisma.book.findUnique({
        where:{
            id:Number(id),
        },
        include: {
            chapters:{
                orderBy: {
                    chapterNumber: 'asc',
                }
            }
        }
    })
    if(!book)return Response.json({error: "Book not found"}, {status:404})

    return Response.json(book);
}


export async function PATCH(request, { params }) {
  try {
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
        { error: "You do not own this book." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return Response.json(
          { error: "A valid title is required." },
          { status: 400 }
        );
      }
      data.title = body.title.trim();
    }

    if (body.description !== undefined) {
      data.description = body.description;
    }

    if (body.coverImage !== undefined) {
      data.coverImage = body.coverImage;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price <= 0) {
        return Response.json(
          { error: "Enter a valid price greater than zero." },
          { status: 400 }
        );
      }

      data.price = price;
    }

    if (Object.keys(data).length === 0) {
      return Response.json(
        { error: "No changes provided." },
        { status: 400 }
      );
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data,
    });

    return Response.json(updatedBook);

  } catch (error) {
    console.error("BOOK UPDATE ERROR:", error);

    return Response.json(
      { error: "Could not update book." },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {
  try {
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
        { error: "You do not own this book." },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchaseCount = await tx.purchase.count({
        where: { bookId },
      });

      if (purchaseCount > 0) {
        await tx.book.update({
          where: { id: bookId },
          data: { isArchived: true },
        });

        return "archived";
      }

      await tx.book.delete({
        where: { id: bookId },
      });

      return "deleted";
    });

    return Response.json({
      message:
        result === "archived"
          ? "Book archived. Existing purchase records are preserved."
          : "Book permanently deleted.",
      action: result,
    });

  } catch (error) {
    console.error("BOOK DELETE ERROR:", error);

    return Response.json(
      { error: "Could not delete book." },
      { status: 500 }
    );
  }
}
