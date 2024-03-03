import prisma from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

function getFileInfoFromPreviewURL(url: string) {
  const lastSlash = url.lastIndexOf(":");

  const info = url.substring(lastSlash + 1);

  return info;
}

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const projectId: string | undefined = data.get("projectId") as string;
  const uid: string | undefined = data.get("uid") as string;
  const files: File[] | null = data.getAll("files") as unknown as File[];

  if (!projectId && !files) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    for (const file of files) {
      Object.assign(file, { preview: URL.createObjectURL(file) });

      // @ts-ignore
      const fileId = getFileInfoFromPreviewURL(file.preview as string);

      await prisma.file.create({
        data: {
          id: fileId,
          name: file.name,
          type: file.type,
          filePath: `/project/${projectId}/tracks/${fileId}`,

          uploadedBy: uid ? (uid as string) : "client",
          projectId: projectId as string,
        },
      });

      await supabase.storage
        .from("files")
        .upload(
          `project-${projectId}/${uid ?? "client-uploads"}/${file.name}`,
          file
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ failure: "Failed to upload" }, { status: 400 });
  }
}
