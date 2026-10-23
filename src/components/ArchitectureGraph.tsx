import React, { useState } from 'react';
import type { ArchitectureOption, ArchitectureComponent } from '../types';
import { Cpu, Users, ShieldCheck, Database, Wrench, ZoomIn, ZoomOut, RotateCcw, Layers, ArrowDown } from 'lucide-react';

interface ArchitectureGraphProps {
  architecture: ArchitectureOption;
  onSelectNode?: (component: ArchitectureComponent | null) => void;
}

export const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ architecture, onSelectNode }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<ArchitectureComponent | null>(null);

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'orchestrator':
      case 'supervisor':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'worker pool':
      case 'worker':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'gateway':
      case 'human gateway':
      case 'security gateway':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'memory store':
      case 'database':
      case 'redis / in-memory':
        return <Database className="w-4 h-4 text-amber-600" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleNodeClick = (comp: ArchitectureComponent) => {
    const next = selectedNode?.name === comp.name ? null : comp;
    setSelectedNode(next);
    onSelectNode?.(next);
  };

  return (
    <div className="relative w-full rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
      {/* Top Bar with Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800">Agentic Architecture Topology</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">
            {architecture.components.length} Nodes
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}
            className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
            className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative p-6 min-h-[340px] flex flex-col items-center justify-center overflow-auto bg-[#F8FAFC]">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 flex flex-col items-center gap-6 w-full max-w-xl py-2"
        >
          {/* Top Layer: Orchestrator / Supervisor */}
          <div className="flex justify-center w-full">
            {architecture.components
              .filter(
                (c) =>
                  c.type.toLowerCase().includes('orchestrator') ||
                  c.type.toLowerCase().includes('supervisor') ||
                  c.type.toLowerCase().includes('llm core')
              )
              .slice(0, 1)
              .map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNodeClick(comp)}
                  className={`cursor-pointer group relative p-3.5 rounded-xl border transition-all w-80 text-center shadow-sm ${
                    selectedNode?.name === comp.name
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 mb-1">
                    {comp.type}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1 mb-1">
                    {getIconForType(comp.type)}
                    <h4 className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {comp.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600">{comp.role}</p>
                </div>
              ))}
          </div>

          {/* Flow Connector Arrow */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center text-slate-400">
              <div className="w-0.5 h-6 bg-indigo-300" />
              <ArrowDown className="w-4 h-4 text-indigo-500 -mt-1" />
            </div>
          </div>

          {/* Middle Layer: Workers, Reactive Nodes, Tool Registry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {architecture.components
              .filter(
                (c) =>
                  c.type.toLowerCase().includes('worker') ||
                  c.type.toLowerCase().includes('reactive') ||
                  c.type.toLowerCase().includes('tool') ||
                  c.type.toLowerCase().includes('consumer')
              )
              .map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNodeClick(comp)}
                  className={`cursor-pointer group p-3 rounded-lg border transition-all shadow-sm ${
                    selectedNode?.name === comp.name
                      ? 'bg-white border-sky-600 ring-2 ring-sky-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {comp.type}
                    </span>
                    {getIconForType(comp.type)}
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 group-hover:text-sky-700 mb-1">
                    {comp.name}
                  </h4>
                  <p className="text-[11px] text-slate-600">{comp.role}</p>
                </div>
              ))}
          </div>

          {/* Bottom Layer: State, Memory, Guardrails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {architecture.components
              .filter(
                (c) =>
                  c.type.toLowerCase().includes('memory') ||
                  c.type.toLowerCase().includes('broker') ||
                  c.type.toLowerCase().includes('guardrail') ||
                  c.type.toLowerCase().includes('monitor') ||
                  c.type.toLowerCase().includes('gateway')
              )
              .map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => handleNodeClick(comp)}
                  className={`cursor-pointer group p-3 rounded-lg border transition-all shadow-sm ${
                    selectedNode?.name === comp.name
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {comp.type}
                    </span>
                    {getIconForType(comp.type)}
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700 mb-1">
                    {comp.name}
                  </h4>
                  <p className="text-[11px] text-slate-600">{comp.role}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 p-3 bg-white border border-slate-300 rounded-lg shadow-lg text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-900">{selectedNode.name}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="text-[11px] text-slate-600 mb-1.5">{selectedNode.role}</div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span>Type:</span>
              <span className="font-mono font-medium text-indigo-700 bg-indigo-50 px-1 rounded">
                {selectedNode.type}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Protocol Connections List */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
          Declared Agent Bus Connections:
        </div>
        <div className="flex flex-wrap gap-2">
          {architecture.connections.map((conn, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-[11px] text-slate-700 shadow-sm"
            >
              <span className="font-medium text-slate-900">{conn.from}</span>
              <span className="text-slate-400">→</span>
              <span className="font-medium text-slate-900">{conn.to}</span>
              <span className="text-[10px] text-indigo-700 font-mono bg-indigo-50 px-1 rounded border border-indigo-100">
                ({conn.protocol})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
