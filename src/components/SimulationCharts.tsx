import React from 'react';
import type { SimulationResult, ArchitectureOption } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { CheckCircle2, AlertTriangle, XCircle, Gauge, Info } from 'lucide-react';

interface SimulationChartsProps {
  simulations: SimulationResult[];
  architectures?: ArchitectureOption[];
}

export const SimulationCharts: React.FC<SimulationChartsProps> = ({ simulations }) => {
  const comparisonData = [
    {
      name: 'Option 1: Supervisor-Worker',
      latency: 480,
      throughput: 42.4,
      cost: 98,
      memory: 280,
    },
    {
      name: 'Option 2: Event Choreography',
      latency: 280,
      throughput: 78.5,
      cost: 145,
      memory: 390,
    },
    {
      name: 'Option 3: Fast ReAct',
      latency: 220,
      throughput: 31.0,
      cost: 45,
      memory: 140,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Notice Banner */}
      <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Simulated Scenario Execution:</span> The results below represent predictive architectural simulation and stress modeling across traffic bursts, external tool faults, and human-in-the-loop intercept gates.
        </div>
      </div>

      {/* Simulation Scenario Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {simulations.map((sim) => {
          const isPass = sim.result_status.toLowerCase() === 'pass';
          const isWarn = sim.result_status.toLowerCase() === 'warning';
          return (
            <div
              key={sim.id}
              className={`p-4 rounded-xl border bg-white shadow-sm transition-all ${
                isPass
                  ? 'border-emerald-200 hover:border-emerald-300'
                  : isWarn
                  ? 'border-amber-200 hover:border-amber-300'
                  : 'border-red-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Scenario
                </span>
                {isPass && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                  </span>
                )}
                {isWarn && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warning
                  </span>
                )}
                {!isPass && !isWarn && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-xs text-slate-900 mb-1 line-clamp-2">
                {sim.scenario_name}
              </h4>

              <div className="space-y-2 mt-3 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                  <span className="text-slate-400 block font-medium">Expected:</span>
                  <span className="text-slate-700">{sim.expected_outcome}</span>
                </div>
                <div className="p-2 rounded bg-emerald-50/50 border border-emerald-100 text-[11px]">
                  <span className="text-emerald-700 block font-medium">Simulated:</span>
                  <span className="text-slate-800 font-mono">{sim.simulated_outcome}</span>
                </div>
              </div>

              {sim.metrics && Object.keys(sim.metrics).length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  {sim.metrics.throughput_rps && (
                    <span>Throughput: {String(sim.metrics.throughput_rps)} rps</span>
                  )}
                  {sim.metrics.p95_latency_ms && (
                    <span>P95: {String(sim.metrics.p95_latency_ms)}ms</span>
                  )}
                  {sim.metrics.recovery_time_ms && (
                    <span>Recovery: {String(sim.metrics.recovery_time_ms)}ms</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparative Latency & Throughput Benchmark */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" />
              Comparative Architecture Performance Benchmark (Simulated)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Simulated throughput (req/s) vs. estimated P95 latency (ms) across evaluated topologies.
            </p>
          </div>
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-medium">
            Estimates only — not measured runtime
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#0F172A',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="latency" name="P95 Latency (ms) [Lower is better]" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="throughput" name="Throughput (req/s) [Higher is better]" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
