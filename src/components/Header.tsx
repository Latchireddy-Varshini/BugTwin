import React from 'react';
import {
  Activity,
  Play,
  Cloud,
  Layers,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Incident } from '../types/incident';

interface HeaderProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  incidents?: Incident[];
  selectedIncidentId?: string;
  setSelectedIncidentId?: (id: string) => void;
  selectedIncident?: Incident | null;
  isInvestigating: boolean;
  onRunInvestigation: () => void;
  onOpenReport: () => void;
  onOpenAgents?: () => void;
  onStartDemoMode?: () => void;
  onStartDemo?: () => void;
  isDemoActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  incidents = [],
  selectedIncidentId,
  setSelectedIncidentId,
  selectedIncident,
  isInvestigating,
  onRunInvestigation,
  onOpenReport,
  onOpenAgents,
  onStartDemoMode,
  onStartDemo,
  isDemoActive = false
}) => {
  const incidentList = incidents || [];
  const currentIncident =
    selectedIncident ||
    incidentList.find(i => i.id === selectedIncidentId) ||
    incidentList[0];

  const handleTabChange = onSelectTab || setActiveTab || (() => {});
  const handleDemoClick = onStartDemoMode || onStartDemo;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'digital-twin', label: 'Digital Twin' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'reproduction', label: 'Reproduction' },
    { id: 'root-cause', label: 'Root Cause' },
    { id: 'impact', label: 'Impact' },
    { id: 'fix-validation', label: 'Fix Validation' },
    { id: 'data-explorer', label: 'Data Explorer' },
    { id: 'architecture', label: 'Architecture' }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-xl tracking-wider">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">BUGTWIN</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                GCP Cloud Twin
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Powered Digital Twin for Bug Reproduction & Root-Cause Analysis
            </p>
          </div>
        </div>

        {/* Incident Selector & Global Actions */}
        <div className="flex items-center space-x-3">
          {/* Active Incident Dropdown */}
          {incidentList.length > 0 && setSelectedIncidentId && (
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400 font-medium">Incident:</span>
              <select
                value={selectedIncidentId || (currentIncident ? currentIncident.id : '')}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                {incidentList.map((inc) => (
                  <option key={inc.id} value={inc.id} className="bg-slate-900 text-slate-200">
                    [{inc.id}] {inc.title.substring(0, 32)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Agents Swarm Trigger */}
          {onOpenAgents && (
            <button
              onClick={onOpenAgents}
              title="View Multi-Agent Swarm Orchestrator"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Agents</span>
            </button>
          )}

          {/* Investigate AI Action */}
          <button
            onClick={onRunInvestigation}
            disabled={isInvestigating}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
              isInvestigating
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isInvestigating ? 'animate-spin' : 'text-indigo-200'}`} />
            <span>{isInvestigating ? 'AI Agents Working...' : 'Run Investigation'}</span>
          </button>

          {/* Hackathon Demo Mode Action Button */}
          <button
            onClick={handleDemoClick}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
              isDemoActive
                ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>{isDemoActive ? 'Demo Active' : 'Run BugTwin Demo'}</span>
          </button>

          {/* Post-Mortem Report Trigger */}
          <button
            onClick={onOpenReport}
            title="View Incident Post-Mortem Report"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="bg-slate-950/60 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {currentIncident && (
            <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-400 pl-4 py-1.5 whitespace-nowrap">
              <span className="flex items-center space-x-1">
                <Cloud className="w-3 h-3 text-blue-400" />
                <span>Region: <strong className="text-slate-300">asia-southeast1</strong></span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${currentIncident.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>Severity: <strong className="text-slate-200">{currentIncident.severity}</strong></span>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
