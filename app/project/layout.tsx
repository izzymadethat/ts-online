import { Button } from "@/components/ui/button";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React, { ReactNode } from "react";

export default async function ClientViewLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const client = !user;

  return (
    <div>
      {client && (
        <div className="flex justify-center items-center gap-4 max-h-16 bg-gradient-to-r from-primary/10 via-primary to-primary/10 py-1">
          <p className="text-sm">We were BUILT for audio.</p>
          <Button className="w-fit text-xs bg-gradient-to-r from-primary to-primary/30">
            Start using TrakSync for free!
          </Button>
        </div>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
