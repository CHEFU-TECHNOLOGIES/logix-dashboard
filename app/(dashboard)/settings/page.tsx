'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function SettingsBillingPage() {
    const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

    // Fetch Current Active Plan
    const { data: planData, isLoading: isLoadingPlan } = useQuery({
        queryKey: ['current-plan'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/billing/current`, {
                credentials: 'include',
            });
            return res.json();
        },
        enabled: !isAuthLoading && isAuthenticated,
    });

    // Fetch Payment Invoices
    const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/billing/invoices`, {
                credentials: 'include',
            });
            return res.json();
        },
        enabled: !isAuthLoading && isAuthenticated,
    });

    // Mutation: Create Checkout Session
    const createBillingSession = useMutation({
        mutationFn: async (selectedPlan: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/billing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ plan: selectedPlan }),
            });
            if (!res.ok) throw new Error('Failed to create checkout session');
            return res.json();
        },
        onSuccess: (data) => {
            if (data.url) window.location.href = data.url;
        },
        onError: (err: any) => {
            toast.error(err.message || 'Payment initiation failed');
        },
    });

    // Mutation: Open Stripe Billing Portal
    const createPortalSession = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/billing/portal`, {
                method: 'POST',
                credentials: 'include',
            });
            return res.json();
        },
        onSuccess: (data) => {
            if (data.url) window.location.href = data.url;
        },
    });

    return (
        <div className="p-6 bg-neutral-950 text-neutral-100 min-h-screen font-sans space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Billing & Subscription</h1>
                    <p className="text-xs text-neutral-400 mt-1">
                        Current Plan:{' '}
                        <span className="font-semibold text-emerald-400 uppercase">
                            {isLoadingPlan ? '...' : planData?.plan || 'Free'}
                        </span>
                    </p>
                </div>

                {planData?.plan && planData.plan !== 'free' && (
                    <button
                        onClick={() => createPortalSession.mutate()}
                        className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-white rounded font-medium"
                    >
                        {createPortalSession.isPending ? 'Opening Stripe...' : 'Manage Stripe Billing'}
                    </button>
                )}
            </div>

            {/* Subscription Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Free Plan */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-4">
                    <h2 className="text-lg font-bold">Free</h2>
                    <p className="text-2xl font-bold">$0 <span className="text-xs font-normal text-neutral-400">/mo</span></p>
                    <ul className="text-xs text-neutral-400 space-y-2 font-mono">
                        <li>✓ 10,000 logs/mo</li>
                        <li>✓ 7-day retention</li>
                        <li>✕ No active alerts</li>
                    </ul>
                    <button disabled className="w-full py-2 bg-neutral-950 text-neutral-500 rounded text-xs font-semibold border border-neutral-800">
                        {planData?.plan === 'free' || !planData?.plan ? 'Current Plan' : 'Included'}
                    </button>
                </div>

                {/* Starter Plan */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-4">
                    <h2 className="text-lg font-bold">Starter</h2>
                    <p className="text-2xl font-bold">$9.99 <span className="text-xs font-normal text-neutral-400">/mo</span></p>
                    <ul className="text-xs text-neutral-400 space-y-2 font-mono">
                        <li>✓ 100,000 logs/mo</li>
                        <li>✓ 30-day retention</li>
                        <li>✓ 5 Active Alerts</li>
                    </ul>
                    <button
                        onClick={() => createBillingSession.mutate('starter')}
                        disabled={planData?.plan === 'starter'}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold disabled:bg-neutral-950 disabled:text-neutral-500 border disabled:border-neutral-800"
                    >
                        {planData?.plan === 'starter' ? 'Current Plan' : 'Choose Starter'}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-neutral-900 border border-blue-600/60 p-5 rounded-lg space-y-4 relative">
                    <span className="absolute -top-3 right-4 bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Popular</span>
                    <h2 className="text-lg font-bold">Pro</h2>
                    <p className="text-2xl font-bold">$24.99 <span className="text-xs font-normal text-neutral-400">/mo</span></p>
                    <ul className="text-xs text-neutral-400 space-y-2 font-mono">
                        <li>✓ 500,000 logs/mo</li>
                        <li>✓ 60-day retention</li>
                        <li>✓ 12 Active Alerts</li>
                    </ul>
                    <button
                        onClick={() => createBillingSession.mutate('pro')}
                        disabled={planData?.plan === 'pro'}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold disabled:bg-neutral-950 disabled:text-neutral-500 border disabled:border-neutral-800"
                    >
                        {planData?.plan === 'pro' ? 'Current Plan' : 'Choose Pro'}
                    </button>
                </div>

                {/* Business Plan */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-4">
                    <h2 className="text-lg font-bold">Business</h2>
                    <p className="text-2xl font-bold">$49.99 <span className="text-xs font-normal text-neutral-400">/mo</span></p>
                    <ul className="text-xs text-neutral-400 space-y-2 font-mono">
                        <li>✓ 1,000,000 logs/mo</li>
                        <li>✓ 90-day retention</li>
                        <li>✓ 20 Active Alerts</li>
                    </ul>
                    <button
                        onClick={() => createBillingSession.mutate('business')}
                        disabled={planData?.plan === 'business'}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold disabled:bg-neutral-950 disabled:text-neutral-500 border disabled:border-neutral-800"
                    >
                        {planData?.plan === 'business' ? 'Current Plan' : 'Choose Business'}
                    </button>
                </div>
            </div>

            {/* Invoice History Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Invoice History</h2>
                {isLoadingInvoices ? (
                    <div className="text-xs text-neutral-500 py-4">Loading billing invoices...</div>
                ) : !invoicesData || invoicesData.length === 0 ? (
                    <div className="text-xs text-neutral-500 py-4">No billing invoices found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase">
                                <tr>
                                    <th className="p-3">Invoice ID</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {invoicesData.map((inv: any) => (
                                    <tr key={inv.id}>
                                        <td className="p-3 text-neutral-300">{inv.stripe_invoice_id?.slice(0, 8)}...</td>
                                        <td className="p-3 text-neutral-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="p-3 text-neutral-200">${(inv.amount_paid / 100).toFixed(2)}</td>
                                        <td className="p-3 text-emerald-400 uppercase">{inv.status}</td>
                                        <td className="p-3">
                                            {inv.invoice_pdf || inv.hosted_invoice_url ? (
                                                <a
                                                    href={inv.invoice_pdf || inv.hosted_invoice_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    Download PDF
                                                </a>
                                            ) : (
                                                <span className="text-neutral-600">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}