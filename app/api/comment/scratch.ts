/* 
    ---- Create a new comment ----
    1. receive data from request. -- done
    2. check if the client exists: Only clients can submit comments
    3. If there's no client, then create a client
        - create a new client in the database
        - add the client to the project 
        - error out if either goes wrong
    4. create the comment based on the data received from request 
    5. only return response that everything is ok or everything failed
*/

/*
    type CommentRequestBody = {
    name: string;
    email: string;
    comment: string;
    timeInSong?: string | undefined;
    projectId: string;
    trackId: string;
    fileType: string;
    userId: string;
    };
*/

// ======================= CREATE A NEW COMMENT ====================
/* 
export async function POST(request: NextRequest) {
  const data: CommentRequestBody = await request.json();

  let client = await prisma.client.findUnique({
    where: {
        email: data.email
    }
  })

  if (!client) {
    clientAdded = await prisma.$transaction(async (tx) => {
        client = await prisma.client.create({
            data: {
                name: data.name,
                email: data.email,
                userId: data.userId,
            }
        })

        const comment = await prisma.comment.create({
            data: {
                text: data.comment,
                atTimeInSong: data.timeInSong ?? "",
                clientId: client.id,
                projectId: data.projectId,
                fileId: data.trackId
                type: data.type as CommentType
            }
        })

        await prisma.project.update({
            where: {
                id: data.projectId
            },

            data: {
                clients: {
                    connect: client
                },
                comments: {
                    connect: comment 
                }
            }
        })

    })

    if (!clientAdded) {
        return NextResponse.json({success: false, message: "Database Error: Could not fully add client data." error: true, status: 500}, {status: 500})
    }

    return NextResponse.json({success: true, error: false, message: "New client and comment created + added to project", status: 201})
  }

  return NextResponse.json({success: true, error: false, message: "New comment created", status: 201})
}

*/
