import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Plus, Settings, FolderGit2 } from 'lucide-react';
import { BackendStatusBanner } from './BackendStatusBanner';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white border-b border-slate-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm tracking-tight text-slate-900">
                  Chrysalis AI
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Middleware
                </span>
              </div>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Agentic Conversion Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Main Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/app"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/app' || location.pathname === '/app/projects'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects</span>
          </Link>
          <Link
            to="/app/settings"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/app/settings'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Health</span>
          </Link>
        </nav>

        {/* Right Section: Status Pill & Action */}
        <div className="flex items-center gap-3">
          <BackendStatusBanner compact />

          <Link
            to="/app/projects/new"
            className="btn-primary text-xs px-3.5 py-1.5 hidden sm:inline-flex"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
