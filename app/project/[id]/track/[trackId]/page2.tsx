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
import TrackPageLoader from "./TrackPageLoader";
import { Badge } from "@/components/ui/badge";

function formatTime(seconds) {
  const padTime = (num, size) => num.toString().padStart(size, "0");

  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.floor(seconds % 60);

  return `${padTime(minutes, 2)}:${padTime(secondsLeft, 2)}`;
}

export default function TrackClientView() {
  const params = useParams();
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [track, setTrack] = useState({ song: null, url: "" });
  const [currentTime, setCurrentTime] = useState(0);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [client, setClient] = useState(null);
  const [comment, setComment] = useState("");
  const [isATimeStampedComment, setIsATimeStampedComment] = useState(true);
  const [commentUploading, setCommentUploading] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    async function fetchTrackData() {
      try {
        const res = await fetch(
          `/api/track?projectId=${params.id}&trackId=${params.trackId}`,
          {
            method: "GET",
            headers: {
              Authorization: user?.id || {
                name: clientName,
                email: clientEmail,
              },
            },
          }
        );
        if (!res.ok)
          throw new Error("Could not find project or project details");

        const projectFetch = await res.json();
        // console.log(projectFetch.status); //-- shows correct data --
        if (projectFetch.status !== 200)
          throw Error(
            "Couldn't find any data matching project. Please check details",
            { cause: projectFetch.message as string }
          );

        // variables for found data
        const projectData = projectFetch.data.project;
        const streamUrlData = projectFetch.data.streamUrl;
        const song = projectFetch.data.project.files[0];

        // console.log(song, streamUrlData); // -- shows correct data

        setProject(projectData);
        setTrack({ song: song, url: streamUrlData });
        console.log(song);
      } catch (error) {
        console.error(
          error,
          `Reason for error: ${error.cause as unknown as string}`
        );
        toast({
          title: "Uh Oh! Something went wrong...",
          description: "Could not get song. Please try again",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTrackData();
  }, []);

  async function handleSubmitComment(e: any) {
    e.preventDefault();

    setCommentUploading(true);

    const newComment = {
      sender: clientName,
      timeInSong: isATimeStampedComment ? formatTime(currentTime) : undefined,
      email: clientEmail,
      comment: comment,
      projectId: params.id,
      fileId: params.trackId,
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
      localStorage.setItem("client-name", clientName);
      localStorage.setItem("client-email", clientEmail);

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

  async function handleCompleteTask(id: string) {
    return toast({
      title: "WOOHOO!",
      description: `Task completed!`,
    });
  }

  return (
    <>
      {loading ? (
        <TrackPageLoader />
      ) : (
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold leading-6">
              Test
              {track?.name?.replace(/_/g, " ").split(".")[0]}
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
                  <SheetContent className="max-h-screen overflow-y-auto">
                    <SheetTitle>Revisions</SheetTitle>
                    <SheetDescription>
                      Comments from your clients that have been submitted for
                      review. Once you have completed the request, simply check
                      it off. They will be notified of your completion
                    </SheetDescription>

                    {track?.song?.comments?.map((comment, index) => (
                      <div key={index} className="mt-4">
                        <div className="flex items-center gap-4">
                          <h2 className="text-lg/relaxed underline">
                            {comment.client.name}
                          </h2>
                          {comment.type === "REVISION" ? (
                            <Badge className="text-sm">Revision</Badge>
                          ) : (
                            <Badge className="text-sm">Feedback</Badge>
                          )}
                          {comment.atTimeInSong && (
                            <span className="text-sm text-muted-foreground">
                              @{comment.atTimeInSong}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <form>
                            <input type="text" value={comment.id} />
                            <div className="flex items-center gap-2">
                              {comment.type === "REVISION" && (
                                <Checkbox
                                  defaultChecked={
                                    comment.isCompleted as boolean
                                  }
                                  onCheckedChange={() =>
                                    handleCompleteTask(comment.id)
                                  }
                                />
                              )}
                              <p className="leading-5 max-w-xs">
                                {comment.text}
                              </p>
                            </div>
                          </form>
                        </div>
                      </div>
                    ))}

                    {user && (
                      <>
                        {/* Show only the comments of the client */}
                        <div>Client Comment</div>
                      </>
                    )}

                    {/* Option to check all */}
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
          {/* Feedback Card */}
          <div className="mt-8 max-w-2xl mx-auto">
            <ReactAudioPlayer
              src={track.url}
              ref={audioRef}
              controls
              className="w-full my-4"
            />
            {client && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Thoughts?</CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmitComment}>
                  <CardContent>
                    <div className="flex flex-col space-y-6">
                      <Input
                        defaultValue={clientName}
                        name="client-name"
                        placeholder="Your name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                      />
                      <Input
                        defaultValue={clientEmail}
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
                              setIsATimeStampedComment(
                                (prevValue) => !prevValue
                              )
                            }
                            value={formatTime(currentTime)}
                            name="timestamp"
                          />
                          <Label>
                            Leave a comment at {formatTime(currentTime)}
                          </Label>
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
