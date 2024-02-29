import { Button } from "@/components/ui/button";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { HeroSection } from "./components/home/hero-section";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  if (await isAuthenticated()) {
    return redirect("/dashboard");
  }
  return (
    <>
      <HeroSection />
      <section className="flex items-center bg-background h-[90vh]">
        <div className="relative items-center w-full px-5 py-12 mx-auto lg:px-16">
          <h2 className="text-5xl lg:text-7xl font-semibold mb-4">
            What is TrakSync?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3  gap-3">
            <div className="border border-dashed bg-slate-900 min-h-[100px] rounded-md"></div>
            <div className="border border-dashed bg-slate-900 min-h-[100px] rounded-md"></div>
            <div className="border border-dashed bg-slate-900 min-h-[100px] rounded-md"></div>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-background h-[90vh]">
        <div className="relative items-center w-full px-5 py-12 mx-auto lg:px-16">
          <h2 className="text-5xl lg:text-7xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3  gap-3">
            <div className="border border-dashed bg-slate-900 min-h-[100px] rounded-md"></div>
            <div className="border border-dashed bg-slate-900 min-h-[100px] rounded-md"></div>
            <div className="border border-dashed bg-slate-900 min-h-[100px] rounded-md"></div>
          </div>
        </div>
      </section>
    </>
  );
}
