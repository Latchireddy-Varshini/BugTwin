import React from 'react';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Layers,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Share2
} from 'lucide-react';
import { ImpactAnalysis, Incident } from '../types/incident';

interface ImpactAnalysisViewProps {
  impact?: ImpactAnalysis;
  incident: Incident;
}

export const ImpactAnalysisView: React.FC<ImpactAnalysisViewProps> = ({
  impact,
  incident
}) => {
  if (!impact) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
        Impact analysis is awaiting agent correlation...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
              Blast Radius: {impact.blastRadius}
            </span>
            <span className="text-xs text-slate-400">• Severity: <strong className="text-white">{incident.severity}</strong></span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">
            Downstream Impact & Customer Exposure
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time evaluation of user transactions, revenue risk, and cascading service degradation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Analyzed at:</span>
          <span className="text-xs font-mono text-slate-200">
            {new Date(impact.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Estimated Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Affected Customers</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            {impact.estimatedAffectedUsers.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Encountered 5xx errors or checkout drop-offs
          </p>
        </div>

        {/* Failed Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed Transactions</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            {impact.estimatedFailedTransactions.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Aborted order pipelines across checkout pods
          </p>
        </div>

        {/* Revenue At Risk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue at Risk</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            ${impact.estimatedRevenueAtRisk.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Cumulative GMV value of stalled checkout sessions
          </p>
        </div>
      </div>

      {/* Downstream Cascading Propagation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Downstream Microservice Cascade Chain
          </h3>
        </div>

        <div className="divide-y divide-slate-800 rounded-lg bg-slate-950/70 border border-slate-800 overflow-hidden text-xs">
          {impact.downstreamPropagation.map((down, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-300">{down.service}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      down.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : down.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {down.severity}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{down.impactType}</p>
              </div>

              <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] self-end sm:self-auto">
                <span>Cascade Step #{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impacted Endpoints */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Impacted REST & gRPC Endpoints
        </h3>
        <div className="flex flex-wrap gap-2">
          {impact.affectedEndpoints.map((ep) => (
            <span
              key={ep}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-rose-400 font-semibold"
            >
              {ep}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
