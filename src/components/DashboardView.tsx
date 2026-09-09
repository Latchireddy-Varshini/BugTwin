import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Server,
  ArrowUpRight,
  Sparkles,
  Play,
  ShieldAlert,
  GitCommit
} from 'lucide-react';
import { Incident } from '../types/incident';

interface DashboardViewProps {
  incidents: Incident[];
  onSelectIncident: (id: string, tab?: string) => void;
  onStartDemo: () => void;
  isInvestigating: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  onSelectIncident,
  onStartDemo,
  isInvestigating
}) => {
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH').length;
  const reproducedCount = incidents.filter(i => i.status === 'REPRODUCED' || Boolean(i.reproductionScenario)).length;
  const reproductionRate = Math.round((reproducedCount / Math.max(incidents.length, 1)) * 100);

  const topServices = [
    { name: 'inventory-service', incidents: 18, errorRate: '12.4%', status: 'REGRESSION_FLAGGED' },
    { name: 'payment-service', incidents: 12, errorRate: '8.1%', status: 'DEGRADED' },
    { name: 'order-service', incidents: 9, errorRate: '5.6%', status: 'MONITORED' },
    { name: 'api-gateway', incidents: 7, errorRate: '3.2%', status: 'HEALTHY' },
    { name: 'inventory-db', incidents: 4, errorRate: '2.0%', status: 'HEALTHY' }
  ];

  const recentDeployments = [
    { service: 'inventory-service', version: 'v2.4.1', deployedAt: '4m before incident', author: 'dev-alex', status: 'FLAGGED', risk: 'HIGH' },
    { service: 'order-service', version: 'v3.1.0', deployedAt: '2h ago', author: 'ci-pipeline', status: 'STABLE', risk: 'LOW' },
    { service: 'api-gateway', version: 'v1.12.0', deployedAt: '6h ago', author: 'infra-ops', status: 'STABLE', risk: 'LOW' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Card / Executive Statement */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Incident Digital Twin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Reconstruct production environments. Reproduce hard-to-debug bugs in seconds.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Traditional observability only explains <em>what failed</em>. <strong>BugTwin</strong> rebuilds the exact software world—service versions, database states, configs, and request sequences—and deterministically executes the failure to prove the root cause.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onStartDemo}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run BugTwin Guided Demo</span>
            </button>
            <button
              onClick={() => onSelectIncident('INC-101', 'digital-twin')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Server className="w-4 h-4 text-blue-400" />
              <span>Explore Digital Twin Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Incidents</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{incidents.length}</span>
            <span className="text-xs text-rose-400 font-medium">{criticalCount} Critical</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {highCount} high-priority production alerts in scope
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reproduction Success</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{reproductionRate}%</span>
            <span className="text-xs text-emerald-400 font-medium">Deterministic</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Proved via simulated container replays
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Investigation Time</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">14.8s</span>
            <span className="text-xs text-indigo-400 font-medium">vs 4.2h manual</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            6 Specialized Gemini AI agents in parallel
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Root Cause Confidence</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">94.0%</span>
            <span className="text-xs text-amber-400 font-medium">Evidence-Backed</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Mathematical telemetry scoring & diff proof
          </p>
        </div>
      </div>

      {/* Two Column Layout: Active Incidents vs Services & Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incidents Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Incident Queue</h2>
              <p className="text-xs text-slate-400">Production incidents analyzed by BugTwin digital twin engine</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">
              {incidents.length} Scenarios Loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">ID & Title</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Affected Service</th>
                  <th className="py-2.5 px-3">Initial Error</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id, 'reproduction')}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {inc.id}
                      </div>
                      <div className="text-slate-400 line-clamp-1 max-w-xs">{inc.title}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-indigo-300">
                      {inc.affectedService}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-400 font-mono text-[11px]">
                      {inc.initialError}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc.id, 'reproduction');
                        }}
                        className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        <span>Replay</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Top Services & Recent Deployments */}
        <div className="space-y-6">
          {/* Top Affected Services */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">Top Affected Services</h2>
              <span className="text-[11px] text-slate-400">Last 24h</span>
            </div>
            <div className="space-y-3">
              {topServices.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        svc.status === 'REGRESSION_FLAGGED'
                          ? 'bg-rose-500 animate-pulse'
                          : svc.status === 'DEGRADED'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="font-mono text-slate-200">{svc.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span>{svc.incidents} alerts</span>
                    <span className="font-mono text-rose-400 font-semibold">{svc.errorRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Deployments & Commits */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">Recent Deployments</h2>
              <GitCommit className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {recentDeployments.map((dep) => (
                <div key={dep.service} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 font-mono">{dep.service}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        dep.risk === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {dep.version}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>by {dep.author}</span>
                    <span>{dep.deployedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
