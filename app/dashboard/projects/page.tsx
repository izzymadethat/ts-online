import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Edit, File } from "lucide-react";
import { Card } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { DeleteProjectButton } from "@/app/components/SubmitButton";

async function getData(userId: string) {
  //   const data = await prisma.project.findMany({
  //     where: {
  //       userId: userId,
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });

  //   return data;
  // }

  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      projects: true,
      subscription: {
        select: {
          status: true,
        },
      },
    },
  });
  return data;
}

export default async function ProjectsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const data = await getData(user?.id as string);

  async function deleteProject(formData: FormData) {
    "use server";

    const projectId = formData.get("projectId") as string;

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    revalidatePath("/dashboard/projects");
  }

  return (
    <div className="grid items-start gap-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-3xl md:text-4xl">Projects</h1>
          <p className="text-lg text-muted-foreground">
            Manage all of your projects here
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">Create a new Project</Link>
        </Button>
      </div>

      {data?.projects.length === 0 ? (
        <div className="flex flex-col min-h-[400px] items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <File className="w-10 h-10 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">
            You haven&apos;t created any projects yet!
          </h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            Start with TrakSync by building a project so that you can share an d
            collaborate with your clients!
          </p>
          <Button asChild>
            <Link href="/dashboard/projects/new">Create a new Project</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {data?.projects.map((project) => (
            <Card
              key={project.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <h2 className="font-semibold text-xl text-primary">
                  {project.title}
                </h2>
                <p>
                  {" "}
                  Created{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "full",
                  }).format(new Date(project.createdAt))}
                </p>
              </div>

              <div className="flex gap-x-4">
                <Link href={`/dashboard/projects/edit/${project.id}`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <DeleteProjectButton />
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
