import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import React from "react";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getStripeSession, stripe } from "@/app/lib/stripe";
import {
  StripePortal,
  StripeSubscriptionSubmissionButton,
} from "@/app/components/SubmitButton";
import { pricingInformation } from "../../constants/index.js";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const featureItems = [
  {
    feature: "Unlimited Projects",
  },
  {
    feature: "Unlimited Clients",
  },
  {
    feature: "256Gb Storage Space",
  },
  {
    feature: "Priority & Lifetime Support",
  },
  {
    feature: "Lifetime Access To Updates",
  },
];

async function GetPaymentData(userId: string) {
  const data = await prisma.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      status: true,
      user: {
        select: {
          stripeCustomerId: true,
        },
      },
    },
  });

  return data;
}

export default async function BillingPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return redirect("/");

  const data = await GetPaymentData(user?.id as string);

  async function createSubscription({
    plan,
    period,
  }: {
    plan: string;
    period: string;
  }) {
    "use server";

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },

      select: {
        stripeCustomerId: true,
      },
    });

    if (!dbUser?.stripeCustomerId)
      throw new Error("Stripe Customer ID not found");

    let priceId;
    if (plan === "professional" && period === "monthly") {
      priceId = process.env.NEXT_TRAKSYNC_PRO_MONTHLY_PRICE_ID as string;
    } else if (plan === "professional" && period === "yearly") {
      priceId = process.env.NEXT_TRAKSYNC_PRO_YEARLY_PRICE_ID as string;
    } else if (plan === "enterprise" && period === "monthly") {
      priceId = process.env.NEXT_TRAKSYNC_ENTERPRISE_MONTHLY_PRICE_ID as string;
    } else if (plan === "enterprise" && period === "yearly") {
      priceId = process.env.NEXT_TRAKSYNC_ENTERPRISE_YEARLY_PRICE_ID as string;
    }

    const subscriptionUrl = await getStripeSession({
      customerId: dbUser.stripeCustomerId,
      domainUrl: "http://localhost:3000",
      priceId: priceId as string,
    });

    return redirect(subscriptionUrl);
  }

  async function createCustomerPortal() {
    "use server";

    const session = await stripe.billingPortal.sessions.create({
      customer: data?.user.stripeCustomerId as string,
      return_url: "http://localhost:3000/dashboard",
    });

    return redirect(session.url);
  }

  if (data?.status === "active") {
    return (
      <div className="grid items-start gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl md:text-4xl">Subscriptions</h1>
            <p className="text-lg text-muted-foreground">
              Settings regarding your subscription
            </p>
          </div>
        </div>
        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Edit Subscription</CardTitle>
            <CardDescription>
              Click the button below to change your payment details, view your
              statements, or update your subscription status s
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCustomerPortal}>
              <StripePortal />
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 items-center justify-center mb-4">
        <h2 className="text-4xl font-extrabold">Isaiah Vickers</h2>
        <h3 className="leading-none px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
          {data?.status === "active" ? "Sync Professional" : "Sync Starter"}
        </h3>
      </div>
      <div className="mx-auto space-y-4 ">
        <h2 className="text-lg text-center text-muted-foreground italic tracking-wider my-2">
          Upgrade your account to...
        </h2>
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="monthly">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="flex gap-x-4">
              {pricingInformation.monthly.map((price) => (
                <>
                  <Card className="flex flex-col">
                    <CardContent className="py-8">
                      <div>
                        <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
                          Sync {price.plan.toUpperCase() as string}
                        </h3>
                      </div>

                      <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                        ${price.price / 100}{" "}
                        <span className="ml-1 text-2xl text-muted-foreground">
                          /mo
                        </span>
                      </div>
                      <p className="mt-5 text-lg text-muted-foreground">
                        Create more projects with more storage space
                      </p>
                    </CardContent>
                    <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-secondary rounded-lg m-1 space-y-6 sm:p-10 sm:pt-6">
                      <ul className="space-y-4">
                        {featureItems.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <div className="flex-shrink-0">
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                            <p className="ml-3 text-base">{item.feature}</p>
                          </li>
                        ))}
                        <hr className="w-full bg-muted-foreground h-0.5" />
                      </ul>
                      <form>
                        <StripeSubscriptionSubmissionButton />
                      </form>
                    </div>
                  </Card>
                </>
              ))}
            </TabsContent>

            <TabsContent value="yearly" className="flex gap-x-4">
              {pricingInformation.yearly.map((price) => (
                <>
                  <Card className="flex flex-col">
                    <CardContent className="py-8">
                      <div>
                        <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
                          Sync Professional
                        </h3>
                      </div>

                      <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                        $199.99{" "}
                        <span className="ml-1 text-2xl text-muted-foreground">
                          /yr
                        </span>
                      </div>
                      <p className="mt-5 text-lg text-muted-foreground">
                        Create more projects with more storage space
                      </p>
                    </CardContent>
                    <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-secondary rounded-lg m-1 space-y-6 sm:p-10 sm:pt-6">
                      <ul className="space-y-4">
                        {featureItems.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <div className="flex-shrink-0">
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                            <p className="ml-3 text-base">{item.feature}</p>
                          </li>
                        ))}
                        <hr className="w-full bg-muted-foreground h-0.5" />
                      </ul>
                      <form>
                        <StripeSubscriptionSubmissionButton />
                      </form>
                    </div>
                  </Card>
                </>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
