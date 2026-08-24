import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/components/dashboard/SidebarNav";
import { SidebarInset } from "@/components/ui/sidebar";
import TopBar from "@/components/dashboard/TopBar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const satoshi = localFont({
    src: "../assets/fonts/Satoshi-Bold.otf",
    variable: "--font-satoshi",
    weight: "700",
});

export const metadata: Metadata = {
    title: "Logix",
    description: "Production-ready logs in under a minute.",
};

import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} antialiased`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <TooltipProvider>
                        <DashboardSidebar>
                            <SidebarInset>
                                <TopBar />
                                <div className="py-4 pr-4">
                                    <div className="mx-auto max-w-7xl">{children}</div>
                                </div>
                            </SidebarInset>
                        </DashboardSidebar>
                    </TooltipProvider>
                    <Toaster richColors position="top-right" />
                </AuthProvider>
            </body>
        </html>
    );
}
