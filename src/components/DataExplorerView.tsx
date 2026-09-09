import React, { useState } from 'react';
import {
  Search,
  Database,
  Terminal,
  Layers,
  GitCommit,
  Sliders,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { Incident, TelemetryEvent } from '../types/incident';

interface DataExplorerViewProps {
  incident: Incident;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({ incident }) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'TRACES' | 'DEPLOYMENTS' | 'BIGQUERY'>('LOGS');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvents = incident.events.filter((e) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      e.message.toLowerCase().includes(term) ||
      e.service.toLowerCase().includes(term) ||
      e.traceId.toLowerCase().includes(term);

    if (activeTab === 'LOGS') return matchesSearch;
    if (activeTab === 'TRACES') return matchesSearch && Boolean(e.spanId || e.endpoint);
    if (activeTab === 'DEPLOYMENTS') return matchesSearch && (e.eventType === 'DEPLOYMENT' || e.eventType === 'CONFIG_CHANGE');
    if (activeTab === 'BIGQUERY') return matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Telemetry & Data Explorer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Query ingested Google Cloud Logging, Cloud Trace, BigQuery tables, and deployment history
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search raw messages, traces, services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 w-72 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'LOGS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Cloud Logging ({incident.events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TRACES')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'TRACES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cloud Trace Spans</span>
        </button>

        <button
          onClick={() => setActiveTab('DEPLOYMENTS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'DEPLOYMENTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Deployment & Config Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('BIGQUERY')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'BIGQUERY'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>BigQuery Analytics View</span>
        </button>
      </div>

      {/* Content Feed */}
      {activeTab === 'BIGQUERY' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-blue-400 font-bold">
              SELECT * FROM `bugtwin_analytics.incidents` WHERE trace_id = '{incident.traceId}'
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Status: 200 OK (Processed 4.2 MB)</span>
          </div>
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
            {JSON.stringify(
              {
                incident_id: incident.id,
                title: incident.title,
                severity: incident.severity,
                service: incident.affectedService,
                trace_id: incident.traceId,
                request_id: incident.requestId,
                event_count: incident.events.length,
                initial_error: incident.initialError,
                ground_truth_root_cause: incident.groundTruth.rootCause,
                ingested_at: incident.timestamp,
                gcp_project: 'bugtwin-hackathon-prod'
              },
              null,
              2
            )}
          </pre>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-400">
                    {new Date(evt.timestamp).toISOString()}
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-300">{evt.service}</span>
                  <span className="font-mono text-[10px] text-slate-500">{evt.version}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {evt.eventType}
                  </span>
                  {evt.statusCode && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        evt.statusCode >= 500 ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      HTTP {evt.statusCode}
                    </span>
                  )}
                </div>

                <div className="text-slate-200 font-mono text-[11px] leading-relaxed">
                  {evt.message}
                </div>

                {evt.payload && (
                  <pre className="p-2 rounded bg-slate-950 text-blue-300 font-mono text-[10px] overflow-x-auto border border-slate-800">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                )}
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto text-slate-500">
                <span className="font-mono text-[10px]">{evt.id}</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(evt, null, 2), evt.id)}
                  className="p-1 hover:text-slate-200 rounded transition-colors"
                  title="Copy event JSON"
                >
                  {copiedId === evt.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
