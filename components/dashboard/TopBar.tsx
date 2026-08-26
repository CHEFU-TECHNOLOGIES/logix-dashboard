"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Settings as SettingsIcon } from "lucide-react";
import { CheFuUserDropdown } from "chefu-ui";
import { useAuth } from "@/lib/auth";
import { CHEFU_ACCOUNT_URL } from "@/lib/config";

export default function TopBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchTerm.trim()) {
            router.push(`/queries?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const accountHref = `${CHEFU_ACCOUNT_URL}?app=logix-dash`;

    return (
        <div className="flex h-16 items-center gap-3 border-b border-white/5 pr-4">
            {/* Search */}
            <div className="ml-auto flex w-full max-w-xl items-center gap-2">
                <div className="relative w-full">
                    <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search logs or queries..."
                        className="pl-8 rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <Link href="/settings">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/10"
                    >
                        <SettingsIcon className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* User dropdown — hidden on small screens where sidebar shows it */}
            {user && (
                <CheFuUserDropdown
                    accountHref={accountHref}
                    onSignOut={logout}
                    className="logix-user-dropdown"
                    triggerClassName="hidden sm:flex rounded-full border-white/14 bg-white/4 hover:bg-white/8"
                    user={{
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                    }}
                    variant="neutral"
                />
            )}
        </div>
    );
}
