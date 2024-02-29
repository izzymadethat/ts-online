import { SubmitButton } from "@/app/components/SubmitButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React from "react";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getData({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const data = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: userId,
    },

    select: {
      title: true,
      description: true,
      id: true,
    },
  });

  return data;
}

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const data = await getData({
    userId: user?.id as string,
    projectId: params.id as string,
  });

  async function postData(formData: FormData) {
    "use server";

    if (!user) throw new Error("Not authorized");

    const title = formData.get("title") as string;
    const desc = formData.get("description") as string;

    await prisma.project.update({
      where: {
        id: data?.id,
        userId: user?.id,
      },
      data: {
        title: title,
        description: desc,
      },
    });

    revalidatePath("/dashboard/projects");

    return redirect("/dashboard/projects");
  }

  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
          <CardDescription>
            Edit your project, then save your changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-8">
          <div className="gap-y-2 flex flex-col">
            <Label>Title</Label>
            <Input
              required
              type="text"
              name="title"
              placeholder="Project Title"
              defaultValue={data?.title}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              placeholder="Describe the project. 200 characters max"
              defaultValue={data?.description}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="destructive">
            <Link href="/dashboard/projects">Cancel</Link>
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
