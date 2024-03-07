import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

async function getPlaybackUrl({
  projectId,
  userId,
  trackName,
}: {
  projectId: string;
  userId?: string;
  trackName: string;
}) {
  const urlFetch = await supabase.storage
    .from("files")
    .getPublicUrl(`project-${projectId}/${userId}/${trackName}`);

  if (!urlFetch) return null;

  const url = urlFetch.data.publicUrl;

  return url;
}

// export async function POST(req: NextRequest) {
//   const data = req.formData();
//   const { clientInfo } = await req.json();
//   const projectId: string | undefined = data?.projectId as string;
//   const trackId: string | undefined = data?.trackId as string;
//   const { getUser } = getKindeServerSession();
//   const client = { name: clientInfo?.name, email: clientInfo?.email } || null;

//   if (!projectId && !trackId)
//     return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

//   try {
//     const info = await prisma.project.findUnique({
//       where: {
//         id: projectId,
//       },

//       select: {
//         userId: true,
//         clients: true,
//         isActive: true,
//         title: true,
//         files: {
//           where: {
//             id: trackId as string,
//           },
//           select: {
//             id: true,
//             comments: true,
//             name: true,
//             type: true,
//             uploadedBy: true,
//           },
//         },
//       },
//     });

//     if (!info)
//       return NextResponse.json({ error: "Project not found" }, { status: 400 });

//     const commentsData = await prisma.comment.findMany({
//       where: {
//         projectId: projectId,
//       },
//       select: {
//         id: true,
//         text: true,
//         atTimeInSong: true,
//         clientId: true,
//         projectId: true,
//         fileId: true,
//         type: true,
//       },
//     });

//     // Find all comments of the client currently in the project, so that they can be able to edit their own comments.

//     // grab the specific client from the project.
//     // match the client id with the client id of the comment.
//     // I think This must need to come from some type of way of adding session tokens to the request in order to fully get the accurate data.

//     const existingClient = info?.clients.find((c) => c.email === client.email);
//     console.log(existingClient);

//     const streamUrl = await getPlaybackUrl({
//       projectId,
//       userId: info.userId,
//       trackName: info?.files[0].name as string,
//     });

//     return NextResponse.json(
//       {
//         songData: info,
//         trackUrl: streamUrl,
//         comments: commentsData,
//         client: existingClient,
//         success: true,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { failure: "Failed to get data" },
//       { status: 500 }
//     );
//   }
// }

// view scratch.ts for more details
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const trackId = searchParams.get("trackId");

  // console.log(projectId, trackId); // -- returns projectId and trackId from searchParameters

  /* The project table will return all of the details including details of  clients, details of track requested, user information if needed, etc.  */

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId as string,
      },

      select: {
        title: true,
        user: true,
        clients: true,
        files: {
          where: {
            id: trackId as string,
          },

          select: {
            id: true,
            name: true,
            type: true,
            uploadedBy: true,
            comments: {
              select: {
                id: true,
                client: true,
                atTimeInSong: true,
                clientId: true,
                isCompleted: true,
                text: true,
                type: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        isActive: true,
      },
    });

    if (!project)
      return NextResponse.json(
        {
          success: false,
          message: "Could not find project. Please check project id parameter",
          error: true,
          status: 400,
        },
        { status: 400 }
      );

    if (!project.files)
      return NextResponse.json(
        {
          success: false,
          message:
            "Found project, but could not find track. Please check track id parameter",
          error: true,
          status: 204,
        },
        { status: 204 }
      );

    const streamUrl = await getPlaybackUrl({
      projectId: projectId as string,
      userId: project.user.id as string,
      trackName: project.files[0].name,
    });

    if (!streamUrl)
      return NextResponse.json({
        message: "Storage Error: Could not get track's stream url",
        success: false,
        error: true,
        status: 204,
      });

    return NextResponse.json(
      {
        message: "ok",
        data: { project, streamUrl, trackId },

        success: true,
        error: false,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Error: Could not retrieve project.",
        error,
        status: 500,
      },
      { status: 500 }
    );
  }
}
