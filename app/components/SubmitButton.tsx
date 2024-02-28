"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-pulse" /> Syncing...
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          Save Changes
        </Button>
      )}
    </>
  );
}

export function StripeSubscriptionSubmissionButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Subscribing...
        </Button>
      ) : (
        <Button type="submit">Subscribe to this plan</Button>
      )}
    </>
  );
}

export function StripePortal() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Sending to Account
          Portal...
        </Button>
      ) : (
        <Button type="submit">Manage Subscription</Button>
      )}
    </>
  );
}
