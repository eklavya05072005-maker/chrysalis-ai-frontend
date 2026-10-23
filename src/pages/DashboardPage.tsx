import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { listProjects, DEMO_PROJECT } from '../services/api';
import type { Project } from '../types';
import {
  FolderGit2,
  Plus,
  Search,
  ArrowRight,
  RefreshCw,
  Clock,
  Database,
} from 'lucide-react';
import { BackendStatusBanner } from '../components/BackendStatusBanner';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../utils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([DEMO_PROJECT]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await listProjects(1, 50);
      if (data && data.items && data.items.length > 0) {
        setProjects(data.items);
        setIsLiveBackend(true);
      } else {
        // Fallback to sample projects
        setProjects([
          DEMO_PROJECT,
          {
            id: 'proj-002-fintech-ledger',
            name: 'FinTech Event-Driven Ledger Settlement System',
            description: 'Autonomous financial transaction reconciliation agent with anomaly detection.',
            status: 'simulated',
            error_message: null,
            created_at: '2026-10-23T11:20:00Z',
            updated_at: '2026-10-23T11:25:00Z',
          },
          {
            id: 'proj-003-medical-diag',
            name: 'HIPAA-Compliant Patient Intake & Triage Agent',
            description: 'Clinical documentation ingestion with strict policy validation and human gatekeeping.',
            status: 'architectures_ready',
            error_message: null,
            created_at: '2026-10-23T09:15:00Z',
            updated_at: '2026-10-23T09:18:00Z',
          },
        ]);
        setIsLiveBackend(false);
      }
    } catch {
      setProjects([
        DEMO_PROJECT,
        {
          id: 'proj-002-fintech-ledger',
          name: 'FinTech Event-Driven Ledger Settlement System',
          description: 'Autonomous financial transaction reconciliation agent with anomaly detection.',
          status: 'simulated',
          error_message: null,
          created_at: '2026-10-23T11:20:00Z',
          updated_at: '2026-10-23T11:25:00Z',
        },
        {
          id: 'proj-003-medical-diag',
          name: 'HIPAA-Compliant Patient Intake & Triage Agent',
          description: 'Clinical documentation ingestion with strict policy validation and human gatekeeping.',
          status: 'architectures_ready',
          error_message: null,
          created_at: '2026-10-23T09:15:00Z',
          updated_at: '2026-10-23T09:18:00Z',
        },
      ]);
      setIsLiveBackend(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Banner */}
        <BackendStatusBanner />

        {/* Header & New Project CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-slate-900">
              Agentic Transformation Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Software specifications converted into autonomous multi-agent systems and topologies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProjects}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
              title="Refresh project list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/app/projects/new"
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest New Specification</span>
            </Link>
          </div>
        </div>

        {/* Data Origin Clarification Pill */}
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Source Mode:{' '}
              <strong>{isLiveBackend ? 'Live PostgreSQL Database' : 'Interactive Demo Showcase Mode'}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {projects.length} Total Projects Loaded
          </span>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search specifications by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">Filter Status:</span>
            {['all', 'validated', 'simulated', 'architectures_ready', 'analyzed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors capitalize ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="surface-card-hover p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadgeClass(
                      project.status
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                  {project.id === DEMO_PROJECT.id && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
                      Sample
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-2">
                  {project.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {project.description || 'Autonomous agentic system generated by Chrysalis AI.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(project.created_at)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/app/projects/${project.id}/requirements`)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Open Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="surface-card p-12 text-center space-y-3">
            <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No specifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No software requirements match your current query. Try adjusting your filter or create a new project.
            </p>
            <Link to="/app/projects/new" className="btn-primary text-xs px-4 py-2 inline-flex">
              Ingest Specification
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
