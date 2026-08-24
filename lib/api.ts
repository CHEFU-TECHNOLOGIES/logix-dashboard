import { CHEFU_APP_HEADER, CHEFU_APP_ID, getApiUrl } from "./config";

export type LogLevel =
    | "info"
    | "warning"
    | "error"
    | "debug"
    | "success"
    | "audit"
    | "metric";

export type LogEntry = {
    id: string;
    ts: string;
    level: LogLevel;
    type?: LogLevel;
    source: string;
    appName?: string;
    environment?: string;
    subsystem?: string | null;
    operation?: string | null;
    importance?: number | string | null;
    message: string;
    payload: Record<string, unknown>;
    durationMs?: number;
    ingested_at?: string;
};

export type OverviewData = {
    totalCount: number;
    errorRate: string;
    ingestRate: number | string;
    avgLatency: number;
    backlog: number;
    lineData: Array<{ hour: string; logs: number }>;
    errorTrendData: Array<{ hour: string; errors: number }>;
    topSources: Array<{ source: string; count: number }>;
    topActivity: Array<{
        time: string;
        source: string;
        action: string;
        status: string;
    }>;
    health: Array<{ name: string; status: string }>;
    logs?: LogEntry[];
};

export type QueryLogsParams = {
    type?: string;
    level?: string;
    env?: string;
    appName?: string;
    search?: string;
    limit?: number;
};

export type KeyRow = {
    id: string;
    publicId: string;
    name: string;
    scope: "Read Only" | "Write Only" | "Full Access";
    status: "Active" | "Revoked";
    created: string;
    lastUsed: string;
    createdAt?: string | null;
    lastUsedAt?: string | null;
};

export type AlertItem = {
    id: string;
    name: string;
    condition: string;
    status: "Active" | "Resolved";
    severity: "High" | "Medium" | "Low";
    channel: "Slack" | "Email" | "Webhook";
    thresholdPeriod: "5m" | "15m" | "1h";
    lastTriggered: string;
    createdAt?: string | null;
};

export type ProjectSettings = {
    name: string;
    region: string;
    timezone: string;
    plan: string;
    updatedAt?: string | null;
};

export type BillingInfo = {
    plan: string;
    invoices: Array<{
        id: string;
        date: string;
        amount: string;
        status: string;
    }>;
    usage: {
        logsLimit: string;
        retentionDays: number;
    };
};

export type UserProfile = {
    uid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
    roles?: string[];
    createdAt?: string | null;
};

class ApiClient {
    private async request<T>(
        path: string,
        options: RequestInit = {},
    ): Promise<T> {
        const url = getApiUrl(path);
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            [CHEFU_APP_HEADER]: CHEFU_APP_ID,
            ...((options.headers as Record<string, string>) || {}),
        };

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include",
        });

        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const data = await response.json();
                errorMessage = data.message || data.error || errorMessage;
            } catch { }

            const error = new Error(errorMessage) as Error & { status?: number };
            error.status = response.status;
            throw error;
        }

        return response.json();
    }

    // -------------------------------------------------------------------------
    // Auth & User
    // -------------------------------------------------------------------------

    async getCurrentUser(): Promise<{
        user: UserProfile;
        profile: Record<string, unknown>;
    }> {
        return this.request("/auth/me");
    }

    async syncSession(idToken: string): Promise<{ ok: boolean }> {
        return this.request("/auth/session", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });
    }

    async clearSession(global = false): Promise<{ ok: boolean }> {
        return this.request(`/auth/session${global ? "?global=true" : ""}`, {
            method: "DELETE",
        });
    }

    async updateProfile(
        body: Record<string, unknown>,
    ): Promise<{ ok: boolean; user: UserProfile }> {
        return this.request("/auth/profile", {
            method: "PATCH",
            body: JSON.stringify(body),
        });
    }

    // -------------------------------------------------------------------------
    // Logix Overview & Logs
    // -------------------------------------------------------------------------

    async getOverview(): Promise<OverviewData> {
        return this.request("/logix/overview");
    }

    async getLogs(
        params: QueryLogsParams = {},
    ): Promise<{ count: number; logs: LogEntry[] }> {
        const query = new URLSearchParams();
        if (params.type) query.set("type", params.type);
        if (params.level) query.set("level", params.level);
        if (params.env) query.set("env", params.env);
        if (params.appName) query.set("appName", params.appName);
        if (params.search) query.set("search", params.search);
        if (params.limit) query.set("limit", String(params.limit));

        const queryString = query.toString();
        return this.request(`/logix/logs${queryString ? `?${queryString}` : ""}`);
    }

    async ingestLog(
        log: Record<string, unknown>,
    ): Promise<{ success: boolean; id: string }> {
        return this.request("/logix/logs", {
            method: "POST",
            body: JSON.stringify(log),
        });
    }

    // -------------------------------------------------------------------------
    // API Keys
    // -------------------------------------------------------------------------

    async getApiKeys(): Promise<KeyRow[]> {
        return this.request("/logix/api-keys");
    }

    async createApiKey(body: {
        name?: string;
        scope?: "Full Access" | "Read Only" | "Write Only";
        expiresAt?: string;
    }): Promise<{
        key: string;
        publicId: string;
        name: string;
        scope: string;
        status: string;
    }> {
        return this.request("/logix/api-keys", {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async revokeApiKey(keyId: string): Promise<{ success: boolean }> {
        return this.request(`/logix/api-keys/${encodeURIComponent(keyId)}/revoke`, {
            method: "POST",
        });
    }

    async deleteApiKey(keyId: string): Promise<{ success: boolean }> {
        return this.request(`/logix/api-keys/${encodeURIComponent(keyId)}`, {
            method: "DELETE",
        });
    }

    // -------------------------------------------------------------------------
    // Alerts
    // -------------------------------------------------------------------------

    async getAlerts(): Promise<AlertItem[]> {
        return this.request("/logix/alerts");
    }

    async createAlert(body: {
        name: string;
        condition: string;
        severity?: "High" | "Medium" | "Low";
        channel?: "Slack" | "Email" | "Webhook";
        thresholdPeriod?: "5m" | "15m" | "1h";
    }): Promise<{ success: boolean; alert: AlertItem }> {
        return this.request("/logix/alerts", {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async deleteAlert(alertId: string): Promise<{ success: boolean }> {
        return this.request(`/logix/alerts/${encodeURIComponent(alertId)}`, {
            method: "DELETE",
        });
    }

    // -------------------------------------------------------------------------
    // Project & Settings
    // -------------------------------------------------------------------------

    async getProjectSettings(): Promise<ProjectSettings> {
        return this.request("/logix/project");
    }

    async updateProjectSettings(
        body: Partial<ProjectSettings>,
    ): Promise<ProjectSettings> {
        return this.request("/logix/project", {
            method: "PATCH",
            body: JSON.stringify(body),
        });
    }

    async getBillingInfo(): Promise<BillingInfo> {
        return this.request("/logix/billing");
    }

    async deleteAccount(): Promise<{
        success: boolean;
        message: string;
        scheduledPurgeAt: string;
    }> {
        return this.request("/logix/account", {
            method: "DELETE",
        });
    }
}

export const api = new ApiClient();
