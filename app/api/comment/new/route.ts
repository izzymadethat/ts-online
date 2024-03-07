import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { CommentType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const data: {
      sender: string;
      timeInSong?: string | undefined;
      email: string;
      comment: string;
      projectId: string;
      fileId: string;
      type: string;
      userId: string;
    } = await req.json();

    // Does client exist?
    let client = await prisma.client.findUnique({
      where: {
        email: data.email,
      },
    });

    // if no client, create one
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: data.sender as string,
          email: data.email as string,
          userId: data.userId as string,
        },
      });
    }

    await prisma.comment.create({
      data: {
        text: data.comment,
        atTimeInSong: data.timeInSong ?? "",
        clientId: client.id as string,
        projectId: data.projectId as string,
        fileId: data.fileId as string,
        type: data.type as CommentType,
      },
    });

    // Should i add some sort of session token to remember the client for the browser?

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Something went wrong: " + error },
      { status: 400 }
    );
  }
}
