"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  ArrowUpCircle,
  Trash2,
  Check,
  Download,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { api, BillingInfo, ProjectSettings } from "@/lib/api";

type Plan = "free" | "starter" | "pro" | "enterprise";

export default function SettingsPage() {
  const { user, profile, logout } = useAuth();

  const [project, setProject] = useState<ProjectSettings>({
    name: "Default Project",
    region: "US-East-1 (N. Virginia)",
    timezone: "EST (UTC-5)",
    plan: "free",
  });
  const [billing, setBilling] = useState<BillingInfo>({
    plan: "free",
    invoices: [],
    usage: {
      logsLimit: "10k logs/month",
      retentionDays: 7,
    },
  });

  const [projectName, setProjectName] = useState("Default Project");
  const [projectRegion, setProjectRegion] = useState("US-East-1 (N. Virginia)");
  const [projectTz, setProjectTz] = useState("EST (UTC-5)");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("free");

  const [isSavingProject, setIsSavingProject] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [projData, billData] = await Promise.all([
          api.getProjectSettings().catch(() => null),
          api.getBillingInfo().catch(() => null),
        ]);

        if (projData) {
          setProject(projData);
          setProjectName(projData.name || "Default Project");
          setProjectRegion(projData.region || "US-East-1 (N. Virginia)");
          setProjectTz(projData.timezone || "EST (UTC-5)");
          setSelectedPlan((projData.plan as Plan) || "free");
        }

        if (billData) {
          setBilling(billData);
        }
      } catch {}
    }

    loadSettings();
  }, []);

  const handleSaveProject = async () => {
    setIsSavingProject(true);
    try {
      const updated = await api.updateProjectSettings({
        name: projectName.trim(),
        region: projectRegion,
        timezone: projectTz,
      });
      setProject(updated);
      toast.success("Project settings saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project settings");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await api.deleteAccount();
      toast.success(res.message || "Account scheduled for deletion");
      setDeleteDialogOpen(false);
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request account deletion");
      setIsDeleting(false);
    }
  };

  const currentPlan = (project.plan as Plan) || "free";

  const planDetails: Record<
    Plan,
    {
      name: string;
      price: string;
      features: string[];
      logsLimit: string;
    }
  > = {
    free: {
      name: "Free",
      price: "$0",
      features: [
        "10k logs/month",
        "7-day retention",
        "Advanced search",
        "Email support",
        "API ACCESS",
      ],
      logsLimit: "10k logs/month",
    },
    starter: {
      name: "Starter",
      price: "$9.99",
      features: [
        "100k logs/month",
        "30-day retention",
        "Advanced search",
        "Priority support",
        "API ACCESS",
      ],
      logsLimit: "100k logs/month",
    },
    pro: {
      name: "Pro",
      price: "$19.99",
      features: [
        "1M logs/month",
        "90-day retention",
        "Real-time alerts",
        "24/7 support",
        "API ACCESS",
      ],
      logsLimit: "1M logs/month",
    },
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited logs",
        "Custom retention",
        "Dedicated support",
        "SLA guarantee",
        "Advanced security",
        "On-premise option",
      ],
      logsLimit: "Unlimited logs",
    },
  };

  const currentPlanDetails = planDetails[currentPlan] || planDetails.free;

  const TOKENS = {
    accent: "#00C2A8",
    border: "rgba(255,255,255,0.08)",
    radius: "12px",
    cardBg:
      "linear-gradient(180deg, rgba(16,20,27,0.92) 0%, rgba(16,20,27,0.78) 100%)",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage billing, project configuration, and account preferences.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="billing" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="bg-transparent border-none shadow-none p-0 h-auto rounded-none flex gap-2">
            <TabsTrigger
              value="billing"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              Billing & Plan
            </TabsTrigger>
            <TabsTrigger
              value="project"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              Project Settings
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              Account & Security
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent text-muted-foreground hover:text-white/90 data-[state=active]:text-white data-[state=active]:border-b-[#00C2A8]"
            >
              Danger Zone
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Billing & Plan */}
        <TabsContent value="billing">
          <div
            className="rounded-md border p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: TOKENS.radius,
            }}
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Billing & Plan</h3>
              <p className="text-sm text-muted-foreground">
                Manage your subscription and tier limits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Plan */}
                <div
                  className="rounded-md border p-5"
                  style={{
                    background: TOKENS.cardBg,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    Current Plan
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold capitalize">
                      {currentPlanDetails.name}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full border"
                      style={{
                        background: "rgba(0,194,168,0.12)",
                        borderColor: "rgba(0,194,168,0.35)",
                        color: TOKENS.accent,
                      }}
                    >
                      Active
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    {currentPlanDetails.features.slice(0, 4).map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-white/85">
                        <Check className="h-4 w-4" color={TOKENS.accent} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Change Plan */}
                <div
                  className="rounded-md border p-5"
                  style={{
                    background: TOKENS.cardBg,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    Tier Selection
                  </div>

                  <Select
                    value={selectedPlan}
                    onValueChange={(v) => setSelectedPlan(v as Plan)}
                  >
                    <SelectTrigger className="w-full rounded-md">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free ($0/mo)</SelectItem>
                      <SelectItem value="starter">Starter ($9.99/mo)</SelectItem>
                      <SelectItem value="pro">Pro ($19.99/mo)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Usage Allowance</div>
                      <div className="font-medium">{currentPlanDetails.logsLimit}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Billing Cycle</div>
                      <div className="font-medium">Monthly</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      className="rounded-md"
                      disabled={selectedPlan === currentPlan}
                      onClick={() =>
                        toast.info("Plan updates are managed via CheFu Billing Portal.")
                      }
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      {selectedPlan === currentPlan ? "Current Plan" : "Upgrade Plan"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Invoices */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Invoices</h4>
                  <span className="text-xs text-muted-foreground">
                    {billing.invoices.length} invoices
                  </span>
                </div>

                <div
                  className="mt-2 rounded-md border"
                  style={{
                    border: `1px solid ${TOKENS.border}`,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-xs text-white/60">Invoice ID</TableHead>
                        <TableHead className="text-xs text-white/60">Date</TableHead>
                        <TableHead className="text-xs text-white/60">Amount</TableHead>
                        <TableHead className="text-xs text-white/60">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billing.invoices.length > 0 ? (
                        billing.invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                            <TableCell>{inv.date}</TableCell>
                            <TableCell>{inv.amount}</TableCell>
                            <TableCell>{inv.status}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-20 text-center text-sm text-muted-foreground">
                            No invoices generated yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Project Settings */}
        <TabsContent value="project">
          <div
            className="rounded-md border p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: TOKENS.radius,
            }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium">Project Configuration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure default routing and regional settings for your Logix workspace.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Project Name</div>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="rounded-md"
                  />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Region</div>
                  <Select value={projectRegion} onValueChange={setProjectRegion}>
                    <SelectTrigger className="w-full rounded-md">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US-East-1 (N. Virginia)">US-East-1 (N. Virginia)</SelectItem>
                      <SelectItem value="EU-West-1 (Ireland)">EU-West-1 (Ireland)</SelectItem>
                      <SelectItem value="AF-South-1 (Cape Town)">AF-South-1 (Cape Town)</SelectItem>
                      <SelectItem value="AP-Southeast-1 (Singapore)">AP-Southeast-1 (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Timezone</div>
                  <Select value={projectTz} onValueChange={setProjectTz}>
                    <SelectTrigger className="w-full rounded-md">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST (UTC-5)">EST (UTC-5) — Eastern Time</SelectItem>
                      <SelectItem value="PST (UTC-8)">PST (UTC-8) — Pacific Time</SelectItem>
                      <SelectItem value="UTC (UTC+0)">UTC (UTC+0) — Coordinated Universal Time</SelectItem>
                      <SelectItem value="SAST (UTC+2)">SAST (UTC+2) — South Africa Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button
                    className="rounded-md"
                    onClick={handleSaveProject}
                    disabled={isSavingProject}
                  >
                    {isSavingProject ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Account & Security */}
        <TabsContent value="account">
          <div
            className="rounded-md border p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: TOKENS.radius,
            }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium">Account Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your authenticated developer account details.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">Display Name</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Your profile name</div>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {user?.displayName || user?.email?.split("@")[0] || "Developer"}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">Email Address</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Primary login email</div>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono">
                    {user?.email || "developer@logix.dev"}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white/90">User Identifier</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Unique platform UID</div>
                  </div>
                  <div className="text-sm font-mono text-white/70">
                    {user?.uid || "—"}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-white/90">Subscription Tier</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Assigned service plan</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white capitalize">
                      {currentPlan}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full border capitalize"
                      style={{
                        background: "rgba(0,194,168,0.12)",
                        borderColor: "rgba(0,194,168,0.35)",
                        color: TOKENS.accent,
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger">
          <div
            className="rounded-md border p-6"
            style={{
              border: "1px solid rgba(248,113,113,0.3)",
              background: "rgba(248,113,113,0.05)",
              borderRadius: "12px",
            }}
          >
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Request account deletion. In accordance with security holds, account access will be terminated immediately and data permanently purged after 14 days.
              </p>

              <div className="flex justify-end pt-2">
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="rounded-md">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-125 border-white/10" style={{ background: "#0E1117" }}>
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-full p-3"
                          style={{
                            background: "rgba(248,113,113,0.15)",
                            border: "1px solid rgba(248,113,113,0.3)",
                          }}
                        >
                          <AlertTriangle className="h-6 w-6 text-red-400" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">
                          Schedule Account Deletion
                        </DialogTitle>
                      </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4 text-sm text-muted-foreground">
                      <p>
                        This action will terminate your active sessions and schedule all logs, API keys, and configurations for permanent deletion.
                      </p>
                      <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                        A 14-day security grace period is applied before irreversible data purge.
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing…
                          </>
                        ) : (
                          "Confirm Account Deletion"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}