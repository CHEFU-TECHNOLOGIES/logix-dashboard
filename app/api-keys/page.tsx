"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Plus, Lock, Key, Clipboard, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api, KeyRow } from "@/lib/api";

const statusColors: Record<KeyRow["status"], string> = {
  Active: "#00C2A8",
  Revoked: "#6B7280",
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [selected, setSelected] = useState<KeyRow | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newScope, setNewScope] = useState<KeyRow["scope"]>("Full Access");
  const [newExpiry, setNewExpiry] = useState<"Never" | "30 Days" | "90 Days">("Never");

  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const data = await api.getApiKeys();
      setKeys(data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const createKey = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    setIsCreating(true);
    try {
      const result = await api.createApiKey({
        name: newName.trim(),
        scope: newScope,
        expiresAt: newExpiry,
      });

      setGeneratedSecret(result.key);
      setRevealOpen(true);
      setGenerateOpen(false);
      setNewName("");
      setNewScope("Full Access");
      setNewExpiry("Never");

      await fetchKeys();
      toast.success("API key generated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    try {
      await api.revokeApiKey(keyId);
      toast.success("API key revoked");
      setSelected(null);
      await fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke API key");
    }
  };

  const copyGeneratedSecret = () => {
    if (!generatedSecret) return;
    navigator.clipboard.writeText(generatedSecret);
    setCopied(true);
    toast.success("API key secret copied to clipboard");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = useMemo(
    () => keys.filter((k) => k.status === "Active").length,
    [keys],
  );

  const limitReached = activeCount >= 5;

  const revokedCount = useMemo(
    () => keys.filter((k) => k.status === "Revoked").length,
    [keys],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage and secure your Logix project credentials.
          </p>
        </div>
        <span className="inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-xl"
                onClick={() => setGenerateOpen(true)}
                disabled={limitReached}
              >
                <Plus className="h-4 w-4 mr-1" />
                Generate New Key
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              {limitReached
                ? "Limit reached: 5 active keys per user"
                : "Create a new API key"}
            </TooltipContent>
          </Tooltip>
        </span>
      </div>

      {/* Security Info Card */}
      <div
        className="rounded-xl border border-white/5 p-6"
        style={{
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-teal-400">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium">API Key Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your API keys grant access to ingest logs and query data. Treat
              them like secrets — never commit them to public repositories. You
              will only see the secret once upon creation.
            </p>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        {keys.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-medium">Active & Revoked Credentials</h3>
            <span className="text-xs text-muted-foreground">
              {keys.length} keys
            </span>
          </div>
        )}

        {keys.length === 0 ? (
          isLoadingKeys ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading your API keys…
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Key className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">No API keys created yet.</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Generate an API key to start sending logs from your apps.
              </p>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setGenerateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Generate Key
              </Button>
            </div>
          )
        ) : (
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead>Name</TableHead>
                <TableHead>Key Identifier</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow
                  key={k.id}
                  className="cursor-pointer transition-colors hover:bg-white/5 border-white/5"
                  onClick={() => setSelected(k)}
                >
                  <TableCell className="text-white/90 font-medium">
                    {k.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-white/60">
                    {k.publicId ? `chf_${k.publicId}_...` : k.id}
                  </TableCell>
                  <TableCell className="text-white/80">{k.scope}</TableCell>
                  <TableCell className="text-white/70 text-xs">
                    {k.created}
                  </TableCell>
                  <TableCell className="text-white/70 text-xs">
                    {k.lastUsed}
                  </TableCell>
                  <TableCell
                    className="font-medium"
                    style={{ color: statusColors[k.status] }}
                  >
                    {k.status}
                  </TableCell>
                  <TableCell className="text-right">
                    {k.status !== "Revoked" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg hover:bg-red-500/10 hover:text-red-400 border-white/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          revokeKey(k.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Key Detail Drawer */}
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
              <h3 className="text-sm font-medium">API Key Details</h3>
              {selected.status !== "Revoked" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-red-400 border-red-500/20 hover:bg-red-500/10"
                  onClick={() => revokeKey(selected.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Revoke Key
                </Button>
              )}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="text-white font-medium">{selected.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Public ID</span>
                <span className="font-mono text-xs text-white">
                  {selected.publicId || selected.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scope</span>
                <span>{selected.scope}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{selected.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Used</span>
                <span>{selected.lastUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span style={{ color: statusColors[selected.status] }}>
                  {selected.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Key Modal */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent
          className="sm:max-w-120 border-white/10"
          style={{ background: "#0E1117" }}
        >
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key with scoped permissions. You will only see
              the key once.
            </DialogDescription>
          </DialogHeader>

          {limitReached && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              You have reached the limit of 5 active keys. Revoke one to create
              a new key.
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Key Name</div>
              <Input
                placeholder="e.g. Next.js Serverless Ingest"
                className="rounded-xl"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Scope</div>
                <Select
                  value={newScope}
                  onValueChange={(v) => setNewScope(v as KeyRow["scope"])}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Access">Full Access</SelectItem>
                    <SelectItem value="Read Only">Read Only</SelectItem>
                    <SelectItem value="Write Only">Write Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Expiry</div>
                <Select
                  value={newExpiry}
                  onValueChange={(v) => setNewExpiry(v as typeof newExpiry)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="30 Days">30 Days</SelectItem>
                    <SelectItem value="90 Days">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() => setGenerateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl"
                onClick={createKey}
                disabled={isCreating || limitReached}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Key"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* One-time Secret Reveal Dialog */}
      <Dialog
        open={revealOpen}
        onOpenChange={(open) => {
          setRevealOpen(open);
          if (!open) setGeneratedSecret(null);
        }}
      >
        <DialogContent
          className="sm:max-w-130 border-white/10"
          style={{ background: "#0E1117" }}
        >
          <DialogHeader>
            <DialogTitle>Your New API Key</DialogTitle>
            <DialogDescription>
              Copy this key now. For security purposes, you will not be able to
              view it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="rounded-xl border border-white/10 p-3 bg-black/40 font-mono text-sm">
              <div className="text-xs text-muted-foreground mb-1">Secret Key</div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex-1 min-w-0 break-all text-teal-300 font-semibold">
                  {generatedSecret ?? "—"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg shrink-0 border-white/10 hover:bg-white/10"
                  onClick={copyGeneratedSecret}
                  disabled={!generatedSecret}
                >
                  <Clipboard className="h-4 w-4 mr-1" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Pass this key in your SDK or HTTP requests in the{" "}
              <code className="text-white">x-api-key</code> header.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                className="rounded-xl"
                onClick={() => setRevealOpen(false)}
              >
                I have saved my key
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
          <span className="text-muted-foreground">Active Keys</span>
          <span className="font-medium text-emerald-400">{activeCount} / 5</span>
          <span className="text-muted-foreground">Revoked Keys</span>
          <span className="font-medium text-muted-foreground">{revokedCount}</span>
        </div>
      </div>
    </div>
  );
}
