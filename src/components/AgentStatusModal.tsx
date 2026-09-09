import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  Bot,
  Terminal,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { AgentExecutionState } from '../types/incident';

interface AgentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentExecutionState[];
  isInvestigating: boolean;
  incidentId: string;
}

export const AgentStatusModal: React.FC<AgentStatusModalProps> = ({
  isOpen,
  onClose,
  agents,
  isInvestigating,
  incidentId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                Gemini Multi-Agent Autonomous Orchestrator
              </h3>
              <p className="text-[11px] text-slate-400">
                Incident {incidentId} • Model: <span className="font-mono text-indigo-300">gemini-3.8-flash</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map((agent) => (
              <div
                key={agent.agentId}
                className={`p-4 rounded-xl border transition-all ${
                  agent.status === 'RUNNING'
                    ? 'bg-blue-950/30 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                    : agent.status === 'COMPLETED'
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-xs text-white">{agent.agentName}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      agent.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : agent.status === 'RUNNING'
                        ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  {agent.outputSummary || 'Awaiting agent activation...'}
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>ID: {agent.agentId}</span>
                  <span>{agent.durationMs ? `${agent.durationMs}ms` : '0ms'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">How BugTwin Multi-Agent Orchestration Works:</div>
            <p className="leading-relaxed">
              BugTwin divides incident resolution across 6 decoupled specialists. Instead of relying on a single generic prompt, each agent adheres to strict typed JSON schemas to validate preconditions, calculate mathematical evidence scores, construct simulated replay payloads, and verify candidate fixes without hallucinations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
