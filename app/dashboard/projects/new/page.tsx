import { SubmitNewProjectButton } from "@/app/components/SubmitButton";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function CreateNewProjectPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  async function postData(formData: FormData) {
    "use server";

    if (!user) throw new Error("Not authorized");

    const title = formData.get("title") as string;
    const desc = formData.get("description") as string;

    await prisma.project.create({
      data: {
        userId: user?.id,
        title: title,
        description: desc,
      },
    });

    return redirect("/dashboard/projects");
  }
  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>New Project</CardTitle>
          <CardDescription>
            Create a new project, then share with your client(s)!
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
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              placeholder="Describe the project. 200 characters max"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="destructive">
            <Link href="/dashboard/projects">Cancel</Link>
          </Button>
          <SubmitNewProjectButton />
        </CardFooter>
      </form>
    </Card>
  );
}
