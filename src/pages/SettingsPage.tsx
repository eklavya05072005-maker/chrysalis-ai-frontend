import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { checkBackendHealth, API_BASE_URL, isDemoModeActive, setDemoModeActive } from '../services/api';
import type { HealthStatus } from '../types';
import {
  Settings,
  Activity,
  Database,
  Server,
  RefreshCw,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [demoMode, setDemoMode] = useState(isDemoModeActive());

  const testConnection = async () => {
    setChecking(true);
    const start = performance.now();
    try {
      const res = await checkBackendHealth();
      const diff = Math.round(performance.now() - start);
      setLatency(diff);
      setHealth(res);
      toast.success('Successfully connected to Chrysalis AI Backend!');
    } catch {
      setHealth(null);
      setLatency(null);
      toast.error('Backend offline at ' + API_BASE_URL);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const handleToggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    setDemoModeActive(next);
    toast.success(next ? 'Interactive Demo Mode enabled' : 'Live Backend Mode enabled');
  };

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Settings className="w-3.5 h-3.5" />
            System Administration
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">
            Settings & Backend Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Inspect live FastAPI connectivity, PostgreSQL database status, and environment variables.
          </p>
        </div>

        {/* Live Diagnostics Card */}
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">FastAPI Service Health</h3>
            </div>
            <button
              onClick={testConnection}
              disabled={checking}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking...' : 'Re-test Health'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400">API Status</span>
              <div className="flex items-center gap-2 mt-1">
                {health ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-emerald-800 capitalize">
                      {health.status}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm font-bold text-amber-700">Offline</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {health ? `Version ${health.version || '1.0.0'}` : 'FastAPI not responding'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400">PostgreSQL DB</span>
              <div className="flex items-center gap-2 mt-1">
                {health?.database?.status === 'connected' ? (
                  <>
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">Connected</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">Disconnected</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {health?.database?.message || 'chrysalis_db:5432'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ping Latency</span>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">
                  {latency !== null ? `${latency} ms` : '—'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">HTTP Round-trip</p>
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-900">
              Configured API Base URL (from VITE_API_BASE_URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={API_BASE_URL}
                className="input-field bg-slate-50 font-mono text-xs"
              />
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Swagger Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              To override, create a <code>.env.local</code> file with <code>VITE_API_BASE_URL=http://localhost:8000/api</code>.
            </p>
          </div>
        </div>

        {/* Demo Mode Configuration */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Presentation / Showcase Mode</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Explicitly toggle interactive demonstration data for presentation when offline.
              </p>
            </div>
            <button
              onClick={handleToggleDemoMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                demoMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {demoMode ? 'Demo Mode Active' : 'Live API Mode'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Note: Per hackathon rules, live API calls never silently switch to demo success. Failed live requests report real error statuses.
          </p>
        </div>

        {/* PowerShell Backend Startup Guide */}
        <div className="surface-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>PowerShell Backend Execution Reference</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-emerald-400 space-y-1 overflow-x-auto">
            <div className="text-slate-400"># Navigate to backend directory</div>
            <div>cd C:\Users\rohit\backend</div>
            <div className="text-slate-400 mt-2"># Activate virtual environment</div>
            <div>.\.venv\Scripts\Activate.ps1</div>
            <div className="text-slate-400 mt-2"># Run FastAPI server on port 8000</div>
            <div>uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
