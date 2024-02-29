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
import { Trash2Icon, UploadCloud, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/use-toast";

export default function ProjectFileUploader() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      ),
    ]);
  }, []);

  //   dropzone config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  function removeFile(fileIndex: Number) {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== fileIndex));
  }

  function removeAllFiles() {
    setFiles([]);
    return toast({
      description: "Files set to be uploaded have been removed",
    });
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
                  className="flex flex-col lg:flex-row items-center p-2 rounded-xl gap-2 border"
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
                  <p className="font-bold text-xs">{file.path}</p>
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
              <Button className="w-fit">
                Submit {files.length > 1 ? "files" : "file"} to project
              </Button>
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
            <></>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center cursor-pointer border border-dashed rounded-md w-full py-6 space-y-1 hover:bg-muted-foreground/10">
                <UploadCloud className="h-8 w-8" />
                <p className="font-bold max-w-xs">
                  Drop or click to add new files here ...
                </p>
              </div>
              <div className="text-center max-w-sm">
                <p className="text-sm text-muted-foreground">Accepted Files:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-2">
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
