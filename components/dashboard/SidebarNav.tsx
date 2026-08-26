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
import {
    Home,
    Activity,
    Search as SearchIcon,
    Bell,
    Plug,
    Key,
    Settings as SettingsIcon,
} from "lucide-react";
import Logo from "../common/logo";
import { useAuth } from "@/lib/auth";
import { CheFuUserDropdown } from "chefu-ui";
import { CHEFU_ACCOUNT_URL } from "@/lib/config";

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
    user: initialUser,
}: DashboardSidebarProps) {
    const pathname = usePathname();
    const { user: authUser, logout } = useAuth();

    const items = [
        { label: "Overview", href: "/", Icon: Home },
        { label: "Live Logs", href: "/live-logs", Icon: Activity },
        { label: "Queries", href: "/queries", Icon: SearchIcon },
        { label: "Alerts", href: "/alerts", Icon: Bell },
        { label: "Integrations", href: "/integrations", Icon: Plug },
        { label: "API Keys", href: "/api-keys", Icon: Key },
        { label: "Settings", href: "/settings", Icon: SettingsIcon },
    ];

    const accountHref = `${CHEFU_ACCOUNT_URL}?app=logix-dash`;

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
                            <Logo textClassName="text-xl" className="h-7 w-7" />
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
                        <Logo textClassName="text-xl" className="h-7 w-7" />
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
                                                <span className="text-[13px]">{label}</span>
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
                    <div className="px-3 pb-1 group-data-[collapsible=icon]:hidden">
                        <CheFuUserDropdown
                            className="logix-user-dropdown"
                            accountHref={accountHref}
                            onSignOut={logout}
                            triggerClassName="w-full justify-between"
                            menuPlacement="top"
                            user={{
                                displayName: authUser?.displayName || initialUser?.name,
                                email: authUser?.email || initialUser?.email,
                                photoURL: authUser?.photoURL || initialUser?.image,
                            }}
                            variant="neutral"
                        />
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
