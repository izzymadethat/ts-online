"use client";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";
import { redirect } from "next/navigation";
import CommentsSidebar from "@/app/components/track-view/CommentsSidebar";
import AudioPlayer from "@/app/components/track-view/AudioPlayer";
import CommentForm from "@/app/components/track-view/CommentForm";
import ProjectPaymentButton from "@/app/components/track-view/ProjectPaymentButton";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

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

  if (!project || !project.files) {
    return null;
  }

  // const streamUrl = await getPlaybackUrl({
  //   projectId,
  //   userId: project.user.id,
  //   trackName: project.files[0].name,
  // });

  const streamUrl = "Sample stream url";

  // if (!streamUrl) return null;

  const data = {
    project,
    streamUrl,
    trackId,
  };

  return data;
}

export default function TrackPage({
  params,
}: {
  params: { id: string; trackId: string };
}) {
  const { user } = useKindeBrowserClient();
  const client = !user;

  console.log(params.id, params.trackId);

  const track = await getData({
    projectId: params.id,
    trackId: params.trackId,
  });

  if (!track) return redirect("/dashboard/projects");

  const isProjectCreator = user?.id === track.project.user.id;
  const trackName = track.project.files[0].name;

  const existingClient = {
    client_name: localStorage.getItem("client-name"),
    client_email: localStorage.getItem("client-email"),
  };

  // ============= FUNCTIONS ===============

  async function submitComment(formData: FormData) {
    const clientName = formData.get("client-name");
    const clientEmail = formData.get("client-email");
    const clientComment = formData.get("client-comment");

    const newComment = {
      name: clientName,
      email: clientEmail,
      comment: clientComment,
      projectId: params.id,
      trackId: params.trackId,
      userId: track?.project.user.id,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("client-name", clientName as string);
      localStorage.setItem("client-email", clientEmail as string);
    }
  }

  return (
    <div>
      <div>
        <h1>
          {trackName
            ? trackName?.replace(/_/g, " ").split(".")[0]
            : "Name not set"}
        </h1>
        <h3>From {track.project.title}</h3>

        <div>
          {/* Payment button */}
          {client && <ProjectPaymentButton />}

          {/* Comments Sidebar */}
          {user && isProjectCreator ? (
            <CommentsSidebar track={track} user={user} />
          ) : null}

          <div>
            {/* Audio Player */}
            <AudioPlayer source={track.streamUrl} />

            {/* Client Comment Form */}
            {client && (
              <CommentForm
                onSubmit={submitComment}
                existingClient={existingClient || null}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
