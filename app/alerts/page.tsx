"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Bell, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AlertItem, api } from "@/lib/api";

const statusColors: Record<string, string> = {
  Active: "#00C2A8",
  Resolved: "#6B7280",
};

const severityColors: Record<string, string> = {
  High: "#F87171",
  Medium: "#FBBF24",
  Low: "#34D399",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selected, setSelected] = useState<AlertItem | null>(null);
  const [newAlertOpen, setNewAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [severity, setSeverity] = useState<"High" | "Medium" | "Low">("Medium");
  const [channel, setChannel] = useState<"Slack" | "Email" | "Webhook">("Email");
  const [period, setPeriod] = useState<"5m" | "15m" | "1h">("15m");

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data || []);
    } catch (err) {
      toast.error("Failed to load alerts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async () => {
    if (!name.trim()) {
      toast.error("Please enter an alert name");
      return;
    }
    if (!condition.trim()) {
      toast.error("Please enter a condition");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAlert({
        name: name.trim(),
        condition: condition.trim(),
        severity,
        channel,
        thresholdPeriod: period,
      });

      toast.success("Alert rule created successfully");
      setNewAlertOpen(false);
      setName("");
      setCondition("");
      await fetchAlerts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await api.deleteAlert(alertId);
      toast.success("Alert removed");
      setSelected(null);
      await fetchAlerts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete alert");
    }
  };

  const activeCount = alerts.filter((a) => a.status === "Active").length;
  const resolvedCount = alerts.filter((a) => a.status === "Resolved").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage active log-based alert rules.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setNewAlertOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Alert
        </Button>
      </div>

      {/* Alerts Table */}
      <div
        className="rounded-xl border"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading alert configurations…
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No alerts configured</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You haven&apos;t created any alerts yet. Set up alerts to get
              notified about critical events in your system.
            </p>
            <Button
              className="mt-4 rounded-xl"
              variant="outline"
              onClick={() => setNewAlertOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create First Alert
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead>Name</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer transition-colors hover:bg-white/5 border-white/5"
                    onClick={() => setSelected(a)}
                  >
                    <TableCell className="text-white/90 font-medium">
                      {a.name}
                    </TableCell>
                    <TableCell className="text-white/80 font-mono text-xs">
                      {a.condition}
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      style={{ color: severityColors[a.severity] || "#fff" }}
                    >
                      {a.severity}
                    </TableCell>
                    <TableCell className="text-white/70">{a.channel}</TableCell>
                    <TableCell
                      className="font-medium"
                      style={{ color: statusColors[a.status] || "#00C2A8" }}
                    >
                      {a.status}
                    </TableCell>
                    <TableCell className="text-white/60 text-xs">
                      {a.lastTriggered || "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAlert(a.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Alert Detail Drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelected(null)}
        >
          <div
            className="fixed right-0 top-0 h-full w-[400px] max-w-[90vw] border-l border-white/10 p-5 shadow-2xl"
            style={{ background: "#0E1117" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Alert Details</h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-red-400 border-red-500/20 hover:bg-red-500/10"
                onClick={() => handleDeleteAlert(selected.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-white">{selected.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-mono text-xs text-white">
                  {selected.condition}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Severity</span>
                <span
                  className="font-medium"
                  style={{
                    color: severityColors[selected.severity] || "#fff",
                  }}
                >
                  {selected.severity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span>{selected.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period</span>
                <span>{selected.thresholdPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  style={{
                    color: statusColors[selected.status] || "#00C2A8",
                  }}
                >
                  {selected.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Triggered</span>
                <span className="text-xs text-white/70">
                  {selected.lastTriggered || "Never"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Alert Modal */}
      <Dialog open={newAlertOpen} onOpenChange={setNewAlertOpen}>
        <DialogContent className="sm:max-w-120 border-white/10" style={{ background: "#0E1117" }}>
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogDescription>
              Configure an automated alert condition triggered by log events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Alert Name
              </div>
              <Input
                placeholder="e.g. Production Error Spike"
                className="rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Condition
              </div>
              <Input
                placeholder="e.g. error_rate > 5% or type:error > 10"
                className="rounded-xl font-mono text-sm"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Severity
                </div>
                <Select
                  value={severity}
                  onValueChange={(v) =>
                    setSeverity(v as "High" | "Medium" | "Low")
                  }
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Channel
                </div>
                <Select
                  value={channel}
                  onValueChange={(v) =>
                    setChannel(v as "Slack" | "Email" | "Webhook")
                  }
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Slack">Slack</SelectItem>
                    <SelectItem value="Webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Threshold
                </div>
                <Select
                  value={period}
                  onValueChange={(v) =>
                    setPeriod(v as "5m" | "15m" | "1h")
                  }
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5m">5 min</SelectItem>
                    <SelectItem value="15m">15 min</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() => setNewAlertOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl"
                onClick={handleCreateAlert}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Alert"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer status bar */}
      <div
        className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2 text-xs"
        style={{
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">Configured Alerts</span>
          <span className="font-medium">{alerts.length}</span>
          <span className="text-muted-foreground">Active</span>
          <span className="font-medium text-emerald-400">{activeCount}</span>
          <span className="text-muted-foreground">Resolved</span>
          <span className="font-medium text-muted-foreground">{resolvedCount}</span>
        </div>
      </div>
    </div>
  );
}
