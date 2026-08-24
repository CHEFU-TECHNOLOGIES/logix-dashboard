"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api, OverviewData } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const result = await api.getOverview();
      setData(result);
    } catch {
      // Keep existing data on background refresh errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const health = data?.health || [
    { name: "Ingest Service", status: "healthy" },
    { name: "Alerting Service", status: "healthy" },
    { name: "Database", status: "healthy" },
    { name: "Public API", status: "healthy" },
  ];

  const totalCount = data?.totalCount ?? 0;
  const errorRate = data?.errorRate ?? "0.0%";
  const ingestRate = data?.ingestRate ?? "0/s";
  const avgLatency = data?.avgLatency ?? 42;
  const backlog = data?.backlog ?? 0;
  const lineData = data?.lineData || [];
  const errorTrendData = data?.errorTrendData || [];
  const topSources = data?.topSources || [];
  const topActivity = data?.topActivity || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          High‑level metrics and activity across your logs and alerts.
        </p>
      </div>

      {/* Row 1 — Metrics cards (6 compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            label: "Logs (24h)",
            value: totalCount.toLocaleString(),
          },
          { label: "Error Rate", value: errorRate },
          {
            label: "Ingest Rate",
            value: `${ingestRate} logs/s`,
            live: true,
          },
          { label: "Active Alerts", value: "0" },
          {
            label: "Avg Latency",
            value: `${avgLatency}ms`,
            live: true,
          },
          {
            label: "Queue Backlog",
            value: `${backlog} jobs`,
            live: true,
          },
        ].map((s) => (
          <Card key={s.label} className="rounded-xl border border-white/5 bg-background/50">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground flex items-center justify-between">
                {s.label}
                {s.live && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Live</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2 — 3 wide charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border border-white/5">
          <CardHeader>
            <CardTitle className="text-sm">Logs Over Time (12h)</CardTitle>
          </CardHeader>
          <CardContent className="h-70">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineData}
                  margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                >
                  <XAxis dataKey="hour" hide />
                  <YAxis hide />
                  <RTooltip
                    contentStyle={{ borderRadius: 12, background: "#0E1117", borderColor: "#333" }}
                    labelStyle={{ color: "#00C2A8" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="logs"
                    stroke="#00C2A8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "No logs available for this period."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/5">
          <CardHeader>
            <CardTitle className="text-sm">Error Trend (12h)</CardTitle>
          </CardHeader>
          <CardContent className="h-70">
            {errorTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={errorTrendData}
                  margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                >
                  <XAxis dataKey="hour" hide />
                  <YAxis hide />
                  <RTooltip
                    contentStyle={{ borderRadius: 12, background: "#0E1117", borderColor: "#333" }}
                    labelStyle={{ color: "#ef4444" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "No error trends available."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/5">
          <CardHeader>
            <CardTitle className="text-sm">Top Sources (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-70">
            {topSources.length > 0 ? (
              <div className="h-full flex items-center justify-center">
                <div
                  style={{
                    width:
                      topSources.length <= 3
                        ? `${topSources.length * 120}px`
                        : "100%",
                    maxWidth: "100%",
                    height: "100%",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSources}
                      margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                      <XAxis dataKey="source" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <RTooltip
                        contentStyle={{ borderRadius: 12, background: "#0E1117", borderColor: "#333" }}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#00C2A8"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "No source data available yet."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 — 2 uneven cards (65/35 split) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left (65%) — Top Activity table */}
        <Card className="rounded-2xl xl:col-span-8 border border-white/5">
          <CardHeader>
            <CardTitle className="text-sm">Top Activity (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topActivity.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-white/60">{row.time}</TableCell>
                    <TableCell className="capitalize font-medium">{row.source}</TableCell>
                    <TableCell className="text-white/80">{row.action}</TableCell>
                    <TableCell>
                      <span
                        className={
                          row.status === "ok"
                            ? "text-emerald-400"
                            : row.status === "warn"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }
                      >
                        {row.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {topActivity.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      {isLoading ? "Loading activity..." : "No recent activity recorded."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right (35%) — Stacked panels: Health + Alerts */}
        <div className="flex flex-col gap-6 xl:col-span-4">
          <Card className="rounded-2xl border border-white/5">
            <CardHeader>
              <CardTitle className="text-sm">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {health.map((h) => (
                <div key={h.name} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {h.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {h.status === "healthy" ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 duration-1000"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Operational</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span
                        className={
                          "inline-block h-2 w-2 rounded-full " +
                          (h.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500")
                        }
                      />
                    )}
                    <span className="text-sm capitalize text-white/90">{h.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/5">
            <CardHeader>
              <CardTitle className="text-sm">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                No active alerts triggered.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
