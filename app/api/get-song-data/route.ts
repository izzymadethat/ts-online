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

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const projectId: string | undefined = data.get("projectId") as string;
  const trackId: string | undefined = data.get("trackId") as string;
  const { getUser } = getKindeServerSession();
  const uid = await getUser();
  const isUser = !!uid;

  console.log({ projectId, trackId, uid });

  if (!projectId && !trackId)
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  try {
    const info = await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      select: {
        userId: true,
        clients: true,
        isActive: true,
        title: true,
        files: {
          where: {
            id: trackId as string,
          },
          select: {
            id: true,
            comments: true,
            name: true,
            type: true,
            uploadedBy: true,
          },
        },
      },
    });

    if (!info)
      return NextResponse.json({ error: "Project not found" }, { status: 400 });

    const streamUrl = await getPlaybackUrl({
      projectId,
      userId: info.userId,
      trackName: info?.files[0].name as string,
    });

    return NextResponse.json(
      { songData: info, trackUrl: streamUrl, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { failure: "Failed to get data" },
      { status: 500 }
    );
  }
}
