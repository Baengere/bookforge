import {prisma} from '@/lib/prisma';

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