"use client";

import { getData } from "@/app/lib/actions";

import { useParams, useRouter } from "next/navigation";
import CommentsSidebar from "@/app/components/track-view/CommentsSidebar";
import AudioPlayer from "@/app/components/track-view/AudioPlayer";
import CommentForm from "@/app/components/track-view/CommentForm";
import ProjectPaymentButton from "@/app/components/track-view/ProjectPaymentButton";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from "react";

export default function TrackPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useKindeBrowserClient();

  const [track, setTrack] = useState(null);
  const [client, setClient] = useState({ client_name: "", client_email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    async function fetchTrackData() {
      try {
        const { id, trackId } = params;

        const res = await fetch(
          `/api/track?projectId=${id}&trackId=${trackId}`,
          {
            method: "GET",
            headers: {
              Authorization: user?.id || client.client_email,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(res.message);

        const trackData = await res.json();

        if (!trackData.data) {
          return router.push("/dashboard/projects");
        } else {
          setTrack(trackData.data);
        }
      } catch (error) {
        console.log("Error fetching track data: ", error);
      }
    }

    function checkIfClientStored() {
      const existingClient = {
        client_name: localStorage.getItem("client-name"),
        client_email: localStorage.getItem("client-email"),
      };

      if (!existingClient) {
        setClient({ client_name: "", client_email: "" });
      } else {
        setClient({
          client_name: existingClient.client_name as string,
          client_email: existingClient.client_email as string,
        });
      }
    }

    fetchTrackData();
    checkIfClientStored();
    setLoading(false);
  }, []);

  const isProjectCreator = user?.id === track?.project.user.id;
  const trackName = track?.project.files[0].name;

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

  if (loading) return "Loading...";

  return (
    <div>
      <div>
        <h1>
          {trackName
            ? trackName?.replace(/_/g, " ").split(".")[0]
            : "Name not set"}
        </h1>
        <h3>From {track?.project.title}</h3>

        <div>
          {/* Payment button */}
          {client && <ProjectPaymentButton />}

          {/* Comments Sidebar */}
          {user && isProjectCreator ? (
            <CommentsSidebar track={track} user={user} />
          ) : null}

          <div>
            {/* Audio Player */}
            <AudioPlayer source={track?.streamUrl || ""} />

            {/* Client Comment Form */}
            {client && (
              <CommentForm onSubmit={submitComment} existingClient={client} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
