"use client";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Home,
  KeyboardMusic,
  Settings,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { label: "Dashboard", route: "/dashboard", icon: Home },
  { label: "Projects", route: "/dashboard/projects", icon: KeyboardMusic },
  { label: "Clients", route: "/dashboard/clients", icon: UsersRound },
  //   { label: "Payments", route: "/dashboard/payments" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link key={index} href={item.route}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.route ? "bg-accent" : "bg-transparent"
            )}
          >
            <item.icon className="mr-2 h-6 w-6 text-primary" />
            <span>{item.label}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
