"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, UserProfile } from "./api";
import { CHEFU_ACCOUNT_URL, DASHBOARD_URL } from "./config";

interface AuthContextType {
    user: UserProfile | null;
    profile: Record<string, unknown> | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    redirectToLogin: (returnTo?: string) => void;
    redirectToRegister: (returnTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        try {
            const data = await api.getCurrentUser();
            setUser(data.user);
            setProfile(data.profile);
        } catch {
            setUser(null);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await api.clearSession(true);
        } catch { }
        setUser(null);
        setProfile(null);
        window.location.assign(`${CHEFU_ACCOUNT_URL}/logout?app=logix-dash&returnTo=${encodeURIComponent(DASHBOARD_URL)}`);
    };

    const redirectToLogin = (returnTo?: string) => {
        const dest = returnTo || window.location.href;
        window.location.assign(
            `${CHEFU_ACCOUNT_URL}/login?app=logix-dash&returnTo=${encodeURIComponent(dest)}`,
        );
    };

    const redirectToRegister = (returnTo?: string) => {
        const dest = returnTo || window.location.href;
        window.location.assign(
            `${CHEFU_ACCOUNT_URL}/register?app=logix-dash&returnTo=${encodeURIComponent(dest)}`,
        );
    };

    // Protected Route Check for client side
    useEffect(() => {
        if (!isLoading && !user) {
            const publicPaths = ["/login", "/register"];
            const isPublic = publicPaths.some((p) => pathname?.startsWith(p));
            if (!isPublic) {
                // User is unauthenticated on a protected dashboard route
                redirectToLogin(window.location.href);
            }
        }
    }, [isLoading, user, pathname]);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                isLoading,
                isAuthenticated: Boolean(user),
                logout,
                refreshUser: fetchUser,
                redirectToLogin,
                redirectToRegister,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
