import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FilePlus2,
  FileText,
  HelpCircle,
  CheckSquare,
  Scale,
  Cpu,
  Activity,
  Code2,
  ShieldCheck,
  PlayCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { DEMO_PROJECT } from '../services/api';

interface SidebarProps {
  activeProjectId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeProjectId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const projectId = activeProjectId || DEMO_PROJECT.id;

  const mainLinks = [
    { to: '/app', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/app/projects', label: 'All Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { to: '/app/projects/new', label: 'Ingest Specification', icon: <FilePlus2 className="w-4 h-4" /> },
  ];

  const projectWorkflowLinks = [
    {
      to: `/app/projects/${projectId}/requirements`,
      label: '1. Requirements',
      icon: <FileText className="w-4 h-4" />,
      badge: 'Analyze',
    },
    {
      to: `/app/projects/${projectId}/clarifications`,
      label: '2. Clarifications',
      icon: <HelpCircle className="w-4 h-4" />,
      badge: 'Wizard',
    },
    {
      to: `/app/projects/${projectId}/specification`,
      label: '3. Confirmed Spec',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: 'Review',
    },
    {
      to: `/app/projects/${projectId}/verdict`,
      label: '4. System Verdict',
      icon: <Scale className="w-4 h-4" />,
      badge: 'Verdict',
    },
    {
      to: `/app/projects/${projectId}/architectures`,
      label: '5. Architectures',
      icon: <Cpu className="w-4 h-4" />,
      badge: 'Options',
    },
    {
      to: `/app/projects/${projectId}/simulations`,
      label: '6. Simulations',
      icon: <Activity className="w-4 h-4" />,
      badge: 'Stress',
    },
    {
      to: `/app/projects/${projectId}/generation`,
      label: '7. Code Generation',
      icon: <Code2 className="w-4 h-4" />,
      badge: 'Code',
    },
    {
      to: `/app/projects/${projectId}/validation`,
      label: '8. AST Validation',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: 'AST',
    },
    {
      to: `/app/projects/${projectId}/demo`,
      label: '9. Demo & Export',
      icon: <PlayCircle className="w-4 h-4" />,
      badge: 'ZIP',
    },
  ];

  return (
    <aside
      className={`relative h-[calc(100vh-3.5rem)] bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Workspace Card */}
        {!collapsed ? (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">Workspace</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="font-semibold text-slate-800 truncate">Chrysalis Engine</div>
            <div className="text-[10px] text-indigo-600 font-mono mt-0.5 truncate">
              chrysalis_db : 5432
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
        )}

        {/* Main Nav */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
              Platform
            </div>
          )}
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
              title={collapsed ? link.label : undefined}
            >
              <div className="flex-shrink-0">{link.icon}</div>
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Active Project Workflow */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Agent Pipeline</span>
              <span className="text-[10px] text-indigo-600 font-mono font-medium">9 Stages</span>
            </div>
          )}
          {projectWorkflowLinks.map((link) => {
            const isCurrent = location.pathname.includes(link.to.split('/').pop() || '');
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={() =>
                  `flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
                title={collapsed ? link.label : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex-shrink-0">{link.icon}</div>
                  {!collapsed && <span className="truncate">{link.label}</span>}
                </div>
                {!collapsed && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav & Toggle */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Settings & Health</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
