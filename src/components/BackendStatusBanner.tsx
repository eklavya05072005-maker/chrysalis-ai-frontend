import React, { useState, useEffect } from 'react';
import { checkBackendHealth, API_BASE_URL } from '../services/api';
import { Activity, CheckCircle2, RefreshCw, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface BackendStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
  compact?: boolean;
}

export const BackendStatusBanner: React.FC<BackendStatusProps> = ({ onStatusChange, compact = false }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const verifyHealth = async () => {
    setStatus('checking');
    const start = performance.now();
    try {
      const res = await checkBackendHealth();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      if (res && (res.status === 'healthy' || res.database)) {
        setStatus('online');
        onStatusChange?.(true);
      } else {
        setStatus('offline');
        onStatusChange?.(false);
      }
    } catch {
      setStatus('offline');
      onStatusChange?.(false);
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 shadow-sm">
        {status === 'checking' && (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span className="text-slate-500">Checking API...</span>
          </>
        )}
        {status === 'online' && (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-semibold">Live Backend</span>
            {latency && <span className="text-slate-400 text-[10px]">({latency}ms)</span>}
          </>
        )}
        {status === 'offline' && (
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 transition-colors"
            title="Backend offline. Click for startup instructions."
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-medium">Backend Offline</span>
            <span className="text-[10px] text-slate-500 underline">(Guide)</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`px-4 py-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm ${
          status === 'online'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
            : status === 'checking'
            ? 'bg-blue-50/70 border-blue-200 text-blue-800'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Activity
            className={`w-4 h-4 ${
              status === 'online'
                ? 'text-emerald-600'
                : status === 'checking'
                ? 'text-blue-600 animate-spin'
                : 'text-amber-600'
            }`}
          />
          <span>
            <strong>API Base:</strong> <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-800">{API_BASE_URL}</code>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            <strong>Status:</strong>{' '}
            {status === 'online' && (
              <span className="text-emerald-700 font-medium">
                Connected & PostgreSQL Active ({latency}ms)
              </span>
            )}
            {status === 'checking' && <span className="text-blue-700">Connecting to API server...</span>}
            {status === 'offline' && (
              <span className="text-amber-800 font-medium">
                Offline (Live API unreachable. Offline Showcase Mode available)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === 'offline' && (
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 text-[11px] font-medium transition-colors"
            >
              <Terminal className="w-3 h-3 text-amber-700" />
              <span>Backend Startup Command</span>
              {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={verifyHealth}
            className="p-1.5 rounded hover:bg-white/80 text-slate-600 hover:text-slate-900 transition-colors"
            title="Refresh connection status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showGuide && status === 'offline' && (
        <div className="mt-2 p-3.5 bg-white border border-amber-200 rounded-lg text-xs space-y-2 text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            To start your real Chrysalis AI backend in PowerShell:
          </p>
          <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-emerald-400 overflow-x-auto space-y-1">
            <div>cd C:\Users\rohit\backend</div>
            <div>.\.venv\Scripts\Activate.ps1</div>
            <div>uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000</div>
          </div>
          <p className="text-[11px] text-slate-500">
            Note: The frontend is currently operating in <strong>Interactive Demo Mode</strong> with verified sample data, allowing you to review requirements, clarification wizard, specification confirmation, system verdicts, architecture comparison, simulation results, code generation, and AST validation.
          </p>
        </div>
      )}
    </div>
  );
};
