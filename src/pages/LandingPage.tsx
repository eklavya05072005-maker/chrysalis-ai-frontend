import React from 'react';
import { Link } from 'react-router-dom';
import SculptureHero from '../components/SculptureHero';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  Code2,
  FileCheck2,
} from 'lucide-react';
import { DEMO_PROJECT } from '../services/api';
import { ArchitectureGraph } from '../components/ArchitectureGraph';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Floating Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm tracking-tight text-slate-900">
                Chrysalis AI
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Middleware
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/app"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Projects Console
          </Link>
          <Link
            to="/app/settings"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            API Health
          </Link>
          <Link
            to="/app/projects/new"
            className="btn-primary text-xs px-3.5 py-1.5"
          >
            <span>Launch Ingestion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION WITH SCULPTURE HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <SculptureHero
          brand="Chrysalis AI"
          eyebrow="Agentic Conversion Middleware"
          headline="Transform Software Specifications Into Verified Agentic Systems."
          headlineAccent="Agentic Systems."
          body="Agentic middleware that ingests software requirements, runs adaptive clarification, synthesizes candidate multi-agent architectures, performs predictive stress simulations, and generates production-ready source code."
          primaryCta={{ label: "Ingest Specification", href: "/app/projects/new" }}
          secondaryCta={{ label: "Open Console", href: "/app" }}
          backdropText="CHRYSALIS"
          theme="light"
          background="#FFFFFF"
          showNav={false}
          showCredit={false}
          sculptureScale={1.05}
          interactive={true}
        />
      </section>

      {/* 4 Core Pillars of Chrysalis */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            End-to-End Autonomous Transformation
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
            From Software Requirements to Agent Topologies
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Chrysalis AI orchestrates a 9-stage engineering workflow from document extraction and adaptive questions to AST-validated code synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="surface-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Flexible Ingestion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ingest PDF documents, direct problem statements, or README text files. Automatically extracts deterministic rules and AI-assisted workflows.
            </p>
          </div>

          <div className="surface-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Architecture Synthesis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes 3 candidate architectures (Hierarchical Supervisor, Event-Driven Reactive, and Fast ReAct) tailored to your constraints.
            </p>
          </div>

          <div className="surface-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Predictive Simulation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulates concurrency bursts, external API timeouts, and human sign-off gates before committing to code generation.
            </p>
          </div>

          <div className="surface-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AST-Validated Code</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes production Python agent repos verified via static AST parsing with zero host execution risks and instant ZIP export.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Topology Preview */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Live Sample Output
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 mt-1">
                Generated Multi-Agent Architecture Topology
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Visualizing hierarchical orchestration with human approval guardrails and state checkpointing.
              </p>
            </div>
            <Link
              to={`/app/projects/${DEMO_PROJECT.id}/architectures`}
              className="btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 self-start"
            >
              <span>Explore Architecture Suite</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <ArchitectureGraph architecture={DEMO_PROJECT.architecture_options[0]} />
        </div>
      </section>

      {/* Safety & Compliance Banner */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe Host Architecture & Non-Executing Validation</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Enterprise Security First
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl">
              Chrysalis AI never executes untrusted generated code on your host machine. Validation is performed via AST static syntax analysis, JSON schemas, and structural isolation.
            </p>
          </div>
          <Link
            to="/app/projects/new"
            className="btn-primary text-xs px-5 py-2.5 flex-shrink-0"
          >
            <span>Start Transformation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Chrysalis AI — Agentic Conversion Middleware Platform
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <Link to="/app" className="hover:text-slate-900">Console</Link>
            <Link to="/app/settings" className="hover:text-slate-900">Health & Diagnostics</Link>
            <span>FastAPI + PostgreSQL + React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
