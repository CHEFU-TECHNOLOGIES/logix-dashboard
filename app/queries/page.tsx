"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Play, XCircle, Search, Clipboard, Loader2 } from "lucide-react";
import { getLogs } from "@chefu-tech/logix-next";
import type { LogEntry } from "@/lib/api";
import { toast } from "sonner";

const levelColor: Record<string, string> = {
  info: "#60A5FA", // Blue
  warning: "#FBBF24", // Yellow/Amber
  error: "#F87171", // Red
  debug: "#A78BFA", // Purple
  success: "#34D399", // Emerald/Green
  audit: "#34D399", // Emerald/Green
  metric: "#22D3EE", // Cyan
};

function QueriesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [query, setQuery] = useState(
    initialSearch ? `search:${initialSearch}` : "",
  );
  const [filters, setFilters] = useState<Record<string, string | number>>({
    ...(initialSearch ? { search: initialSearch } : {}),
    limit: 200,
  });
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const examples = [
    "type:error",
    "appName:api AND search:timeout",
    "type:warning AND appName:billing",
    "env:production",
  ];

  const parseQueryFilters = useCallback((q: string) => {
    const out: {
      type?: string;
      level?: string;
      env?: string;
      appName?: string;
      search?: string;
      limit?: number;
    } = { limit: 200 };

    if (!q.trim()) return out;

    const parts = q.trim().split(/\s+AND\s+|\s+/i);
    const searchTokens: string[] = [];

    for (const p of parts) {
      const [rawKey, ...rest] = p.split(":");
      if (!rawKey || rest.length === 0) {
        searchTokens.push(p);
        continue;
      }
      const value = rest.join(":").trim();
      const key = rawKey.trim().toLowerCase();

      if (key === "level" || key === "type") out.type = value;
      else if (key === "env" || key === "environment") out.env = value;
      else if (key === "appname" || key === "app" || key === "service")
        out.appName = value;
      else if (key === "search" || key === "message") searchTokens.push(value);
      else searchTokens.push(p);
    }

    if (searchTokens.length > 0) {
      out.search = searchTokens.join(" ");
    }

    return out;
  }, []);

  const { data, isLoading, error } = getLogs<LogEntry[]>(filters);
  const results = data || [];

  const runQuery = (queryString = query) => {
    setFilters(parseQueryFilters(queryString));
  };

  useEffect(() => {
    const nextQuery = initialSearch ? `search:${initialSearch}` : "";
    setQuery(nextQuery);
    setFilters(parseQueryFilters(nextQuery));
  }, [initialSearch, parseQueryFilters]);

  const clearQuery = () => {
    setQuery("");
    runQuery("");
  };

  const stats = useMemo(() => {
    const total = results.length;
    const errors = results.filter(
      (r) => (r.level || r.type || "").toLowerCase() === "error",
    ).length;
    const warnings = results.filter((r) => {
      const t = (r.level || r.type || "").toLowerCase();
      return t === "warning" || t === "warn";
    }).length;
    return { total, errors, warnings };
  }, [results]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Queries</h1>
        <p className="text-sm text-muted-foreground">
          Search, filter, and analyze logs stored in your project.
        </p>
      </div>

      {/* Query Bar */}
      <div className="rounded-xl border border-white/5 p-3 bg-background/30">
        <div className="flex gap-3">
          <Input
            placeholder="Enter query (e.g. type:error AND appName:billing)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runQuery();
            }}
            className="rounded-xl flex-1 font-mono text-sm"
          />
          <Button onClick={() => runQuery()} className="rounded-xl">
            <Play className="h-4 w-4 mr-1" />
            Run Query
          </Button>
          <Button
            variant="ghost"
            onClick={clearQuery}
            className="rounded-xl hover:bg-white/5"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Search className="h-4 w-4 opacity-60 text-muted-foreground" />
          <div className="text-xs text-muted-foreground">Examples:</div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  runQuery(ex);
                }}
                className="text-xs rounded-full border border-white/10 px-2 py-0.5 text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
          <h3 className="text-sm font-medium">Query Results</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-teal-400" />}
            {stats.total} rows
          </span>
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
          }}
        >
          {error ? (
            <div className="flex items-center justify-center py-12 text-red-400">
              Failed to load logs: {error.message}
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running query against backend…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  No logs found matching your query filters.
                </>
              )}
            </div>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Environment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, idx) => {
                  const lvl = (r.level || r.type || "info").toLowerCase();
                  return (
                    <TableRow
                      key={`${r.ts ?? "t"}-${idx}`}
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setSelected(r)}
                    >
                      <TableCell className="text-white/60">
                        {r.ts ? new Date(r.ts).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell
                        className="font-medium uppercase"
                        style={{
                          color: levelColor[lvl] || "#60A5FA",
                        }}
                      >
                        {lvl}
                      </TableCell>
                      <TableCell className="text-white/80 font-semibold">
                        {r.appName || r.source || "—"}
                      </TableCell>
                      <TableCell className="text-white/90">
                        {r.message || "—"}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {r.environment || "production"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Drawer: Log Details */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="fixed right-0 top-0 h-full w-[420px] max-w-[90vw] border-l border-white/10 bg-background p-4 shadow-2xl"
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
                  navigator.clipboard.writeText(
                    JSON.stringify(selected, null, 2),
                  );
                  toast.success("Copied log JSON");
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
                    <span>{selected.ts ? new Date(selected.ts).toLocaleString() : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span
                      className="font-medium uppercase"
                      style={{
                        color:
                          levelColor[
                            (selected.level || selected.type || "info").toLowerCase()
                          ] ?? "inherit",
                      }}
                    >
                      {selected.level || selected.type || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App</span>
                    <span>{selected.appName || selected.source || "—"}</span>
                  </div>
                  {selected.environment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment</span>
                      <span>{selected.environment}</span>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground mb-1">Message</div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-xs text-white/90">
                      {selected.message || "—"}
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
        className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">Results</span>
          <span className="font-medium">{stats.total.toLocaleString()}</span>
          <span className="text-muted-foreground">Errors</span>
          <span className="font-medium text-red-400">{stats.errors.toLocaleString()}</span>
          <span className="text-muted-foreground">Warnings</span>
          <span className="font-medium text-yellow-400">{stats.warnings.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function QueriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading queries…
        </div>
      }
    >
      <QueriesContent />
    </Suspense>
  );
}
