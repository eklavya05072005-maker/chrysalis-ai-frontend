import React from 'react';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckSquare,
  Scale,
  Cpu,
  Activity,
  Code2,
  ShieldCheck,
  Play,
} from 'lucide-react';

interface PipelineProps {
  currentStatus: string;
  onNavigateStage?: (stageKey: string) => void;
}

interface Stage {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeStatuses: string[];
  doneStatuses: string[];
}

export const AgentWorkflowPipeline: React.FC<PipelineProps> = ({ currentStatus, onNavigateStage }) => {
  const stages: Stage[] = [
    {
      key: 'requirements',
      label: '1. Analysis',
      description: 'Requirements & citations',
      icon: <FileText className="w-3.5 h-3.5" />,
      activeStatuses: ['uploaded', 'analyzing'],
      doneStatuses: ['analyzed', 'clarifying', 'clarified', 'spec_confirmed', 'architectures_ready', 'simulated', 'architecture_selected', 'generating', 'generated', 'validating', 'validated'],
    },
    {
      key: 'clarifications',
      label: '2. Wizard',
      description: 'Adaptive clarification',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      activeStatuses: ['clarifying'],
      doneStatuses: ['clarified', 'spec_confirmed', 'architectures_ready', 'simulated', 'architecture_selected', 'generating', 'generated', 'validating', 'validated'],
    },
    {
      key: 'specification',
      label: '3. Confirmed Spec',
      description: 'Review & user lock',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      activeStatuses: ['spec_confirmed'],
      doneStatuses: ['architectures_ready', 'simulated', 'architecture_selected', 'generating', 'generated', 'validating', 'validated'],
    },
    {
      key: 'verdict',
      label: '4. System Verdict',
      description: 'Non-agentic / Agentic / Hybrid',
      icon: <Scale className="w-3.5 h-3.5" />,
      activeStatuses: ['architectures_ready'],
      doneStatuses: ['simulated', 'architecture_selected', 'generating', 'generated', 'validating', 'validated'],
    },
    {
      key: 'architectures',
      label: '5. Architectures',
      description: 'Synthesize & select',
      icon: <Cpu className="w-3.5 h-3.5" />,
      activeStatuses: ['architecture_selected'],
      doneStatuses: ['simulated', 'generating', 'generated', 'validating', 'validated'],
    },
    {
      key: 'simulations',
      label: '6. Simulation',
      description: 'Predictive stress tests',
      icon: <Activity className="w-3.5 h-3.5" />,
      activeStatuses: ['simulating', 'simulated'],
      doneStatuses: ['generating', 'generated', 'validating', 'validated'],
    },
    {
      key: 'generation',
      label: '7. Code Gen',
      description: 'Multi-agent Python repo',
      icon: <Code2 className="w-3.5 h-3.5" />,
      activeStatuses: ['generating', 'generated'],
      doneStatuses: ['validating', 'validated'],
    },
    {
      key: 'validation',
      label: '8. AST Validation',
      description: 'Syntax & safety audit',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      activeStatuses: ['validating'],
      doneStatuses: ['validated'],
    },
    {
      key: 'demo',
      label: '9. Export & Run',
      description: 'ZIP bundle export',
      icon: <Play className="w-3.5 h-3.5" />,
      activeStatuses: ['validated'],
      doneStatuses: ['validated'],
    },
  ];

  const getStageState = (stage: Stage) => {
    if (stage.doneStatuses.includes(currentStatus)) {
      return 'completed';
    }
    if (stage.activeStatuses.includes(currentStatus)) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            Agentic Pipeline Lifecycle
          </h3>
        </div>
        <div className="text-xs text-slate-500">
          Status: <span className="font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{currentStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {stages.map((stage) => {
          const state = getStageState(stage);
          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => onNavigateStage?.(stage.key)}
              className={`p-2 rounded-lg border text-left transition-all duration-150 ${
                state === 'completed'
                  ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                  : state === 'active'
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50/60 border-slate-200 opacity-70 hover:opacity-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className={`p-1 rounded ${
                    state === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : state === 'active'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {stage.icon}
                </div>
                {state === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {state === 'active' && <PlayCircle className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />}
                {state === 'pending' && <Clock className="w-3.5 h-3.5 text-slate-400" />}
              </div>
              <div className="text-[11px] font-semibold text-slate-800 truncate">{stage.label}</div>
              <div className="text-[9px] text-slate-500 truncate">{stage.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
