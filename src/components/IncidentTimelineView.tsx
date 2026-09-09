import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  GitCommit,
  Sliders,
  Database,
  ArrowDownRight,
  User,
  ChevronDown,
  ChevronRight,
  Filter
} from 'lucide-react';
import { TelemetryEvent } from '../types/incident';

interface IncidentTimelineViewProps {
  events: TelemetryEvent[];
  incidentTitle: string;
  traceId: string;
}

export const IncidentTimelineView: React.FC<IncidentTimelineViewProps> = ({
  events,
  incidentTitle,
  traceId
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = events.filter(e => filterType === 'ALL' || e.eventType === filterType);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'USER_ACTION':
        return <User className="w-3.5 h-3.5 text-sky-400" />;
      case 'DEPLOYMENT':
        return <GitCommit className="w-3.5 h-3.5 text-rose-400" />;
      case 'CONFIG_CHANGE':
        return <Sliders className="w-3.5 h-3.5 text-amber-400" />;
      case 'DB_QUERY':
        return <Database className="w-3.5 h-3.5 text-indigo-400" />;
      case 'ERROR':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getEventBadge = (evt: TelemetryEvent) => {
    if (evt.eventType === 'ERROR' || (evt.statusCode && evt.statusCode >= 500)) {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
    if (evt.eventType === 'DEPLOYMENT') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
    if (evt.eventType === 'CONFIG_CHANGE') {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Correlated Incident Timeline</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed traces, microservice logs, deployments, and database queries aligned chronologically
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="DEPLOYMENT">Deployments Only</option>
            <option value="CONFIG_CHANGE">Config Changes Only</option>
            <option value="ERROR">Errors & Failures Only</option>
            <option value="API_REQUEST">API Invocations</option>
            <option value="DB_QUERY">Database Queries</option>
          </select>
        </div>
      </div>

      {/* Chronological Stepper */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {filteredEvents.map((evt, idx) => {
          const isExpanded = expandedEventId === evt.id;
          const isError = evt.eventType === 'ERROR' || (evt.statusCode && evt.statusCode >= 500);

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Pin */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  isError
                    ? 'bg-rose-950 border-rose-500 text-rose-400 shadow-md shadow-rose-500/30 ring-4 ring-rose-500/10'
                    : evt.eventType === 'DEPLOYMENT'
                    ? 'bg-purple-950 border-purple-500 text-purple-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {getEventIcon(evt.eventType)}
              </div>

              {/* Event Card */}
              <div
                onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                className={`bg-slate-900 border rounded-xl p-4 transition-all cursor-pointer ${
                  isError
                    ? 'border-rose-500/50 bg-rose-950/10 hover:bg-rose-950/20 shadow-lg shadow-rose-950/20'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {evt.service}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {evt.version}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadge(evt)}`}>
                      {evt.eventType}
                    </span>
                    {evt.statusCode && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          evt.statusCode >= 500
                            ? 'bg-rose-500 text-white'
                            : evt.statusCode >= 400
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {evt.statusCode}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400 text-xs self-end sm:self-auto">
                    {evt.latencyMs && (
                      <span className="font-mono text-[11px] text-slate-400">{evt.latencyMs}ms</span>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                {/* Main Message */}
                <p className={`mt-2 text-xs leading-relaxed ${isError ? 'text-rose-200 font-medium' : 'text-slate-200'}`}>
                  {evt.message}
                </p>

                {/* Expanded Payload & Metadata */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 text-xs">
                    {evt.endpoint && (
                      <div className="flex items-center space-x-2 font-mono text-[11px]">
                        <span className="text-slate-400">Endpoint:</span>
                        <span className="text-blue-300">{evt.endpoint}</span>
                      </div>
                    )}

                    {evt.payload && (
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Payload:</span>
                        <pre className="mt-1 p-2.5 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                          {JSON.stringify(evt.payload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {evt.metadata && (
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Metadata / Stacktrace:</span>
                        <pre className="mt-1 p-2.5 rounded bg-slate-950 text-rose-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                          {JSON.stringify(evt.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
