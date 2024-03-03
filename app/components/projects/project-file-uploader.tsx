"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Inbox, Loader2, Trash2Icon, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/use-toast";
import { useParams, usePathname, useRouter } from "next/navigation";
import prisma from "@/app/lib/db";
import { supabase } from "@/app/lib/supabase";
import axios from "axios";
import { NextApiRequest } from "next";

export default function ProjectFileUploader({
  userId,
}: {
  userId?: undefined | string;
}) {
  const { toast } = useToast();
  const { id } = useParams();
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [rejects, setRejects] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  //   dropzone config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "audio/*": [] },
    onDrop,
  });

  function removeFile(fileIndex: Number) {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== fileIndex));
  }

  function removeAllFiles() {
    setFiles([]);
    return toast({
      description: "Files set to be uploaded have been removed",
    });
  }

  async function submitFiles(e: any) {
    e.preventDefault();

    setUploading(true);

    const data = new FormData();

    files.forEach((file) => {
      data.append("files", file);
    });

    data.set("uid", userId ?? "");
    data.set("projectId", id as string);

    try {
      const uploadData = {
        uid: userId ?? "",
        projectId: id,
        files,
      };

      const filesUploaded = await fetch("/api/file-upload", {
        method: "POST",
        body: data,
      });

      if (filesUploaded.status === 200) {
        toast({
          description: "Files uploaded successfully!",
        });
      } else {
        toast({
          title: "Uh oh! something went wrong!",
          description: "Error uploading files, please try again.",
        });
      }

      setFiles([]);

      return router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Uh oh! something went wrong!",
        description: "Error uploading files, please try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {files && files.length > 0 && (
        <div className="my-4 border border-dashed rounded-lg p-10 max-w-5xl mx-auto">
          <h5 className="mb-4 text-primary">Files to be uploaded</h5>
          <Separator className="my-4" />
          <div>
            <ul className="grid grid-cols-2 lg:grid-cols-4 lg:justify-center gap-4">
              {files?.map((file, index) => (
                <li
                  key={index}
                  className="flex flex-col lg:flex-row items-center p-3 rounded-xl gap-2 border w-fit"
                >
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-fit"
                    onClick={() => removeFile(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>

                  {/* @ts-ignore */}
                  <div>
                    <p className="font-bold text-xs">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} Mb
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {files.length > 0 && (
            <div className="flex flex-col justify-center items-center lg:flex-row lg:justify-between lg:items-start mt-4 gap-2">
              {files.length > 1 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-fit flex gap-2 items-center"
                    >
                      <Trash2Icon className="size-4" />
                      Remove all
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[60vw] lg:max-w-[30vw] mx-auto rounded-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remove all files to be uploaded?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        These files have NOT been uploaded to your project. This
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Take me back</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeAllFiles()}>
                        Yes, delete all files
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {uploading ? (
                <Button disabled className="w-fit">
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Syncing
                  Files...
                </Button>
              ) : (
                <Button className="w-fit" onClick={(e) => submitFiles(e)}>
                  Submit {files.length > 1 ? "files" : "file"} to project
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <form>
        <div
          {...getRootProps()}
          className="min-h-[100px] border  rounded-md p-4 max-w-5xl flex flex-col gap-4 justify-center items-center"
        >
          {" "}
          <input {...getInputProps()} />
          {isDragActive ? (
            <div className="flex flex-col items-center justify-center cursor-pointer border border-dashed rounded-md w-full py-6 space-y-1 bg-primary/20">
              <Inbox className="h-8 w-8" />
              <p className="font-bold max-w-xs">Add files in this zone...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center cursor-pointer border border-dashed rounded-md w-full py-6 space-y-1 hover:bg-muted-foreground/10">
                <UploadCloud className="h-8 w-8" />
                <p className="font-bold max-w-xs">
                  Drop or click to add new files here ...
                </p>
              </div>
              <div className="text-center max-w-md">
                <p className="text-sm text-muted-foreground">Accepted Files:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-3">
                  <li>
                    Max 50mb PER File (Will be changed in next major update){" "}
                  </li>
                  <li>FLAC, WAV, MP3, PDF, PNG, JPEG, and ZIP</li>
                  <li>
                    For audio files: Since some browsers can&apos;t properly
                    stream at 32-bit, it&apos;s recommended to upload 24-bit or
                    lower
                  </li>
                  <li>
                    As of now, only audio files will be displayed. All other
                    files will be for download only.
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
