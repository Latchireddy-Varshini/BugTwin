import React from 'react';
import {
  Cloud,
  Layers,
  Cpu,
  Database,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Activity,
  Code
} from 'lucide-react';

export const SystemArchitectureView: React.FC = () => {
  const gcpPipelineSteps = [
    {
      id: 'step-1',
      title: 'Telemetry Ingestion',
      service: 'Google Cloud Pub/Sub',
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      desc: 'High-throughput ingestion buffer receiving distributed microservice logs, traces, and metrics with zero message loss.'
    },
    {
      id: 'step-2',
      title: 'Serverless Orchestrator',
      service: 'Google Cloud Run',
      icon: <Server className="w-5 h-5 text-blue-400" />,
      desc: 'Containerized Node.js runtime executing the BugTwin engine, digital twin graph synthesizer, and simulator sandbox.'
    },
    {
      id: 'step-3',
      title: 'Telemetry Warehouse',
      service: 'Google BigQuery',
      icon: <Database className="w-5 h-5 text-indigo-400" />,
      desc: 'Petabyte-scale analytics warehouse for historical incident correlation, deployment regression tracking, and SQL queries.'
    },
    {
      id: 'step-4',
      title: 'State & Twin Store',
      service: 'Google Cloud Firestore',
      icon: <Layers className="w-5 h-5 text-teal-400" />,
      desc: 'Low-latency NoSQL database persisting active digital twins, reproduction scenario templates, and validation results.'
    },
    {
      id: 'step-5',
      title: 'Multi-Agent AI Reasoning',
      service: 'Google Gemini 3.8 Flash',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      desc: '6 Specialized agents collaborating via structured schemas for event correlation, state reconstruction, and root cause proof.'
    },
    {
      id: 'step-6',
      title: 'Deterministic Simulator',
      service: 'BugTwin Replay Sandbox',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      desc: 'Isolated execution harness reproducing the failure deterministically and validating remediation patches.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Cloud className="w-4 h-4" />
            <span>Google Cloud Platform Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">
            End-to-End Enterprise Cloud Integration
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Built specifically to leverage native Google Cloud telemetry, serverless compute, and Gemini intelligence.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          Project: <strong className="text-blue-400">bugtwin-hackathon-prod</strong>
        </div>
      </div>

      {/* Pipeline Flowchart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gcpPipelineSteps.map((step, idx) => (
          <div
            key={step.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                {step.icon}
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                0{idx + 1}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                {step.title}
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{step.service}</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Cloud Run Deployment Guide & Docker Snippet */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Deploy to Google Cloud Run (CLI Command)
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 space-y-2 overflow-x-auto">
          <div className="text-slate-500"># 1. Build container image using Cloud Build</div>
          <div>gcloud builds submit --tag gcr.io/bugtwin-hackathon-prod/bugtwin:latest .</div>
          <div className="text-slate-500 pt-2"># 2. Deploy to Cloud Run with Gemini API key from Secret Manager</div>
          <div>
            gcloud run deploy bugtwin-service \<br />
            &nbsp;&nbsp;--image gcr.io/bugtwin-hackathon-prod/bugtwin:latest \<br />
            &nbsp;&nbsp;--platform managed \<br />
            &nbsp;&nbsp;--region asia-southeast1 \<br />
            &nbsp;&nbsp;--allow-unauthenticated \<br />
            &nbsp;&nbsp;--set-secrets GEMINI_API_KEY=bugtwin-gemini-key:latest
          </div>
        </div>
      </div>
    </div>
  );
};
