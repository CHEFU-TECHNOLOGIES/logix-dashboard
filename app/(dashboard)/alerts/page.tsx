'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { getApiUrl } from '@/lib/config';
import { toast } from 'sonner';

export default function AlertsPage() {
    const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [appName, setAppName] = useState<string>('');
    const [webhookUrl, setWebhookUrl] = useState<string>('');
    const [thresholdCount, setThresholdCount] = useState<number>(5);
    const [windowMinutes, setWindowMinutes] = useState<number>(5);
    const [cooldownPeriod, setCooldownPeriod] = useState<string>('5m');
    const [summary, setSummary] = useState<string>('');

    // Active Alerts Query
    const { data: alerts, isLoading } = useQuery({
        queryKey: ['alerts'],
        queryFn: async () => {
            const res = await fetch(getApiUrl('/logix/alerts'), {
                credentials: 'include',
            });
            return res.json();
        },
        enabled: !isAuthLoading && isAuthenticated,
    });

    // Create Alert Mutation
    const createAlert = useMutation({
        mutationFn: async () => {
            const payload = {
                name,
                appName,
                conditions: [
                    { field: 'type', operator: 'equals', value: 'error' },
                    { field: 'importance', operator: 'equals', value: 'critical' },
                ],
                thresholdCount,
                thresholdWindowMinutes: windowMinutes,
                webhookUrl,
                cooldownPeriod,
                summary: summary || `Trigger alert when ${appName} logs critical errors`,
            };

            const res = await fetch(getApiUrl('/logix/alerts'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create alert rule');
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success('Alert rule created successfully');
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            setIsOpen(false);
            setName('');
            setAppName('');
            setWebhookUrl('');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to create alert');
        },
    });

    return (
        <div className="p-6 bg-neutral-950 text-neutral-100 min-h-screen font-sans space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                    <h1 className="text-xl font-bold text-white">Alert Rules & Webhooks</h1>
                    <p className="text-xs text-neutral-400 mt-1">Configure automated real-time monitoring webhooks</p>
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                >
                    + New Alert Rule
                </button>
            </div>

            {/* Alerts Grid */}
            {isLoading ? (
                <div className="text-xs text-neutral-500 py-8 text-center font-mono">Loading active alert rules...</div>
            ) : !alerts || alerts.length === 0 ? (
                <div className="text-xs text-neutral-500 py-8 text-center font-mono">No active alerts configured.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alerts.map((alert: any) => (
                        <div key={alert.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-3 font-mono">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-white">{alert.name}</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    ACTIVE
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400">{alert.summary}</p>
                            <div className="text-[11px] text-neutral-500 space-y-1 border-t border-neutral-800/80 pt-2">
                                <div>App Name: <span className="text-neutral-300">{alert.appName}</span></div>
                                <div>Webhook: <span className="text-blue-400 truncate block">{alert.webhookUrl}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Create Alert */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <h2 className="text-lg font-bold text-white">Create New Alert Rule</h2>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-neutral-400 mb-1">Alert Rule Name</label>
                                <input
                                    type="text"
                                    placeholder="Critical Errors Webhook"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-1">App Name</label>
                                <input
                                    type="text"
                                    placeholder="logix-backend"
                                    value={appName}
                                    onChange={(e) => setAppName(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-1">Webhook Target URL</label>
                                <input
                                    type="text"
                                    placeholder="https://api.yourdomain.com/webhooks/alerts"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-400 mb-1">Threshold Count</label>
                                    <input
                                        type="number"
                                        value={thresholdCount}
                                        onChange={(e) => setThresholdCount(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-400 mb-1">Window Minutes</label>
                                    <input
                                        type="number"
                                        value={windowMinutes}
                                        onChange={(e) => setWindowMinutes(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-white rounded font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => createAlert.mutate()}
                                disabled={createAlert.isPending}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs text-white rounded font-semibold disabled:opacity-50"
                            >
                                {createAlert.isPending ? 'Saving Rule...' : 'Create Alert'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}