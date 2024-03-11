"use client";

import { getData } from "@/app/lib/actions";

import { useParams, useRouter } from "next/navigation";
import CommentsSidebar from "@/app/components/track-view/CommentsSidebar";
import AudioPlayer from "@/app/components/track-view/AudioPlayer";
import CommentForm from "@/app/components/track-view/CommentForm";
import ProjectPaymentButton from "@/app/components/track-view/ProjectPaymentButton";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useRef, useState } from "react";
import ReactAudioPlayer from "react-audio-player";

function formatTime(time: number) {
  // take in the current time -- will be in seconds & milliseconds
  // it may be best to initially round to a whole number
  // if the time divided into 60 gives 1, then a minute has passed. it should set the seconds to zero then minutes += 1
  // we should floor any seconds evenly divisible by 60

  const padTime = (num: number, size: number) =>
    num.toString().padStart(size, "0");

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${padTime(minutes, 2)}:${padTime(seconds, 2)}`;
}

export default function TrackPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useKindeBrowserClient();
  const client = !user;

  const [track, setTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [existingClient, setExistingClient] = useState({
    client_name: "",
    client_email: "",
  });
  const [isATimeStampedComment, setIsATimeStampedComment] = useState(true);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef(null);

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
        setExistingClient({ client_name: "", client_email: "" });
      } else {
        setExistingClient({
          client_name: existingClient.client_name as string,
          client_email: existingClient.client_email as string,
        });
      }
    }

    fetchTrackData();
    checkIfClientStored();
    setLoading(false);
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current.audioEl;
    setInterval(() => {
      setCurrentTime(audioElement.current.currentTime);
    }, 1000);
  }, [currentTime]);

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
      timestamp:
        isATimeStampedComment && currentTime > 0
          ? formatTime(currentTime)
          : undefined,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("client-name", clientName as string);
      localStorage.setItem("client-email", clientEmail as string);
    }

    console.log(newComment);

    router.refresh();
  }

  function handleCheckedChange() {
    setIsATimeStampedComment((prevValue) => !prevValue);
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
            <ReactAudioPlayer
              src={track?.streamUrl}
              ref={audioRef}
              controls
              className="w-full"
            />

            {/* Client Comment Form */}
            {client && (
              <CommentForm
                onSubmit={submitComment}
                existingClient={existingClient || client}
                isTimeStampedComment={isATimeStampedComment}
                timestamp={formatTime(currentTime) || undefined}
                onCheckedChange={handleCheckedChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
