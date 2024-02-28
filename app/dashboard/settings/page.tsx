import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButton";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function getData(userId: string) {
  if (!userId) return;

  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  return data;
}

export default async function SettingsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  const data = await getData(user?.id as string);

  async function postData(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;

    await prisma.user.update({
      where: {
        id: user?.id as string,
      },
      data: {
        name: name ?? undefined,
      },
    });
  }

  return (
    <div className="grid items-start gap-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-3xl md:text-4xl">Settings</h1>
          <p className="text-lg text-muted-foreground">Your Profile Settings</p>
        </div>
      </div>

      <Card>
        <form action={postData}>
          <CardHeader>
            <CardTitle>General Data</CardTitle>
            <CardDescription>
              Provide general information about yourself. Don&apos;t forget to
              save!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label>Your First Name</Label>
                <Input
                  name="name"
                  type="text"
                  id="name"
                  placeholder="Your Name"
                  defaultValue={data?.name ?? undefined}
                />
              </div>

              <div className="space-y-1">
                <Label>Your Email</Label>
                <Input
                  name="email"
                  type="email"
                  id="email"
                  placeholder="Your Email"
                  defaultValue={data?.email ?? undefined}
                  disabled
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>View Billing Information</CardTitle>
            <Button asChild>
              <Link href="/dashboard/billing">Take Me to Billing</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
