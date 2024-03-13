import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { CommentType } from "@prisma/client";

// Updated 3-11-24

type CommentRequestBody = {
  name: string;
  email: string;
  comment: string;
  timeInSong?: string | undefined;
  projectId: string;
  trackId: string;
  commentType: CommentType;
  userId: string;
};

export async function POST(request: NextRequest) {
  const data: CommentRequestBody = await request.json();

  let client = await prisma.client.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        userId: data.userId,
      },
    });
  }

  try {
    prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          text: data.comment,
          atTimeInSong: data.timeInSong ?? "",
          clientId: client.id,
          projectId: data.projectId,
          fileId: data.trackId,
          type: data.commentType as CommentType,
        },
      });

      await tx.project.update({
        where: {
          id: data.projectId,
        },

        data: {
          clients: {
            connect: client,
          },

          comments: {
            connect: comment,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      error: false,
      message: "New comment created",
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Database Error: Could not fully add client data.",
        error: true,
        status: 500,
      },
      { status: 500 }
    );
  }
}

// =================== OLD VERSION =======================
// export async function POST(request: NextRequest) {
//   try {
//     const data: {
//       sender: string;
//       timeInSong?: string | undefined;
//       email: string;
//       comment: string;
//       projectId: string;
//       fileId: string;
//       type: string;
//       userId: string;
//     } = await request.json();

//     // Does client exist?
//     let client = await prisma.client.findUnique({
//       where: {
//         email: data.email,
//       },
//     });

//     // if no client, create one
//     if (!client) {
//       client = await prisma.client.create({
//         data: {
//           name: data.sender as string,
//           email: data.email as string,
//           userId: data.userId as string,
//         },
//       });
//     }

//     await prisma.comment.create({
//       data: {
//         text: data.comment,
//         atTimeInSong: data.timeInSong ?? "",
//         clientId: client.id as string,
//         projectId: data.projectId as string,
//         fileId: data.fileId as string,
//         type: data.type as CommentType,
//       },
//     });

//     // Should i add some sort of session token to remember the client for the browser?

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { success: false, error: "Something went wrong: " + error },
//       { status: 400 }
//     );
//   }
// }
