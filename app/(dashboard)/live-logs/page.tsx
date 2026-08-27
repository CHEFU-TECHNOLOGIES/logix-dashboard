'use client';

import { useState, useEffect, useRef } from 'react';
import { getStream, StreamLogNormalized, LogLevel } from '@chefu-tech/logix-next';
import { format } from 'timeago.js';

const levelColor: Record<LogLevel, string> = {
    info: 'text-blue-400 bg-blue-950/40 border-blue-800/50',
    warning: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
    error: 'text-red-400 bg-red-950/40 border-red-800/50',
    debug: 'text-purple-400 bg-purple-950/40 border-purple-800/50',
    success: 'text-green-400 bg-green-950/40 border-green-800/50',
    audit: 'text-teal-400 bg-teal-950/40 border-teal-800/50',
    metric: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50',
};

export default function LiveLogsPage() {
    const [filterLevel, setFilterLevel] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    const [selectedLog, setSelectedLog] = useState<StreamLogNormalized | null>(null);

    const logsContainerRef = useRef<HTMLDivElement>(null);

    const { data: logs, isLoading, connected, error } = getStream({
        type: filterLevel,
        search: search,
    });

    useEffect(() => {
        if (autoScroll && logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    return (
        <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 p-6 font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-white">Live Log Stream</h1>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${connected ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' : 'bg-red-950/60 text-red-400 border-red-800/60'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {connected ? 'LIVE' : 'DISCONNECTED'}
                    </span>
                </div>

                {error && (
                    <p className="text-xs text-red-400" role="alert">
                        {error.message}
                    </p>
                )}

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-600 text-neutral-200"
                    />

                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-600 text-neutral-200"
                    >
                        <option value="">All Levels</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="debug">Debug</option>
                    </select>

                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${autoScroll
                            ? 'bg-neutral-800 border-neutral-700 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                    >
                        Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
                    </button>
                </div>
            </div>

            <div
                ref={logsContainerRef}
                className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar bg-neutral-900/50 p-4 rounded-lg border border-neutral-800/80"
            >
                {isLoading && logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                        Connecting to live tail stream...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                        No live logs received matching current filters.
                    </div>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="flex items-start gap-3 p-2 rounded hover:bg-neutral-800/60 cursor-pointer text-xs transition-colors border border-transparent hover:border-neutral-700/50 font-mono"
                        >
                            <span className="text-neutral-500 whitespace-nowrap min-w-[140px]">
                                {format(log.ts)}
                            </span>

                            <span
                                className={`px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wider uppercase min-w-[65px] text-center ${levelColor[log.level] || levelColor.info
                                    }`}
                            >
                                {log.level}
                            </span>

                            <span className="text-neutral-400 min-w-[100px] truncate">
                                [{log.source}]
                            </span>

                            <span className="text-neutral-200 flex-1 truncate">
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {selectedLog && (
                <div className="fixed inset-y-0 right-0 w-1/3 bg-neutral-900 border-l border-neutral-800 p-6 overflow-y-auto shadow-2xl z-50">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
                        <h2 className="text-lg font-bold text-white">Log Details</h2>
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="text-neutral-400 hover:text-white text-sm"
                        >
                            ✕ Close
                        </button>
                    </div>

                    <div className="space-y-4 text-xs font-mono">
                        <div>
                            <span className="text-neutral-500 block mb-1">Timestamp</span>
                            <span className="text-neutral-200">{selectedLog.ts}</span>
                        </div>

                        <div>
                            <span className="text-neutral-500 block mb-1">Level</span>
                            <span className={`inline-block px-2 py-0.5 rounded border ${levelColor[selectedLog.level]}`}>
                                {selectedLog.level}
                            </span>
                        </div>

                        <div>
                            <span className="text-neutral-500 block mb-1">Message</span>
                            <p className="text-neutral-100 bg-neutral-950 p-3 rounded border border-neutral-800 whitespace-pre-wrap">
                                {selectedLog.message}
                            </p>
                        </div>

                        <div>
                            <span className="text-neutral-500 block mb-1">Raw Payload JSON</span>
                            <pre className="bg-neutral-950 p-3 rounded border border-neutral-800 text-neutral-300 overflow-x-auto">
                                {JSON.stringify(selectedLog.payload, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}