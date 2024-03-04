"use client";
import prisma from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

async function getData({
  projectId,
  trackId,
}: {
  projectId: string;
  trackId: string;
}) {
  const songData = await prisma?.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      clients: true,
      userId: true,
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

  return songData;
}

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
    .getPublicUrl(
      `project-${projectId}/${userId ?? "client-uploads"}/${trackName}`
    );

  if (!urlFetch) return null;

  const url = urlFetch.data.publicUrl;

  return url;
}

function formatTime(seconds) {
  const padTime = (num, size) => num.toString().padStart(size, "0");

  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.floor(seconds % 60);

  return `${padTime(minutes, 2)}:${padTime(secondsLeft, 2)}`;
}

export default function TrackClientView() {
  const { id, trackId } = useParams();
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const client = !user;
  const [project, setProject] = useState(null);
  const [track, setTrack] = useState(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  // get client information
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isATimeStampedComment, setIsATimeStampedComment] = useState(true);
  const [commentUploading, setCommentUploading] = useState(false);

  const audioRef = useRef(null);
  const data = useMemo(() => {
    const formData = new FormData();
    formData.set("projectId", id as string);
    formData.set("trackId", trackId as string);

    return formData;
  }, [id, trackId]);

  useEffect(() => {
    const fetchSongData = async () => {
      const response = await fetch("/api/get-song-data", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const songResult = await response.json();

        setProject(songResult.songData);
        setTrack(songResult.songData.files[0]);
        if (songResult.trackUrl) {
          setStreamUrl(songResult.trackUrl);
        }
      }
    };

    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.audioEl.current.currentTime);
      }
    }, 1000);

    fetchSongData();
    return () => clearInterval(interval);
  }, [data]);

  async function handleSubmitComment(e: any) {
    e.preventDefault();

    setCommentUploading(true);

    const newComment = {
      sender: clientName,
      timeInSong: isATimeStampedComment ? formatTime(currentTime) : undefined,
      email: clientEmail,
      comment: comment,
      projectId: id,
      fileId: trackId,
      type: isATimeStampedComment ? "REVISION" : "FEEDBACK",
      userId: user?.id || (project?.userId as string),
    };

    try {
      const commentUploaded = await fetch("/api/comment/new", {
        method: "POST",
        body: JSON.stringify(newComment),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (commentUploaded.ok) {
        toast({
          title: "Comment submitted!",
          description: "Your comment has been submitted for review!",
          duration: 2500,
        });
      } else {
        toast({
          title: "Uh Oh! Something went wrong!",
          variant: "destructive",
          description: "Your comment could not be submitted. Please try again.",
          duration: 2500,
        });
      }

      // Find a way to set cookies to remember name and email.

      setComment("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Uh Oh! Something went wrong!",
        variant: "destructive",
        description: "Your comment could not be submitted. Please try again.",
        duration: 2500,
      });
    } finally {
      setCommentUploading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold leading-6">
          {track?.name.replace(/_/g, " ").split(".")[0]}
        </h1>
        <h3 className="text-lg text-muted-foreground">
          {" "}
          from {project?.title}
        </h3>
        <div className="flex gap-4 items-center font-semibold mt-4">
          {client && (
            <Button className="uppercase" disabled>
              Pay Balance
            </Button>
          )}
          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button className="uppercase">Show all revisions</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle>Revisions</SheetTitle>
                <SheetDescription>
                  Comments from your clients that have been submitted for
                  review. Once you have completed the request, simply check it
                  off. They will be notified of your completion
                </SheetDescription>
                <div className="mt-4">
                  <h2 className="text-lg/relaxed underline">Harry</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox />
                      <Label>Can you take out the drums here?</Label>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      @00:36
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-lg/relaxed underline">Harry</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox />
                      <Label>Can you take out the drums here?</Label>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      @ 00:36
                    </span>
                  </div>

                  {/* Option to check all */}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      {/* Feedback Card */}
      <div className="mt-8 max-w-2xl mx-auto">
        <ReactAudioPlayer
          src={streamUrl}
          ref={audioRef}
          controls
          className="w-full my-4"
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Thoughts?</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmitComment}>
            <CardContent>
              <div className="flex flex-col space-y-6">
                <Input
                  name="client-name"
                  placeholder="Your name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
                <Input
                  name="client-email"
                  placeholder="Your email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
                <Textarea
                  name="client-feedback"
                  placeholder="Enter your thoughts for this track (200 char max)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={200}
                  required
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Checkbox
                      checked={isATimeStampedComment}
                      onCheckedChange={() =>
                        setIsATimeStampedComment((prevValue) => !prevValue)
                      }
                      value={formatTime(currentTime)}
                      name="timestamp"
                    />
                    <Label>Leave a comment at {formatTime(currentTime)}</Label>
                  </div>
                  {/* Submit button */}
                  {commentUploading ? (
                    <Button className="self-end" disabled>
                      <Loader2 className="h-4 2-4 mr-2 animate-spin" />{" "}
                      Submitting your comment...
                    </Button>
                  ) : (
                    <Button className="self-end" type="submit">
                      Submit Comment
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
