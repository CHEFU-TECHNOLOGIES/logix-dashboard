"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Home,
  Activity,
  Search as SearchIcon,
  Bell,
  Plug,
  Key,
  Settings as SettingsIcon,
  User2,
} from "lucide-react";
import Logo from "../common/logo";

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface DashboardSidebarProps {
  children: React.ReactNode;
  user?: DashboardUser | null;
}

export function DashboardSidebar({
  children,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const items = [
    { label: "Overview", href: "/", Icon: Home },
    { label: "Live Logs", href: "/live-logs", Icon: Activity },
    { label: "Queries", href: "/queries", Icon: SearchIcon },
    { label: "Alerts", href: "/alerts", Icon: Bell },
    { label: "Integrations", href: "/integrations", Icon: Plug },
    { label: "API Keys", href: "/api-keys", Icon: Key },
    { label: "Settings", href: "/settings", Icon: SettingsIcon },
  ];

  const displayName = user?.name || "Developer";
  const email = user?.email || "developer@logix.dev";

  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "270px",
          "--sidebar-width-icon": "80px",
        } as React.CSSProperties
      }
    >
      <Sidebar
        collapsible="icon"
        className="
          w-60
          border-r border-white/5
          bg-[linear-gradient(180deg,#0C0F12_0%,#080A0C_100%)]
          backdrop-blur
          supports-backdrop-filter:bg-transparent
          ring-0
          shadow-none
        "
      >
        {/* Header */}
        <SidebarHeader>
          <div className="group-data-[collapsible=icon]:hidden">
            <Link href="/" className="flex h-full items-center p-2">
              <Logo
                textClassName="text-xl"
                className="h-7 w-7"
              />
            </Link>

            <span className="px-4 -mt-2 text-sm text-white/70">
              Developer Console
            </span>
          </div>

          <Link
            href="/"
            className="
              hidden
              h-full
              items-center
              justify-center
              p-2
              group-data-[collapsible=icon]:flex
              [&>div]:hidden
            "
          >
            <Logo
              textClassName="text-xl"
              className="h-7 w-7"
            />
          </Link>
        </SidebarHeader>

        <div className="w-[96%] mt-2">
          <SidebarSeparator />
        </div>

        {/* Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <div
              className="
                px-4
                pt-1
                pb-1
                text-[11px]
                uppercase
                tracking-wider
                text-[#71717A]
                group-data-[collapsible=icon]:hidden
              "
            >
              Main
            </div>

            <SidebarGroupContent>
              <SidebarMenu className="gap-4 px-3">
                {items.map(({ label, href, Icon }) => (
                  <SidebarMenuItem key={href}>
                    <Link href={href}>
                      <SidebarMenuButton
                        tooltip={label}
                        isActive={pathname === href}
                        className="
                          group
                          h-10
                          w-full
                          rounded-[10px]
                          px-3
                          gap-3
                          font-medium
                          text-zinc-300
                          hover:bg-[rgba(0,194,168,0.1)]
                          hover:text-[#00C2A8]
                          focus:bg-[rgba(0,194,168,0.1)]
                          focus:text-[#00C2A8]
                          focus-visible:ring-0
                          active:bg-[rgba(0,194,168,0.15)]
                          active:text-[#00C2A8]
                          data-[active=true]:bg-[rgba(0,194,168,0.15)]
                          data-[active=true]:text-[#00C2A8]
                          transition-colors
                          duration-150
                          cursor-pointer
                        "
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span className="text-[13px]">
                          {label}
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="w-[96%]">
          <SidebarSeparator />
        </div>

        {/* User */}
        <SidebarFooter>
          <div
            className="
              relative
              mt-3
              mx-3
              mb-3
              group-data-[collapsible=icon]:hidden
            "
          >
            {/* Plan badge */}
            <span
              className="
                absolute
                -top-3
                left-2
                z-10
                rounded-lg
                border
                border-gray-500/30
                bg-gradient-to-r
                from-gray-500/20
                to-gray-600/20
                px-2
                py-0.5
                text-[11px]
                font-semibold
                capitalize
                text-gray-400
              "
            >
              Free
            </span>

            <div
              className="
                h-16
                rounded-xl
                border
                border-white/5
                bg-background/30
                px-3
                py-2
              "
            >
              <div className="flex h-full items-center gap-3">
                {/* Avatar */}
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-teal-400
                        to-emerald-500
                        text-[11px]
                        font-semibold
                        text-background
                      "
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* User information */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-[#A1A1AA]">
                    {displayName}
                  </div>

                  <div className="truncate text-[11px] text-[#52525B]">
                    {email}
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-transparent!"
                >
                  <User2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarTrigger
                className="
                  w-full
                  justify-start
                  rounded-xl
                  hover:bg-transparent!
                "
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {children}
    </SidebarProvider>
  );
}

export default DashboardSidebar;