"use client";

import { Button } from "@/components/ui/button";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Loader2, Trash } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Syncing...
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          Save Changes
        </Button>
      )}
    </>
  );
}

export function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="destructive" size="icon" disabled className="w-fit">
          <Loader2 className="w-4 h-4 animate-spin" /> Deleting your account...
        </Button>
      ) : (
        <Button type="submit" variant="destructive" className="w-fit">
          Delete My Account
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
        <Button type="submit" className="w-full">
          Subscribe to this plan
        </Button>
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

export function SubmitNewProjectButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className="w-fit">
          <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Creating New
          Project...
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          Create Project
        </Button>
      )}
    </>
  );
}

export function DeleteProjectButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="destructive" size="icon" disabled>
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      ) : (
        <Button variant="destructive" size="icon" type="submit">
          <Trash className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}

export function CommentSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button variant="destructive" size="icon" disabled className="w-fit">
          <Loader2 className="w-4 h-4 animate-spin" /> Sending Comment...
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          Submit Comment
        </Button>
      )}
    </>
  );
}

export function AccountOnboardingButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button className="w-full">
          <Loader2 className="w-4 h-4 animate-spin" /> Calling to Stripe
          Onboarding...
        </Button>
      ) : (
        <Button className="w-full" type="submit">
          Set Up or Connect Your Stripe Account
        </Button>
      )}
    </>
  );
}
