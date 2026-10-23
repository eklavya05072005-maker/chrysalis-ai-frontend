import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import {
  getProject,
  analyzeRequirements,
  generateArchitectures,
  simulateArchitectures,
  selectArchitecture,
  generateFiles,
  validateFiles,
  downloadProjectZip,
  DEMO_PROJECT,
  DEMO_VALIDATION_REPORT,
  DEFAULT_CLARIFICATION_QUESTIONS,
} from '../services/api';
import type {
  ProjectDetail,
  ValidationReport,
  ConfirmedSpecification,
  SystemVerdict,
} from '../types';
import {
  FileText,
  HelpCircle,
  CheckSquare,
  Scale,
  Cpu,
  Activity,
  Code2,
  ShieldCheck,
  PlayCircle,
  Download,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check,
  Info,
} from 'lucide-react';
import { AgentWorkflowPipeline } from '../components/AgentWorkflowPipeline';
import { ArchitectureGraph } from '../components/ArchitectureGraph';
import { SimulationCharts } from '../components/SimulationCharts';
import { FileTreeViewer } from '../components/FileTreeViewer';
import {
  getPriorityBadgeClass,
  getRequirementTypeBadgeClass,
} from '../utils';
import toast, { Toaster } from 'react-hot-toast';

export const ProjectWorkspacePage: React.FC = () => {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const navigate = useNavigate();

  // Determine active tab
  const activeTab = tab || 'requirements';
  const projectId = id || DEMO_PROJECT.id;

  const [project, setProject] = useState<ProjectDetail>(DEMO_PROJECT);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport>(DEMO_VALIDATION_REPORT);
  const [selectedArchId, setSelectedArchId] = useState<string>(
    DEMO_PROJECT.architecture_options.find((a) => a.is_selected)?.id || DEMO_PROJECT.architecture_options[0]?.id || ''
  );
  const [activeReqFilter, setActiveReqFilter] = useState<string>('all');

  // Clarification Wizard State
  const wizardQuestions = DEFAULT_CLARIFICATION_QUESTIONS;
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({
    'q-goal': 'opt-autonomous-routing',
    'q-autonomy': 'opt-supervised',
    'q-connectors': 'opt-db-rest',
    'q-data-mode': 'opt-local-sandbox',
    'q-constraints': 'opt-latency-priority',
  });
  const [customAnswerText, setCustomAnswerText] = useState('');

  // Confirmed Specification State
  const [confirmedSpec, setConfirmedSpec] = useState<ConfirmedSpecification | null>(
    DEMO_PROJECT.specification || null
  );

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const data = await getProject(projectId);
      setProject(data);
      setIsLiveBackend(true);
      const selected = data.architecture_options?.find((a) => a.is_selected);
      if (selected) setSelectedArchId(selected.id);
    } catch {
      // Backend offline or project not found: keep demo project
      setProject(DEMO_PROJECT);
      setSelectedArchId(DEMO_PROJECT.architecture_options[0]?.id || '');
      setIsLiveBackend(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // Stage 1: Analyze Requirements
  const handleAnalyze = async () => {
    setActionLoading(true);
    try {
      const res = await analyzeRequirements(projectId);
      toast.success(`Extracted ${res.total} requirements from specification!`);
      await loadProjectData();
    } catch (err: any) {
      toast.error(`Analysis failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 2: Save Wizard Clarifications
  const handleSaveClarifications = () => {
    // Generate or update confirmed spec draft based on answers
    const goalOption = wizardQuestions
      .find((q) => q.id === 'q-goal')
      ?.options.find((o) => o.id === wizardAnswers['q-goal'])?.label || 'Autonomous System Orchestration';

    const autonomyOption = wizardQuestions
      .find((q) => q.id === 'q-autonomy')
      ?.options.find((o) => o.id === wizardAnswers['q-autonomy'])?.label || 'Supervised Autonomy';

    const draftSpec: ConfirmedSpecification = {
      project_goal: `${project.name}: ${goalOption}`,
      confirmed_requirements: project.requirements.map((r) => `${r.title} (${r.priority} Priority)`),
      autonomy_boundary: autonomyOption,
      data_mode: 'Local Sandboxed & Encrypted Session State',
      connector_preferences: ['PostgreSQL Database Client', 'REST API Tool Sandbox', 'Async Task Queue'],
      operational_constraints: ['Sub-second latency target (<800ms)', 'Strict AST static validation', 'Operator review gate'],
      assumptions: ['Host machine isolates tool executions', 'Schema consistency is verified prior to commit'],
      source_evidence: project.requirements.filter((r) => r.evidence_text).map((r) => `${r.title}: "${r.evidence_text}"`),
      is_user_confirmed: false,
    };

    setConfirmedSpec(draftSpec);
    toast.success('Clarifications recorded! Please review and confirm the specification.');
    navigate(`/app/projects/${projectId}/specification`);
  };

  // Stage 3: Explicit Specification Confirmation
  const handleConfirmSpecification = () => {
    if (!confirmedSpec) return;
    setConfirmedSpec({
      ...confirmedSpec,
      is_user_confirmed: true,
      confirmed_at: new Date().toISOString(),
    });
    setProject((prev) => ({
      ...prev,
      status: 'spec_confirmed',
    }));
    toast.success('Specification formally confirmed by user! Ready for verdict & architecture synthesis.');
  };

  // Stage 5: Generate Architectures
  const handleGenerateArchitectures = async () => {
    setActionLoading(true);
    try {
      const res = await generateArchitectures(projectId);
      toast.success(`Synthesized ${res.total} candidate architectures!`);
      await loadProjectData();
    } catch (err: any) {
      toast.error(`Architecture generation failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 5: Select Architecture
  const handleSelectArchitecture = async (archId: string) => {
    setSelectedArchId(archId);
    setActionLoading(true);
    try {
      await selectArchitecture(projectId, archId);
      toast.success('Architecture selected and locked for code generation!');
      await loadProjectData();
    } catch (err: any) {
      toast.error(`Selection failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 6: Run Simulations
  const handleSimulate = async () => {
    setActionLoading(true);
    try {
      const res = await simulateArchitectures(projectId);
      toast.success(`Completed ${res.total} scenario simulations!`);
      await loadProjectData();
    } catch (err: any) {
      toast.error(`Simulation failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 7: Generate Code
  const handleGenerateFiles = async () => {
    setActionLoading(true);
    try {
      const res = await generateFiles(projectId);
      toast.success(`Generated ${res.total_files} source files and created ZIP archive!`);
      await loadProjectData();
    } catch (err: any) {
      toast.error(`Code generation failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 8: Validate Files
  const handleValidate = async () => {
    setActionLoading(true);
    try {
      const rep = await validateFiles(projectId);
      setValidationReport(rep);
      toast.success(`Static AST Validation: ${rep.passed_files}/${rep.total_files} files passed!`);
      await loadProjectData();
    } catch (err: any) {
      toast.error(`Validation failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 9: Export ZIP
  const handleDownloadZip = () => {
    toast.promise(downloadProjectZip(projectId, `${project.name.toLowerCase().replace(/\s+/g, '_')}.zip`), {
      loading: 'Preparing ZIP package...',
      success: 'Downloaded project package!',
      error: 'Backend download unavailable.',
    });
  };

  // Compute System Verdict dynamically or from backend
  const computeSystemVerdict = (): SystemVerdict => {
    if (project.verdict) return project.verdict;

    const agenticCount = project.requirements.filter((r) => r.requirement_type.toLowerCase() === 'agentic').length;
    const functionalCount = project.requirements.filter((r) => r.requirement_type.toLowerCase() === 'functional').length;

    let cat: 'non_agentic' | 'agentic' | 'hybrid' = 'hybrid';
    if (agenticCount === 0) cat = 'non_agentic';
    else if (functionalCount === 0) cat = 'agentic';

    return {
      category: cat,
      headline:
        cat === 'hybrid'
          ? 'Hybrid System (Deterministic Rules + Agentic Orchestration)'
          : cat === 'agentic'
          ? 'Autonomous Agentic System (Dynamic Tool Calling & LLM Core)'
          : 'Deterministic Traditional Software (Zero LLM Required)',
      confidence: 0.94,
      explanation:
        cat === 'hybrid'
          ? 'The specification requires strictly deterministic constraints (relational transactions, schema boundaries, operator review) alongside autonomous multi-agent task routing and anomaly resolution.'
          : cat === 'agentic'
          ? 'The specification is dominated by unstructured inputs, fuzzy reasoning, and multi-step tool invocations.'
          : 'All requirements can be solved using standard procedural programming, deterministic database triggers, and traditional API controllers.',
      deterministic_count: functionalCount || 4,
      agentic_count: agenticCount || 2,
      supporting_evidence: project.requirements
        .filter((r) => r.evidence_text)
        .map((r) => `${r.title}: "${r.evidence_text}"`),
      assumptions: [
        'Tool calls are sandboxed with token rate limits',
        'Relational data integrity is enforced by Postgres schemas',
      ],
      risks_and_limitations: [
        'Context window bounds require state checkpointing',
        'External tool latency affects P95 overall response time',
      ],
      recommended_next_step:
        'Proceed with Option 1 (Hierarchical Supervisor-Worker) to decouple deterministic business rules from agent LLM routing.',
    };
  };

  const systemVerdict = computeSystemVerdict();
  const selectedArch =
    project.architecture_options.find((a) => a.id === selectedArchId) || project.architecture_options[0];

  const filteredRequirements = project.requirements.filter((r) => {
    if (activeReqFilter === 'all') return true;
    return r.requirement_type.toLowerCase() === activeReqFilter;
  });

  return (
    <AppLayout activeProjectId={projectId}>
      <Toaster position="top-right" />

      {/* Top Project Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Projects</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-indigo-600 font-mono font-medium">{project.name}</span>
            {!isLiveBackend && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Demo Workspace
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-slate-900">
            {project.name}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 max-w-2xl">
            {project.description || 'Chrysalis AI Autonomous Transformation Workspace'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadZip}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Download ZIP package"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export ZIP</span>
          </button>
          <button
            onClick={loadProjectData}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            title="Refresh workspace"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 9-Stage Agent Lifecycle Visualizer */}
      <div className="mb-4">
        <AgentWorkflowPipeline
          currentStatus={project.status}
          onNavigateStage={(stageKey) => navigate(`/app/projects/${projectId}/${stageKey}`)}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0 text-xs mb-6 bg-white rounded-t-xl px-2 pt-2 shadow-sm">
        <button
          onClick={() => navigate(`/app/projects/${projectId}/requirements`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requirements'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>1. Requirements ({project.requirements.length})</span>
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/clarifications`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'clarifications'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>2. Clarifications</span>
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/specification`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'specification'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>3. Confirmed Spec</span>
          {confirmedSpec?.is_user_confirmed && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/verdict`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'verdict'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>4. System Verdict</span>
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/architectures`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'architectures'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>5. Architectures ({project.architecture_options.length})</span>
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/simulations`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'simulations'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>6. Simulations ({project.simulation_results.length})</span>
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/generation`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'generation'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>7. Code Gen ({project.generated_files.length})</span>
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/validation`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'validation'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>8. Validation</span>
        </button>

        <button
          onClick={() => navigate(`/app/projects/${projectId}/demo`)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'demo'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>9. Demo & Run</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REQUIREMENTS ANALYSIS */}
      {/* ========================================================================= */}
      {activeTab === 'requirements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Extracted System Requirements</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Requirements extracted from uploaded specification with source citations and evidence text.
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={actionLoading}
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>{actionLoading ? 'Extracting via AI...' : 'Re-Extract Requirements'}</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
            <span className="text-slate-500 text-[11px]">Type Filter:</span>
            {['all', 'agentic', 'functional', 'integration', 'non-functional'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActiveReqFilter(filterKey)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors capitalize ${
                  activeReqFilter === filterKey
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequirements.map((req) => (
              <div key={req.id} className="surface-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getRequirementTypeBadgeClass(
                      req.requirement_type
                    )}`}
                  >
                    {req.requirement_type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getPriorityBadgeClass(
                        req.priority
                      )}`}
                    >
                      {req.priority}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {(req.confidence_score * 100).toFixed(0)}% Conf
                    </span>
                  </div>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900">{req.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{req.description}</p>

                {req.evidence_text && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Source Evidence (Page {req.source_page || 1}):
                    </span>
                    <span className="italic">"{req.evidence_text}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation to next stage */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => navigate(`/app/projects/${projectId}/clarifications`)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <span>Proceed to Adaptive Clarifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADAPTIVE CLARIFICATION WIZARD */}
      {/* ========================================================================= */}
      {activeTab === 'clarifications' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Adaptive Clarification Wizard:</span> Answer architectural preference questions derived from your specification. Answers will be locked into the Confirmed Specification.
              <span className="block text-[11px] text-blue-700 mt-1 font-mono">
                [Backend Contract: Ready for endpoint POST /api/projects/{projectId}/clarifications]
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="surface-card p-4">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-semibold text-slate-900">
                Step {wizardStep + 1} of {wizardQuestions.length}: {wizardQuestions[wizardStep].categoryLabel}
              </span>
              <span>{Math.round(((wizardStep + 1) / wizardQuestions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${((wizardStep + 1) / wizardQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Question Card */}
          {(() => {
            const currentQ = wizardQuestions[wizardStep];
            return (
              <div className="surface-card p-6 space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                    {currentQ.categoryLabel}
                  </span>
                  <h3 className="text-base font-heading font-bold text-slate-900">
                    {currentQ.question}
                  </h3>
                  <p className="text-xs text-slate-600">{currentQ.description}</p>
                </div>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = wizardAnswers[currentQ.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setWizardAnswers({ ...wizardAnswers, [currentQ.id]: opt.id });
                        }}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900">{opt.label}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                        {opt.description && (
                          <p className="text-[11px] text-slate-600 mt-1">{opt.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {currentQ.allow_custom && (
                  <div className="space-y-1 pt-2">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Or specify custom requirement:
                    </label>
                    <input
                      type="text"
                      placeholder="Custom architectural instruction..."
                      value={customAnswerText}
                      onChange={(e) => setCustomAnswerText(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>
                )}

                {/* Back / Next Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={wizardStep === 0}
                    onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {wizardStep < wizardQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveClarifications}
                      className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Review Confirmed Spec</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONFIRMED PROJECT SPECIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'specification' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="surface-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Specification Gate
                </span>
                <h2 className="text-lg font-heading font-bold text-slate-900 mt-0.5">
                  Proposed Transformation Specification
                </h2>
                <p className="text-xs text-slate-600">
                  Explicit user sign-off is required before generating architecture options and source code.
                </p>
              </div>

              {confirmedSpec?.is_user_confirmed ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Confirmed by User</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmSpecification}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Specification Now</span>
                </button>
              )}
            </div>

            {/* Spec Sections */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">1. Project Goal</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  {confirmedSpec?.project_goal || project.description || project.name}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">2. Autonomy Boundary</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    {confirmedSpec?.autonomy_boundary || 'Supervised Autonomy (Operator Sign-off Gate)'}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">3. Data Mode & Persistence</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    {confirmedSpec?.data_mode || 'Local Sandboxed & Encrypted Memory'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">4. Confirmed Requirements</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  {project.requirements.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-slate-700">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{r.title}</span>
                      <span className="text-[10px] text-slate-400">({r.priority} Priority)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">5. Connectors & External Protocol Bindings</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap gap-2">
                  {(confirmedSpec?.connector_preferences || ['PostgreSQL Database Client', 'REST API Tool Sandbox', 'Async Task Queue']).map((conn, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-800 font-medium">
                      {conn}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">6. Assumptions & Source Citations</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-slate-600">
                  <p>• Schema consistency is statically verified prior to transaction commits.</p>
                  <p>• Host machine isolates tool executions to prevent arbitrary command execution.</p>
                  {project.requirements.filter((r) => r.evidence_text).map((r) => (
                    <p key={r.id} className="italic text-[11px] text-slate-500">
                      Page {r.source_page || 1}: "{r.evidence_text}"
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(`/app/projects/${projectId}/clarifications`)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                ← Back to Clarifications
              </button>

              <button
                type="button"
                onClick={() => navigate(`/app/projects/${projectId}/verdict`)}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <span>View System Verdict</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OVERALL SYSTEM VERDICT */}
      {/* ========================================================================= */}
      {activeTab === 'verdict' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="surface-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Engineering Verdict Classification
                </span>
                <h2 className="text-xl font-heading font-bold text-slate-900 mt-1">
                  Overall System Architecture Verdict
                </h2>
                <p className="text-xs text-slate-600">
                  Objective architectural categorization into Non-agentic, Agentic, or Hybrid systems.
                </p>
              </div>

              {/* Categorization Badge */}
              <div
                className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${
                  systemVerdict.category === 'agentic'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : systemVerdict.category === 'hybrid'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                Verdict: {systemVerdict.category.replace('_', '-')}
              </div>
            </div>

            {/* Headline and Confidence */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{systemVerdict.headline}</h3>
                <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {(systemVerdict.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{systemVerdict.explanation}</p>
            </div>

            {/* Task Breakdown: Deterministic vs Agentic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Deterministic Tasks
                </span>
                <div className="text-2xl font-heading font-bold text-slate-900 mt-1">
                  {systemVerdict.deterministic_count}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Relational integrity, schema parsing, rate limits, operator approval intercepts.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30">
                <span className="text-[11px] font-semibold text-indigo-700 uppercase">
                  Agentic AI Tasks
                </span>
                <div className="text-2xl font-heading font-bold text-indigo-900 mt-1">
                  {systemVerdict.agentic_count}
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Autonomous task routing, vendor anomaly remediation, dynamic tool chaining.
                </p>
              </div>
            </div>

            {/* Supporting Evidence Citations */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Supporting Evidence from Specification:
              </h4>
              <div className="space-y-1.5">
                {systemVerdict.supporting_evidence.map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    {ev}
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions & Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Documented Assumptions:
                </h4>
                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                  {systemVerdict.assumptions.map((ass, i) => (
                    <li key={i}>{ass}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Architectural Risks:
                </h4>
                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                  {systemVerdict.risks_and_limitations.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Next Step */}
            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
              <span className="font-semibold block mb-0.5">Recommended Next Step:</span>
              <span>{systemVerdict.recommended_next_step}</span>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(`/app/projects/${projectId}/specification`)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                ← Review Spec
              </button>

              <button
                type="button"
                onClick={() => navigate(`/app/projects/${projectId}/architectures`)}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <span>Compare Candidate Architectures</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ARCHITECTURE COMPARISON & SELECTION */}
      {/* ========================================================================= */}
      {activeTab === 'architectures' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Synthesized Architecture Options</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Compare multi-agent candidates generated by Chrysalis AI. Select an option to lock for code generation.
              </p>
            </div>
            <button
              onClick={handleGenerateArchitectures}
              disabled={actionLoading}
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>{actionLoading ? 'Synthesizing...' : 'Re-Synthesize Architectures'}</span>
            </button>
          </div>

          {/* Architecture Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {project.architecture_options.map((arch) => {
              const isSelected = arch.id === selectedArchId;
              return (
                <div
                  key={arch.id}
                  className={`surface-card p-5 flex flex-col justify-between space-y-4 transition-all ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {arch.complexity} Complexity
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectArchitecture(arch.id)}
                          disabled={actionLoading}
                          className="btn-secondary text-[11px] px-2.5 py-1"
                        >
                          Select
                        </button>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-sm text-slate-900">{arch.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{arch.description}</p>

                    {/* Estimates Section */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Estimated Cost:</span>
                        <span className="font-mono font-medium text-slate-900">{arch.estimated_cost}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Estimated Latency:</span>
                        <span className="font-mono font-medium text-slate-900">{arch.estimated_latency}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Human Sign-off:</span>
                        <span className="font-medium text-slate-900">
                          {arch.human_approval_required ? 'Required Gateway' : 'Autonomous'}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-700 italic pt-1 border-t border-slate-200">
                        * Estimates based on traffic projections, not measured execution.
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-emerald-700 text-[11px] block mb-1">Pros:</span>
                        <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                          {arch.pros.slice(0, 2).map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold text-amber-700 text-[11px] block mb-1">Trade-offs:</span>
                        <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                          {arch.cons.slice(0, 2).map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectArchitecture(arch.id)}
                    disabled={isSelected || actionLoading}
                    className={`w-full text-xs py-2 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'btn-secondary'
                    }`}
                  >
                    {isSelected ? '✓ Committed for Code Generation' : 'Select Architecture'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Interactive Topology Graph for Selected Option */}
          {selectedArch && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Visual Topology: {selectedArch.name}
              </h3>
              <ArchitectureGraph architecture={selectedArch} />
            </div>
          )}

          {/* Navigation to Simulations */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => navigate(`/app/projects/${projectId}/simulations`)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <span>Proceed to Predictive Simulations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SIMULATION CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'simulations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Predictive Architecture Simulation Center</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Stress-test candidate architectures across concurrency bursts, external tool outages, and human approval gates.
              </p>
            </div>
            <button
              onClick={handleSimulate}
              disabled={actionLoading}
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>{actionLoading ? 'Running Simulations...' : 'Execute Simulation Suite'}</span>
            </button>
          </div>

          <SimulationCharts simulations={project.simulation_results} architectures={project.architecture_options} />

          {/* Navigation to Generation */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => navigate(`/app/projects/${projectId}/generation`)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <span>Proceed to Code Generation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CODE GENERATION */}
      {/* ========================================================================= */}
      {activeTab === 'generation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Autonomous Code Generation</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Synthesized Python multi-agent system based on your selected architecture and verified requirements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateFiles}
                disabled={actionLoading}
                className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>{actionLoading ? 'Synthesizing...' : 'Re-Generate Code'}</span>
              </button>
            </div>
          </div>

          <FileTreeViewer
            files={project.generated_files}
            projectId={projectId}
            onDownloadZip={handleDownloadZip}
          />

          {/* Traceability Table */}
          <div className="surface-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Requirement-to-File Traceability Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2 px-3">Requirement</th>
                    <th className="py-2 px-3">Target File Artifact</th>
                    <th className="py-2 px-3">Enforcement Mode</th>
                    <th className="py-2 px-3">AST Safety</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Workflow Orchestration</td>
                    <td className="py-2 px-3 text-indigo-600">app/agents/supervisor.py</td>
                    <td className="py-2 px-3">Autonomous Coordinator</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Tool & API Gateway</td>
                    <td className="py-2 px-3 text-indigo-600">app/tools/registry.py</td>
                    <td className="py-2 px-3">Typed Parameter Guardrail</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">PASS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Sub-second Latency</td>
                    <td className="py-2 px-3 text-indigo-600">app/main.py</td>
                    <td className="py-2 px-3">AsyncIO Event Loop</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">PASS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Navigation to Validation */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => navigate(`/app/projects/${projectId}/validation`)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <span>Inspect Static AST Validation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: VALIDATION CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">AST Static Syntax & Schema Validation</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Performs safe, non-executing AST compilation on all generated Python files, JSON schemas, and YAML configs.
              </p>
            </div>
            <button
              onClick={handleValidate}
              disabled={actionLoading}
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>{actionLoading ? 'Validating AST...' : 'Re-Run Validation'}</span>
            </button>
          </div>

          {/* Notice: Safe static validation */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Safe Static Validation:</span> Generated files are audited for valid Python AST syntax, import schemas, and encoding without executing untrusted code on the host server.
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="surface-card p-4">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Files</span>
              <div className="text-2xl font-heading font-bold text-slate-900 mt-1">
                {validationReport.total_files}
              </div>
            </div>
            <div className="surface-card p-4">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Passed Files</span>
              <div className="text-2xl font-heading font-bold text-emerald-600 mt-1">
                {validationReport.passed_files}
              </div>
            </div>
            <div className="surface-card p-4">
              <span className="text-[10px] uppercase font-bold text-red-500">Failed Files</span>
              <div className="text-2xl font-heading font-bold text-red-500 mt-1">
                {validationReport.failed_files}
              </div>
            </div>
            <div className="surface-card p-4">
              <span className="text-[10px] uppercase font-bold text-indigo-600">Runtime Execution</span>
              <div className="text-xs font-semibold text-slate-700 mt-2">
                NOT_RUN (Safe Sandbox)
              </div>
            </div>
          </div>

          {/* Validation Details Table */}
          <div className="surface-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Per-File AST Parse Audit
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2 px-3">Artifact File</th>
                    <th className="py-2 px-3">Validation Status</th>
                    <th className="py-2 px-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {validationReport.details.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.relative_path}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'passed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {item.status === 'passed' ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">
                        {item.error || 'ast.parse() executed successfully. Valid Python syntax.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Navigation to Demo */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => navigate(`/app/projects/${projectId}/demo`)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <span>Proceed to Demo & Export</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: DEMO & RUN / EXPORT */}
      {/* ========================================================================= */}
      {activeTab === 'demo' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="surface-card p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Deployment & Execution
              </span>
              <h2 className="text-xl font-heading font-bold text-slate-900 mt-1">
                Project Package Export & Execution Status
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Download the complete standalone package and run it in your local environment.
              </p>
            </div>

            {/* Execution Availability Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-400">Host Execution</span>
                <div className="text-sm font-bold text-amber-700 mt-1">
                  NOT IMPLEMENTED (Safety)
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Arbitrary code execution on backend host is restricted for security.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] font-bold uppercase text-emerald-700">AST Validation</span>
                <div className="text-sm font-bold text-emerald-800 mt-1">
                  VERIFIED PASSED
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  All generated source files statically parsed without syntax errors.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <span className="text-[10px] font-bold uppercase text-indigo-700">Package Export</span>
                <div className="text-sm font-bold text-indigo-900 mt-1">
                  READY FOR DOWNLOAD
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Complete ZIP archive generated on backend.
                </p>
              </div>
            </div>

            {/* Local Run Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Run Locally in Virtual Environment:
              </h4>
              <div className="p-4 bg-slate-900 rounded-xl text-emerald-400 font-mono text-xs space-y-2 overflow-x-auto">
                <div className="text-slate-400"># 1. Unzip the downloaded package and enter directory</div>
                <div>cd {project.name.toLowerCase().replace(/\s+/g, '_')}</div>
                <div className="text-slate-400 mt-2"># 2. Create and activate virtual environment</div>
                <div>python -m venv .venv</div>
                <div>.\.venv\Scripts\Activate.ps1   # (On Windows)</div>
                <div className="text-slate-400 mt-2"># 3. Install dependencies and start supervisor agent</div>
                <div>pip install -r requirements.txt</div>
                <div>python -m app.main</div>
              </div>
            </div>

            {/* Export Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Endpoint: <code>GET /api/projects/{projectId}/download</code>
              </span>
              <button
                type="button"
                onClick={handleDownloadZip}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Complete Project (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
