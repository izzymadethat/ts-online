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
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteButton, SubmitButton } from "@/app/components/SubmitButton";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import Link from "next/link";
import { stripe } from "@/app/lib/stripe";
import { getAccessTokenRawFactory } from "@kinde-oss/kinde-auth-nextjs/dist/types/session/getAccessTokenRaw";

async function getData(userId: string) {
  noStore();
  if (!userId) return;

  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      stripeCustomerId: true,
    },
  });

  return data;
}

export default async function SettingsPage() {
  const { getUser, getAccessToken } = getKindeServerSession();

  const user = await getUser();
  const accessToken = await getAccessToken();

  console.log(user?.id, accessToken);

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

  async function DeleteUserFromKinde(userId: string) {
    "use server";

    if (!userId) throw new Error("No userId or user not authorized");

    const headers = {
      Accept: "application/json",
      Authorization: "Bearer " + accessToken,
    };

    try {
      const deleteUrl = `https://traksync.kinde.com/api/v1/user?id=${userId}
          &amp;is_delete_profile=true`;
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteUser(formData: FormData) {
    "use server";
    try {
      const userId = formData.get("userId") as string;
      const stripeId = formData.get("stripeId") as string;

      if (!userId || !stripeId)
        throw new Error("No userId provided or not authorized");

      await stripe.customers.del(stripeId);

      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      await DeleteUserFromKinde(userId);
    } catch (error) {
      console.error(error);
    } finally {
      return redirect("/api/auth/logout");
    }
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
          <div className="flex flex-col gap-y-2 md:gap-y-0 md:flex-row justify-between items-center">
            <CardTitle>View Billing Information</CardTitle>
            <Button asChild>
              <Link href="/dashboard/billing">Take Me to Billing</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-x-5">
            <div>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription className="max-w-sm">
                Warning: Deleting your account will erase all of your
                information, including payments. This can not be undone.
              </CardDescription>
            </div>
            <form action={deleteUser}>
              <input type="hidden" name="userId" value={user?.id} />
              <input
                type="hidden"
                name="stripeId"
                value={data?.stripeCustomerId as string}
              />

              <DeleteButton />
            </form>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
