import prisma from "./db";
import { supabase } from "./supabase";

async function getPlaybackUrl({
  projectId,
  userId,
  trackName,
}: {
  projectId: string;
  userId: string;
  trackName: string;
}) {
  const urlFetch = supabase.storage
    .from("files")
    .getPublicUrl(`project-${projectId}/${userId}/${trackName}`);

  if (!urlFetch) return null;

  const url = urlFetch.data.publicUrl;

  return url;
}

export async function getData({
  projectId,
  trackId,
}: {
  projectId: string;
  trackId: string;
}) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },

    select: {
      title: true,
      user: true,
      clients: true,
      files: {
        where: {
          id: trackId,
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

  if (!project) {
    return null;
  }

  const streamUrl = await getPlaybackUrl({
    projectId,
    userId: project?.user.id,
    trackName: project?.files[0].name,
  });

  if (!streamUrl) return null;

  const data = {
    project,
    streamUrl,
    trackId,
  };

  return data;
}
