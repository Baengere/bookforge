import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"


export async function GET() {
  const books = await prisma.book.findMany({
    where: {
      isArchived:false,
    },
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

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if(!user){
    return Response.json(
      {error:"You Must Be Signed In to Publish"},
      {status:401}
    )
  }

  const body = await request.json();

  if(!book.ownerId){
    return Response.json(
      {error:"This book has no assigned author account"},
      {status:409}
    )
  }

  const book = await prisma.book.create({
    data: {
      title: body.title,
      author: body.author,
      ownerId:user.id,
      description: body.description,
      price: body.price,
      coverImage: body.coverImage,
    },
  });

  return Response.json(book);
}