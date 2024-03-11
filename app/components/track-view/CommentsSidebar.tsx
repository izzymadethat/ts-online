import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function CommentsSidebar({ track, user }) {
  const comments = track?.project.files[0].comments;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="uppercase">Show all revisions</Button>
      </SheetTrigger>
      <SheetContent className="max-h-screen overflow-y-auto">
        <SheetTitle>Revisions</SheetTitle>
        <SheetDescription>
          Comments from your clients that have been submitted for review. Once
          you have completed the request, simply check it off. They will be
          notified of your completion
        </SheetDescription>

        {comments?.map((comment, index) => (
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
                  {comment.type === "REVISION" && <Checkbox />}
                  <p className="leading-5 max-w-xs">{comment.text}</p>
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
  );
}
