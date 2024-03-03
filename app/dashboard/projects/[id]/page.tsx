import ProjectFileUploader from "@/app/components/projects/project-file-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Folder, CircleOff, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import prisma from "@/app/lib/db";

async function getProjectInformation({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const projectInformation = await prisma?.project.findUnique({
    where: {
      id: projectId,
      userId: userId,
    },
    select: {
      title: true,
      projectCost: true,
      clients: true,
      files: true,
      isActive: true,
      dueDate: true,
    },
  });

  return { projectInformation };
}

async function calculateStorageSize(path: string): Promise<number> {
  let size = 0;
  const { data } = await supabase.storage.from("files").list(path);

  if (data && data.length > 0) {
    for (const file of data) {
      size += file.metadata.size;
    }
  }

  return size;
}

async function getStorageInfo({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}): Promise<number> {
  let totalStorageSize = 0;
  let path = `project-${projectId}/${userId}`;
  const totalFromUser = await calculateStorageSize(path);

  totalStorageSize += totalFromUser;

  path = `project-${projectId}/client-uploads`;
  const totalFromClients = await calculateStorageSize(path);

  totalStorageSize += totalFromClients;

  return totalStorageSize;
}

export default async function ViewSingleProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return redirect("/api/auth/login");

  const { projectInformation, data } = await getProjectInformation({
    userId: user?.id as string,
    projectId: params.id,
  });

  const storageSize = await getStorageInfo({
    userId: user?.id as string,
    projectId: params.id,
  });

  return (
    <div className="space-y-8">
      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 justify-between items-center">
        <div className="flex flex-col justify-center">
          <div className="flex flex-col justify-center items-center lg:flex-row lg:justify-start lg:gap-2">
            <h1 className="text-3xl font-bold uppercase leading-none">
              {projectInformation?.title}
            </h1>
            <Badge
              variant={projectInformation?.isActive ? "default" : "secondary"}
              className="flex gap-1 items-center text-sm max-w-fit mb-4 lg:mt-5"
            >
              {projectInformation?.isActive ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-foreground" /> Active
                </>
              ) : (
                <>
                  <CircleOff className="h-5 w-5 text-red-500" /> Inactive
                </>
              )}
            </Badge>
          </div>
          <Link
            href={`/dashboard/projects/edit/${params.id}`}
            className="text-sm text-muted-foreground hover:text-primary w-fit mx-auto mb-4 lg:mx-0 lg:mb-0"
          >
            Edit Project Details
          </Link>
        </div>

        <div className="justify-self-end flex w-full">
          <Input readOnly placeholder={params.id} className="w-full" />
          <Button>Copy Client Link</Button>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg lg:text-xl">
                Project Balance
              </CardTitle>
              <CardDescription className="text-2xl text-muted-foreground font-extrabold">
                ${projectInformation?.projectCost}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg lg:text-xl">Storage</CardTitle>
              <CardDescription className="text-2xl text-muted-foreground font-extrabold">
                {(storageSize / 1024 / 1024).toFixed(2)} MB
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Files Section */}

      <Card>
        <CardHeader>
          <CardTitle className="mb-4">
            <form>
              <div className="flex justify-between items-center">
                <h3 className="text-xl md:text-2xl">Files</h3>
                <Select>
                  <SelectTrigger className="max-w-[120px]">
                    <SelectValue placeholder="New" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="newFile" className="cursor-pointer">
                        File
                      </SelectItem>
                      <SelectItem value="newFolder" className="cursor-pointer">
                        Folder
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardTitle>
          <Separator />
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Label>Name</Label>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Label>File Type</Label>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Label>Date Added</Label>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell className="text-sm" colSpan={4}>
                  <Link
                    href={`/project/${params.id}/client-uploads`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Folder className="text-primary" />
                    <Label className="cursor-pointer">/ Client Uploads</Label>
                  </Link>
                </TableCell>
              </TableRow>
              {projectInformation?.files?.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <Link href={`/project/${params.id}/track/${file.id}`}>
                      {file.name}
                    </Link>
                  </TableCell>
                  <TableCell>{file.type}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(file.dateAdded))}
                  </TableCell>
                  <TableCell>
                    <form>
                      <input type="text" name="fileId" value={file.id} />
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 text-white" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* File Uploader */}
          <div className="mt-4">
            <ProjectFileUploader userId={(user.id as string) || undefined} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
