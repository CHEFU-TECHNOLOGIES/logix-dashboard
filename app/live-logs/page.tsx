"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Activity as ActivityIcon, Clipboard, Pause, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStream } from "@chefu-tech/logix-next";
import type { LogLevel, StreamLogNormalized } from "@chefu-tech/logix-next";
import { toast } from "sonner";

// Color scheme mapping
const levelColor: Record<LogLevel, string> = {
  info: "#60A5FA", // Blue
  warning: "#FBBF24", // Yellow/Amber
  error: "#F87171", // Red
  debug: "#A78BFA", // Purple
  success: "#34D399", // Emerald/Green
  audit: "#34D399", // Emerald/Green
  metric: "#22D3EE", // Cyan
};

export default function LiveLogsPage() {
  const [filterLevel, setFilterLevel] = useState<"All" | LogLevel>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StreamLogNormalized | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<StreamLogNormalized[]>([]);
  const streamRef = useRef<HTMLDivElement>(null);

  const {
    data: streamLogs,
    isLoading,
    error,
    connected,
  } = getStream({
    type: filterLevel === "All" ? "" : filterLevel,
    search,
  });

  useEffect(() => {
    if (!isPaused) setVisibleLogs(streamLogs);
  }, [streamLogs, isPaused]);

  useEffect(() => {
    if (!isPaused) {
      streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight });
    }
  }, [visibleLogs.length, isPaused]);

  const filteredLogs: StreamLogNormalized[] = useMemo(() => {
    return visibleLogs;
  }, [visibleLogs]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    let errors = 0;
    let warnings = 0;
    let success = 0;
    for (const l of filteredLogs) {
      const lvl = l.level.toLowerCase();
      if (lvl === "error") errors++;
      else if (lvl === "warning" || lvl === "warn") warnings++;
      else if (lvl === "success") success++;
    }
    return { total, errors, warnings, success };
  }, [filteredLogs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live Logs</h1>
          <p className="text-sm text-muted-foreground">
            Watch incoming production log events in real time.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-white/10 hover:bg-white/5"
          onClick={() => setIsPaused((prev) => !prev)}
        >
          {isPaused ? (
            <>
              <Play className="mr-2 h-4 w-4 text-emerald-400" />
              Resume Stream
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4 text-yellow-400" />
              Pause Stream
            </>
          )}
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex items-end gap-3">
        <div className="w-55">
          <div className="text-xs text-muted-foreground mb-1">Category</div>
          <Select
            value={filterLevel}
            onValueChange={(v) =>
              setFilterLevel(v === "All" ? "All" : (v as LogLevel))
            }
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
              <SelectItem value="metric">Metric</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">Search</div>
          <Input
            placeholder="Filter logs by keyword, service, or JSON payload..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Log Viewer */}
      <div className="space-y-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 opacity-60 text-teal-400" />
            <span className="text-xs text-muted-foreground">
              Live tail • {visibleLogs.length} entries recorded
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            {!isPaused && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            )}
            {isPaused ? "Paused" : connected ? "Connected to live stream" : "Disconnected"}
          </span>
        </div>

        <div
          ref={streamRef}
          className="h-[60vh] w-full overflow-y-auto rounded-xl border"
          style={{
            border: "1px solid rgba(255,255,255,0.05)",
            background: "#0B0F13",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          {error ? (
            <div className="flex h-full items-center justify-center text-red-400">
              Failed to load live logs: {error.message}
            </div>
          ) : isLoading && visibleLogs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to live log stream…
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ActivityIcon className="mr-2 h-4 w-4" />
              No logs matched your current filters.
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filteredLogs.map((l) => {
                const lvl = l.level;
                return (
                  <li
                    key={l.id}
                    className="group px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setSelected(l)}
                  >
                    <span className="text-[11px] text-white/50 mr-2">
                      {new Date(l.ts).toLocaleTimeString()}
                    </span>
                    <span
                      className="mr-2 font-medium"
                      style={{ color: levelColor[lvl] || "#60A5FA" }}
                    >
                      [{lvl.toUpperCase()}]
                    </span>
                    <span className="mr-2 text-white/70 font-semibold">{l.source}</span>
                    <span className="block text-white/90 whitespace-nowrap overflow-hidden text-ellipsis group-hover:whitespace-normal group-hover:break-words">
                      {l.message}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-120 max-w-[90vw] rounded-xl border bg-background p-4 border-white/10"
            style={{ background: "#0E1117" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Log Details</h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl hover:bg-white/10"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
                  toast.success("Log JSON copied to clipboard");
                }}
              >
                <Clipboard className="mr-2 h-3.5 w-3.5" />
                Copy JSON
              </Button>
            </div>
            <Tabs defaultValue="formatted" className="mt-3">
              <TabsList>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted" className="mt-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span>{new Date(selected.ts).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span
                      className="font-medium uppercase"
                      style={{
                        color:
                          levelColor[selected.level] ||
                          "#60A5FA",
                      }}
                    >
                      {selected.level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source / App</span>
                    <span>{selected.source}</span>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Message</div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-xs text-white/90">
                      {selected.message}
                    </div>
                  </div>
                  {selected.payload && Object.keys(selected.payload).length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Payload</div>
                      <pre className="rounded-lg border border-white/10 bg-black/30 p-2 overflow-x-auto text-xs font-mono text-teal-300/90">
                        {JSON.stringify(selected.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="raw" className="mt-3">
                <pre className="rounded-lg border border-white/10 bg-black/30 p-2 overflow-x-auto text-xs font-mono text-teal-300/90">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Footer status bar */}
      <div
        className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs border-white/5"
        style={{
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">Logs In View</span>
          <span className="font-medium">{stats.total.toLocaleString()}</span>
          <span className="text-muted-foreground">Errors</span>
          <span className="font-medium text-red-400">{stats.errors}</span>
          <span className="text-muted-foreground">Warnings</span>
          <span className="font-medium text-yellow-400">{stats.warnings}</span>
        </div>
      </div>
    </div>
  );
}
