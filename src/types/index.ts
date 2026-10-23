export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status:
    | 'uploaded'
    | 'analyzing'
    | 'analyzed'
    | 'analysis_failed'
    | 'clarifying'
    | 'clarified'
    | 'spec_confirmed'
    | 'architectures_ready'
    | 'architectures_failed'
    | 'simulating'
    | 'simulated'
    | 'simulation_failed'
    | 'architecture_selected'
    | 'generating'
    | 'generated'
    | 'generation_failed'
    | 'validating'
    | 'validated'
    | 'validation_failed';
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_size: number;
  extracted_text?: string | null;
  created_at: string;
}

export interface Requirement {
  id: string;
  project_id: string;
  title: string;
  description: string;
  requirement_type: 'functional' | 'non-functional' | 'agentic' | 'integration' | string;
  priority: 'high' | 'medium' | 'low' | string;
  confidence_score: number;
  source_page?: number | null;
  evidence_text?: string | null;
  created_at: string;
}

export interface ArchitectureComponent {
  name: string;
  role: string;
  type: string; // e.g. "Orchestrator", "Worker Pool", "Memory Store", "Gateway"
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  protocol: string; // e.g. "gRPC / Async Queue", "REST / Event Stream"
}

export interface ArchitectureOption {
  id: string;
  project_id: string;
  name: string;
  description: string;
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
  pros: string[];
  cons: string[];
  risks: string[];
  estimated_cost: string;
  estimated_latency: string;
  complexity: 'Low' | 'Medium' | 'High' | string;
  human_approval_required: boolean;
  is_selected: boolean;
  created_at: string;
}

export interface SimulationResult {
  id: string;
  project_id: string;
  architecture_id: string;
  scenario_name: string;
  input_data: Record<string, unknown>;
  expected_outcome: string;
  simulated_outcome: string;
  result_status: 'pass' | 'fail' | 'warning' | string;
  metrics: {
    throughput_rps?: number;
    p95_latency_ms?: number;
    error_rate_pct?: number;
    cost_estimate_monthly?: number;
    memory_overhead_mb?: number;
    recovery_time_ms?: number;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface GeneratedFile {
  id: string;
  project_id: string;
  relative_path: string;
  filename: string;
  language: string;
  file_size: number;
  validation_status: 'pending' | 'passed' | 'failed' | string;
  created_at: string;
  content?: string; // Optional for in-browser preview
}

export interface ValidationDetail {
  relative_path: string;
  filename: string;
  status: 'passed' | 'failed';
  error?: string | null;
}

export interface ValidationReport {
  project_id: string;
  total_files: number;
  passed_files: number;
  failed_files: number;
  validation_status: 'validated' | 'validation_failed' | 'passed' | string;
  details: ValidationDetail[];
  timestamp: string;
}

export type VerdictCategory = 'non_agentic' | 'agentic' | 'hybrid';

export interface SystemVerdict {
  category: VerdictCategory;
  headline: string;
  confidence: number;
  explanation: string;
  deterministic_count: number;
  agentic_count: number;
  supporting_evidence: string[];
  assumptions: string[];
  risks_and_limitations: string[];
  recommended_next_step: string;
}

export interface ClarificationOption {
  id: string;
  label: string;
  description?: string;
}

export interface ClarificationQuestion {
  id: string;
  category: 'goal' | 'autonomy' | 'connectors' | 'data_mode' | 'constraints';
  categoryLabel: string;
  question: string;
  description: string;
  options: ClarificationOption[];
  allow_custom: boolean;
  user_answer?: string;
  is_required: boolean;
}

export interface ConfirmedSpecification {
  project_goal: string;
  confirmed_requirements: string[];
  autonomy_boundary: string;
  data_mode: string;
  connector_preferences: string[];
  operational_constraints: string[];
  assumptions: string[];
  source_evidence: string[];
  is_user_confirmed: boolean;
  confirmed_at?: string;
}

export interface ProjectDetail extends Project {
  documents: Document[];
  requirements: Requirement[];
  architecture_options: ArchitectureOption[];
  simulation_results: SimulationResult[];
  generated_files: GeneratedFile[];
  verdict?: SystemVerdict;
  specification?: ConfirmedSpecification;
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | string;
  database: {
    status: 'connected' | 'disconnected' | string;
    message?: string;
  };
  version?: string;
}
