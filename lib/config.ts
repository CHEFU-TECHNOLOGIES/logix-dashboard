export const CHEFU_APP_ID = "logix-dash";
export const CHEFU_APP_HEADER = "x-chefu-app";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.chefu.co.za";

export const CHEFU_ACCOUNT_URL =
    process.env.NEXT_PUBLIC_CHEFU_ACCOUNT_URL ||
    "https://myaccount.chefu.co.za";

export const LANDING_PAGE_URL =
    process.env.NEXT_PUBLIC_LANDING_PAGE_URL ||
    "https://logix.chefu.co.za";

export const DASHBOARD_URL =
    process.env.NEXT_PUBLIC_DASHBOARD_URL ||
    "https://dashboard.logix.chefu.co.za";

export function getApiUrl(path: string) {
    const cleanBase = API_BASE_URL.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
}
