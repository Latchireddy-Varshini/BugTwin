import React, { useState } from 'react';
import {
  Server,
  Database,
  Cloud,
  Layers,
  ArrowRight,
  AlertOctagon,
  CheckCircle2,
  GitCommit,
  Cpu,
  Activity,
  HardDrive
} from 'lucide-react';
import { DigitalTwinState, ServiceNode } from '../types/incident';

interface DigitalTwinGraphProps {
  digitalTwin?: DigitalTwinState;
  incidentTitle: string;
}

export const DigitalTwinGraph: React.FC<DigitalTwinGraphProps> = ({
  digitalTwin,
  incidentTitle
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    digitalTwin?.failureOriginId || 'inventory-service'
  );

  if (!digitalTwin || !digitalTwin.services || digitalTwin.services.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
        Digital Twin state is being constructed from telemetry...
      </div>
    );
  }

  const selectedNode = (digitalTwin.services || []).find(s => s.id === selectedNodeId) || digitalTwin.services[0];

  // Visual layout coordinates for nodes in our enterprise architecture
  const nodePositions: Record<string, { x: number; y: number }> = {
    'client-web': { x: 80, y: 180 },
    'api-gateway': { x: 260, y: 180 },
    'auth-service': { x: 260, y: 60 },
    'order-service': { x: 450, y: 180 },
    'inventory-service': { x: 650, y: 100 },
    'inventory-db': { x: 850, y: 100 },
    'payment-service': { x: 650, y: 260 },
    'stripe-gateway': { x: 850, y: 260 },
    'notification-service': { x: 450, y: 320 }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-base font-bold text-white tracking-tight">Interactive Digital Twin Topology</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            System state reconstructed at incident timestamp ({new Date(digitalTwin.reconstructedAt).toLocaleTimeString()})
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Root Failure</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Degraded/Downstream</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Healthy</span>
          </span>
        </div>
      </div>

      {/* Main Layout: SVG Topology Graph + Side Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Canvas */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[460px]">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* SVG Connectors */}
          <svg className="w-full h-[420px] overflow-visible select-none">
            <defs>
              <marker
                id="arrow-normal"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
              <marker
                id="arrow-failing"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Render Dependencies as Lines */}
            {digitalTwin.dependencies.map((dep, idx) => {
              const src = nodePositions[dep.source];
              const tgt = nodePositions[dep.target];
              if (!src || !tgt) return null;

              const isFailing = dep.status === 'FAILING';
              return (
                <g key={idx}>
                  <line
                    x1={src.x + 60}
                    y1={src.y + 25}
                    x2={tgt.x + 60}
                    y2={tgt.y + 25}
                    stroke={isFailing ? '#f43f5e' : '#334155'}
                    strokeWidth={isFailing ? 2.5 : 1.5}
                    strokeDasharray={isFailing ? '6 4' : 'none'}
                    markerEnd={isFailing ? 'url(#arrow-failing)' : 'url(#arrow-normal)'}
                    className={isFailing ? 'animate-pulse' : ''}
                  />
                  {/* Latency label on edge */}
                  <text
                    x={(src.x + tgt.x) / 2 + 55}
                    y={(src.y + tgt.y) / 2 + 15}
                    fill={isFailing ? '#f87171' : '#64748b'}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {dep.latencyMs}ms
                  </text>
                </g>
              );
            })}
          </svg>

          {/* HTML Overlay Nodes */}
          <div className="absolute inset-0 p-4 pointer-events-none">
            {digitalTwin.services.map((svc) => {
              const pos = nodePositions[svc.id] || { x: 100, y: 100 };
              const isSelected = svc.id === selectedNodeId;
              const isOrigin = svc.id === digitalTwin.failureOriginId;
              const isFailing = svc.status === 'FAILED';
              const isDegraded = svc.status === 'DEGRADED';

              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedNodeId(svc.id)}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: '130px'
                  }}
                  className={`pointer-events-auto cursor-pointer p-2.5 rounded-xl border transition-all transform hover:scale-105 select-none ${
                    isSelected
                      ? 'ring-2 ring-blue-400 bg-slate-900 border-blue-500 shadow-xl'
                      : 'bg-slate-900/95 border-slate-800 hover:border-slate-700'
                  } ${
                    isOrigin
                      ? 'border-rose-500 shadow-rose-500/20 shadow-lg'
                      : isDegraded
                      ? 'border-amber-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {svc.type === 'DATABASE' ? (
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Server className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isFailing
                          ? 'bg-rose-500 animate-ping'
                          : isDegraded
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>

                  <div className="font-bold text-slate-100 text-[11px] truncate leading-tight">
                    {svc.name.split(' ')[0]}
                  </div>
                  <div className="font-mono text-[9px] text-slate-400 truncate">
                    {svc.version}
                  </div>

                  {svc.recentDeployment && (
                    <div className="mt-1 flex items-center space-x-1 text-[9px] text-rose-400 font-semibold bg-rose-950/40 px-1 py-0.5 rounded border border-rose-900/40">
                      <GitCommit className="w-2.5 h-2.5" />
                      <span>Updated</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Node Inspector Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          {selectedNode ? (
            <>
              {/* Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-blue-400 font-bold">{selectedNode.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedNode.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : selectedNode.status === 'DEGRADED'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {selectedNode.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedNode.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">Version: {selectedNode.version}</div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span>Traffic RPS</span>
                  </span>
                  <div className="font-mono font-bold text-slate-200">{selectedNode.trafficRps} req/s</div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                    <AlertOctagon className="w-3 h-3 text-rose-400" />
                    <span>Error Rate</span>
                  </span>
                  <div className="font-mono font-bold text-rose-400">{selectedNode.errorRate}%</div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    <span>CPU Usage</span>
                  </span>
                  <div className="font-mono font-bold text-slate-200">{selectedNode.cpuUsage}%</div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                    <HardDrive className="w-3 h-3 text-teal-400" />
                    <span>Memory</span>
                  </span>
                  <div className="font-mono font-bold text-slate-200">{selectedNode.memoryUsage}%</div>
                </div>
              </div>

              {/* Recent Deployment Audit */}
              {selectedNode.recentDeployment && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Suspicious Deployment Detected</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {selectedNode.recentDeployment.diffSummary}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Commit: {selectedNode.recentDeployment.commitSha}</span>
                    <span>{selectedNode.recentDeployment.timestamp}</span>
                  </div>
                </div>
              )}

              {/* Active Configuration */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Active Environment Config
                </span>
                <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {JSON.stringify(selectedNode.activeConfig, null, 2)}
                </pre>
              </div>

              {/* Dependencies */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Dependencies ({selectedNode.dependencies.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.dependencies.length > 0 ? (
                    selectedNode.dependencies.map((dep) => (
                      <span
                        key={dep}
                        onClick={() => setSelectedNodeId(dep)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        {dep}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs">No downstream dependencies</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-xs text-center py-12">
              Click any node in the topology to inspect microservice telemetry and configuration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
