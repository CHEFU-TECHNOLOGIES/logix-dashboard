'use client';

import { useState } from 'react';
import { getLogs } from '@chefu-tech/logix-next';
import { format } from 'timeago.js';

export default function QueriesPage() {
    const [search, setSearch] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [appName, setAppName] = useState<string>('');
    const [environment, setEnvironment] = useState<string>('');

    const { data: logs, isLoading, refetch } = getLogs({
        search,
        type: level,
        appName,
        env: environment,
        limit: 100,
    });

    return (
        <div className="p-6 bg-neutral-950 text-neutral-100 min-h-screen font-mono space-y-6">
            <h1 className="text-xl font-bold text-white">Historical Log Queries</h1>

            {/* Query Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                <input
                    type="text"
                    placeholder="Filter by message text..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                />

                <input
                    type="text"
                    placeholder="App Name (e.g. web-api)"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                />

                <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                >
                    <option value="">All Log Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="debug">Debug</option>
                </select>

                <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                >
                    <option value="">All Environments</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                </select>

                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold transition-colors border border-neutral-700"
                >
                    Execute Query
                </button>
            </div>

            {/* Results Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-xs text-neutral-500">Executing ClickHouse query...</div>
                ) : !logs || logs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-500">No logs found matching search criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase">
                                <tr>
                                    <th className="p-3">Timestamp</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">App Name</th>
                                    <th className="p-3">Environment</th>
                                    <th className="p-3">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60">
                                {logs.map((log: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-neutral-800/40">
                                        <td className="p-3 whitespace-nowrap text-neutral-500">
                                            {format(log.timestamp * 1000)}
                                        </td>
                                        <td className="p-3 whitespace-nowrap uppercase font-semibold text-blue-400">
                                            {log.type || 'info'}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-neutral-300">
                                            {log.app_name || 'default'}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-neutral-400">
                                            {log.environment || 'production'}
                                        </td>
                                        <td className="p-3 text-neutral-100">{log.message}</td>
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