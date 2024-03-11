import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { CommentSubmitButton } from "../SubmitButton";

type Props = {
  onSubmit: (formData: FormData) => void;
  existingClient?: {
    client_name: string;
    client_email: string;
  };
  timestamp?: string | undefined;
  isTimeStampedComment: boolean;
  onCheckedChange: () => void;
};

export default function CommentForm({
  onSubmit,
  existingClient,
  timestamp,
  isTimeStampedComment,
  onCheckedChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thoughts?</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit}>
          <Input
            name="client-name"
            placeholder="Your name"
            defaultValue={existingClient?.client_name}
            required
          />
          <Input
            name="client-email"
            placeholder="Your email"
            defaultValue={existingClient?.client_email}
            required
          />
          <Textarea
            name="client-comment"
            placeholder="Enter your thoughts (200 characters max)"
            maxLength={200}
            required
          />

          <div>
            <div>
              <Checkbox
                name="comment-timestamp"
                checked={isTimeStampedComment}
                onCheckedChange={onCheckedChange}
              />
              <Label>Leave a comment @ {timestamp} </Label>
            </div>

            <CommentSubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
