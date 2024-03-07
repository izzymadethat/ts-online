import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import React from "react";

export default function TrackPageLoader() {
  return (
    <div className=" max-w-7xl mx-auto min-h-[80vh] my-1/2 flex flex-col gap-10 items-center justify-center">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-16 bg-primary/70 rounded-full" />
        <Skeleton className="h-10 w-20 bg-primary/60 rounded-full" />
        <Skeleton className="h-10 w-20 bg-primary/50 rounded-full" />
      </div>
      <div className="flex items-center justify-center gap-2 ">
        <Loader2 className="size-20 animate-spin text-primary/70" />
        <h2 className="text-4xl w-fit text-primary/80 animate-pulse font-extrabold">
          Syncing...
        </h2>
      </div>
      <div className="flex items-center gap-4 ">
        <Skeleton className="h-10 w-16 bg-primary/50 rounded-full" />
        <Skeleton className="h-10 w-20 bg-primary/60 rounded-full" />
        <Skeleton className="h-10 w-20 bg-primary/70 rounded-full" />
      </div>
    </div>
  );
}
