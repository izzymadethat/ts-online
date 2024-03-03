import prisma from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
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

export default async function TrackClientView({
  params,
}: {
  params: { id: string; trackId: string };
}) {
  const { id, trackId } = params;
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const client = !user;
  console.log(trackId);

  const project = await getData({ projectId: id, trackId: trackId });
  const track = project?.files[0];

  console.log(project);
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col justify-center items-center space-y-1">
        <h1 className="text-3xl font-bold">
          {track?.name.replace(/_/g, " ").split(".")[0]}
        </h1>
        <h3 className="text-sm text-muted-foreground">
          {" "}
          from {project?.title}
        </h3>
        <div className="flex gap-4 items-center font-semibold">
          <Button className="uppercase" disabled>
            Pay Balance
          </Button>
          <Button className="uppercase" disabled>
            Show all comments
          </Button>
        </div>
      </div>

      {/* Audio Player */}

      {/* Feedback Card */}
      <div className="mt-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Thoughts?</CardTitle>
          </CardHeader>
          <form>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Input name="client-name" placeholder="Your name" />
                <Textarea
                  name="client-feedback"
                  placeholder="Enter your thoughts for this track"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button className="self-end">Submit Comment</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
