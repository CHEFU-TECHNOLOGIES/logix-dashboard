'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { format } from 'timeago.js';

interface MetricsState {
  ingestRate: number;
  backlog: number;
  averageLatency: number;
}

export default function DashboardOverview() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [logsData, setLogsData] = useState<any[]>([]);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(true);

  const [metrics, setMetrics] = useState<MetricsState>({
    ingestRate: 0,
    backlog: 0,
    averageLatency: 0,
  });

  // 1. Fetch historical dashboard logs
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    async function fetchLogs() {
      try {
        setIsLoadingLogs(true);
        const res = await fetch('/api/logs/get-logs?range=24h');
        if (res.ok) {
          const json = await res.json();
          setLogsData(Array.isArray(json) ? json : json.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard logs:', err);
      } finally {
        setIsLoadingLogs(false);
      }
    }

    fetchLogs();
  }, [isAuthLoading, isAuthenticated]);

  // 2. Fetch alerts
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    async function fetchAlerts() {
      try {
        setIsLoadingAlerts(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/logix/alerts`, {
          credentials: 'include',
        });
        if (res.ok) {
          setAlertsData(await api.getAlerts());
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setIsLoadingAlerts(false);
      }
    }

    fetchAlerts();
  }, [isAuthLoading, isAuthenticated]);

  // 3. Connect to live SSE system metrics stream
  useEffect(() => {
    const es = new EventSource('/api/live-metrics');

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setMetrics({
          ingestRate: payload.ingestRate || 0,
          backlog: payload.backlog || 0,
          averageLatency: payload.averageLatency || 0,
        });
      } catch (err) {
        console.error('Error parsing metrics SSE:', err);
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  const recentAlerts = useMemo(() => {
    return [...alertsData]
      .sort((a, b) => {
        const dateA = new Date(a.lastTriggered || a.createdAt || 0).getTime();
        const dateB = new Date(b.lastTriggered || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [alertsData]);

  return (
    <div className="p-6 space-y-6 bg-neutral-950 text-neutral-100 min-h-screen font-sans">
      <h1 className="text-2xl font-bold tracking-tight">System Metrics & Health</h1>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
          <span className="text-xs text-neutral-400 block font-mono uppercase">Ingest Rate</span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {metrics.ingestRate} <span className="text-sm font-normal text-neutral-400">logs/sec</span>
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
          <span className="text-xs text-neutral-400 block font-mono uppercase">Avg Ingest Latency</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {metrics.averageLatency} <span className="text-sm font-normal text-neutral-400">ms</span>
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
          <span className="text-xs text-neutral-400 block font-mono uppercase">NATS Queue Backlog</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            {metrics.backlog} <span className="text-sm font-normal text-neutral-400">messages</span>
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
          <span className="text-xs text-neutral-400 block font-mono uppercase">Active Alerts</span>
          <span className="text-2xl font-bold text-blue-400 mt-1 block">
            {isLoadingAlerts ? '...' : alertsData.length}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Ingested Events Table */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono">
          <h2 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">Recent Ingest Events (24h)</h2>
          {isLoadingLogs ? (
            <div className="text-xs text-neutral-500 py-8 text-center">Loading system logs...</div>
          ) : logsData.length === 0 ? (
            <div className="text-xs text-neutral-500 py-8 text-center">No logs received in the last 24 hours.</div>
          ) : (
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {logsData.slice(0, 18).map((log: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-neutral-950/60 text-xs border border-neutral-800/60">
                  <span className="text-neutral-400 truncate max-w-[150px]">{log.app_name || 'default'}</span>
                  <span className="text-neutral-200 flex-1 px-3 truncate">{log.message}</span>
                  <span className="text-neutral-500 text-[11px] whitespace-nowrap">{format(log.timestamp * 1000)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Triggered Alerts Sidebar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono">
          <h2 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">Recent Alert Rules</h2>
          {isLoadingAlerts ? (
            <div className="text-xs text-neutral-500 py-8 text-center">Loading alerts...</div>
          ) : recentAlerts.length === 0 ? (
            <div className="text-xs text-neutral-500 py-8 text-center">No active alerts configured.</div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert: any) => (
                <div key={alert.id} className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{alert.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">{alert.summary}</p>
                  <span className="text-[10px] text-neutral-500 block">
                    Triggered: {alert.lastTriggered ? format(alert.lastTriggered) : 'Never'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}