import axios from 'axios';
import type {
  Project,
  ProjectDetail,
  ProjectListResponse,
  Requirement,
  ArchitectureOption,
  SimulationResult,
  GeneratedFile,
  ValidationReport,
  HealthStatus,
  ClarificationQuestion,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chrysalis-ai-backend-act1.onrender.com/api';
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// Demo Mode Storage Key
const DEMO_MODE_KEY = 'chrysalis_demo_mode_active';

export function isDemoModeActive(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

export function setDemoModeActive(active: boolean): void {
  localStorage.setItem(DEMO_MODE_KEY, active ? 'true' : 'false');
}

// ---------------------------------------------------------------------------
// Live Backend Endpoints (Verified against backend/app/api/routes/projects.py)
// ---------------------------------------------------------------------------

// Check if backend is reachable (GET /api/health)
export async function checkBackendHealth(): Promise<HealthStatus> {
  const response = await apiClient.get<HealthStatus>('/health', { timeout: 3500 });
  return response.data;
}

// Project Creation (POST /api/projects with multipart/form-data)
export async function createProject(formData: FormData): Promise<Project> {
  const response = await apiClient.post<Project>('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// Utility to wrap direct text / readme into valid PDF bytes for existing backend PDF reader
export function createPdfBlobFromText(text: string, title: string): Blob {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lines = escaped.split('\n').slice(0, 150);
  let streamText = `BT /F1 14 Tf 50 740 Td (${title.slice(0, 60)}) Tj ET\n`;
  let y = 715;
  for (const line of lines) {
    if (y < 60) break;
    const sanitized = line.replace(/[\r\t]/g, ' ').slice(0, 95);
    streamText += `BT /F1 10 Tf 50 ${y} Td (${sanitized}) Tj ET\n`;
    y -= 14;
  }
  const streamLen = streamText.length;
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream
${streamText}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000261 00000 n 
0000000337 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${450 + streamLen}
%%EOF`;
  return new Blob([pdfString], { type: 'application/pdf' });
}

// List Projects (GET /api/projects)
export async function listProjects(page = 1, size = 20): Promise<ProjectListResponse> {
  const response = await apiClient.get<ProjectListResponse>('/projects', {
    params: { page, size },
  });
  return response.data;
}

// Get Project Details (GET /api/projects/{projectId})
export async function getProject(projectId: string): Promise<ProjectDetail> {
  const response = await apiClient.get<ProjectDetail>(`/projects/${projectId}`);
  return response.data;
}

// Extract Requirements (POST /api/projects/{projectId}/analyze)
export async function analyzeRequirements(
  projectId: string
): Promise<{ project_id: string; total: number; items: Requirement[] }> {
  const response = await apiClient.post<{ project_id: string; total: number; items: Requirement[] }>(
    `/projects/${projectId}/analyze`
  );
  return response.data;
}

// Generate Architectures (POST /api/projects/{projectId}/architectures)
export async function generateArchitectures(
  projectId: string
): Promise<{ project_id: string; total: number; items: ArchitectureOption[] }> {
  const response = await apiClient.post<{ project_id: string; total: number; items: ArchitectureOption[] }>(
    `/projects/${projectId}/architectures`
  );
  return response.data;
}

// Simulate Architectures (POST /api/projects/{projectId}/simulate)
export async function simulateArchitectures(
  projectId: string
): Promise<{ project_id: string; total: number; items: SimulationResult[] }> {
  const response = await apiClient.post<{ project_id: string; total: number; items: SimulationResult[] }>(
    `/projects/${projectId}/simulate`
  );
  return response.data;
}

// Select Architecture (POST /api/projects/{projectId}/select)
export async function selectArchitecture(projectId: string, architectureId: string): Promise<ArchitectureOption> {
  const response = await apiClient.post<ArchitectureOption>(`/projects/${projectId}/select`, {
    architecture_id: architectureId,
  });
  return response.data;
}

// Generate Files (POST /api/projects/{projectId}/generate)
export async function generateFiles(
  projectId: string
): Promise<{ project_id: string; total_files: number; status: string; files: GeneratedFile[] }> {
  const response = await apiClient.post<{ project_id: string; total_files: number; status: string; files: GeneratedFile[] }>(
    `/projects/${projectId}/generate`
  );
  return response.data;
}

// Validate Files (POST /api/projects/{projectId}/validate)
export async function validateFiles(projectId: string): Promise<ValidationReport> {
  const response = await apiClient.post<ValidationReport>(`/projects/${projectId}/validate`);
  return response.data;
}

// Retrieve Generated Files (GET /api/projects/{projectId}/files)
export async function getGeneratedFiles(projectId: string): Promise<GeneratedFile[]> {
  const response = await apiClient.get<GeneratedFile[]>(`/projects/${projectId}/files`);
  return response.data;
}

// Download Project ZIP (GET /api/projects/{projectId}/download)
export async function downloadProjectZip(projectId: string, filename?: string): Promise<void> {
  const response = await apiClient.get(`/projects/${projectId}/download`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/zip' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || `chrysalis_project_${projectId.slice(0, 8)}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Standalone Curated Demonstration Data
// Clearly marked as DEMO / OFFLINE representation for hackathon presentation
// ---------------------------------------------------------------------------

export const DEMO_PROJECT: ProjectDetail = {
  id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
  name: 'Enterprise Autonomous Supply Chain Assistant',
  description:
    'Multi-agent middleware ingesting supplier inventory specifications and autonomously coordinating ERP routing and anomaly remediation.',
  status: 'validated',
  error_message: null,
  created_at: '2026-10-23T14:30:00Z',
  updated_at: '2026-10-23T14:36:20Z',
  documents: [
    {
      id: 'doc-001-supply-chain-v2',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      original_filename: 'Global_Supply_Chain_Autonomous_Spec_v2.4.pdf',
      stored_filename: 'spec_e8d4cf72_1730000000.pdf',
      file_type: 'application/pdf',
      file_size: 2489120,
      extracted_text: `SECTION 1: OBJECTIVE
The system must coordinate multi-step agent actions with dynamic routing, telemetry tracking, and transactional state recovery.
Critical operational decisions must feature a Human-in-the-Loop Gateway pausing execution before irreversible ERP inventory commits.
All database tools and third-party logistics APIs must execute via a sandboxed registry with token bucket rate limiting.`,
      created_at: '2026-10-23T14:30:05Z',
    },
  ],
  requirements: [
    {
      id: 'req-01',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      title: 'Autonomous Multi-Agent Workflow Orchestration',
      description: 'The system must coordinate multi-step agent actions with dynamic routing and state recovery.',
      requirement_type: 'agentic',
      priority: 'high',
      confidence_score: 0.96,
      source_page: 1,
      evidence_text: 'Requirements dictate autonomous task execution and state recovery upon node timeout.',
      created_at: '2026-10-23T14:30:45Z',
    },
    {
      id: 'req-02',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      title: 'Secure Tool and API Integration Protocol',
      description: 'Standardized middleware interface to safely invoke logistics APIs and ERP database queries.',
      requirement_type: 'integration',
      priority: 'high',
      confidence_score: 0.92,
      source_page: 2,
      evidence_text: 'System must safely execute external API queries with rate limiting and credential isolation.',
      created_at: '2026-10-23T14:30:45Z',
    },
    {
      id: 'req-03',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      title: 'Human-in-the-Loop Review Gateway',
      description: 'High-impact order routing decisions must pause execution until an operator confirms.',
      requirement_type: 'functional',
      priority: 'medium',
      confidence_score: 0.89,
      source_page: 2,
      evidence_text: 'Human oversight required prior to irreversible ERP transactional commitments.',
      created_at: '2026-10-23T14:30:45Z',
    },
    {
      id: 'req-04',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      title: 'Sub-second Decision Latency under Load',
      description: 'System must process continuous supplier stock feeds within 750ms p95 latency.',
      requirement_type: 'non-functional',
      priority: 'high',
      confidence_score: 0.94,
      source_page: 3,
      evidence_text: 'P95 latency requirement is bounded strictly under 750ms during peak bursts.',
      created_at: '2026-10-23T14:30:45Z',
    },
  ],
  architecture_options: [
    {
      id: 'arch-opt-1',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      name: 'Option 1: Hierarchical Multi-Agent System (Supervisor-Worker)',
      description:
        'A centralized supervisor agent coordinates specialized sub-agents with state rollback, context checkpointing, and dynamic tool assignment.',
      components: [
        { name: 'Supervisor Agent', role: 'Task decomposition & routing', type: 'Orchestrator' },
        { name: 'Worker Agents Pool', role: 'Specialized domain execution', type: 'Worker Pool' },
        { name: 'State Memory Bus', role: 'Short and long term session memory', type: 'Redis / In-Memory' },
      ],
      connections: [
        { from: 'Supervisor Agent', to: 'Worker Agents Pool', protocol: 'gRPC / Async Queue' },
        { from: 'Worker Agents Pool', to: 'State Memory Bus', protocol: 'PubSub' },
      ],
      pros: [
        'High modularity and separation of concerns',
        'Easy to add new domain-specific agents',
        'Granular error isolation per agent node',
      ],
      cons: [
        'Supervisor can become a bottleneck under heavy concurrent load',
        'Higher token consumption due to coordinator intermediary hops',
      ],
      risks: [
        'Supervisor misrouting if input problem statement is inherently ambiguous',
      ],
      estimated_cost: '$85 - $140 / month',
      estimated_latency: '450ms - 900ms',
      complexity: 'Medium',
      human_approval_required: true,
      is_selected: true,
      created_at: '2026-10-23T14:32:00Z',
    },
    {
      id: 'arch-opt-2',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      name: 'Option 2: Event-Driven Reactive Agent Pipeline (Choreography)',
      description:
        'Decentralized event-driven architecture where agents communicate reactively via Kafka topics without coordinator bottlenecks.',
      components: [
        { name: 'Event Broker', role: 'Publish-subscribe event distribution', type: 'Kafka / RabbitMQ' },
        { name: 'Reactive Agent Nodes', role: 'Listen to topics and emit results', type: 'Event Consumers' },
        { name: 'Observability Monitor', role: 'Distributed tracing and telemetry', type: 'OpenTelemetry' },
      ],
      connections: [
        { from: 'Reactive Agent Nodes', to: 'Event Broker', protocol: 'Event Stream' },
        { from: 'Event Broker', to: 'Observability Monitor', protocol: 'OTel Traces' },
      ],
      pros: [
        'Superior horizontal scalability and fault tolerance',
        'Extremely low coupling between agents',
        'Real-time streaming throughput',
      ],
      cons: [
        'Complex to debug multi-agent cascading event traces',
        'Eventual consistency requires idempotent tool designs',
      ],
      risks: [
        'Potential circular event loops if retry policies are misconfigured',
      ],
      estimated_cost: '$120 - $220 / month',
      estimated_latency: '250ms - 600ms',
      complexity: 'High',
      human_approval_required: false,
      is_selected: false,
      created_at: '2026-10-23T14:32:00Z',
    },
    {
      id: 'arch-opt-3',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      name: 'Option 3: Lean Hybrid Tool-Use Agent (Fast ReAct)',
      description:
        'Single unified agent leveraging Reasoning + Acting (ReAct) with direct parameterized tool calls and human confirmation gates.',
      components: [
        { name: 'ReAct Core Agent', role: 'Direct reasoning and dynamic tool execution', type: 'LLM Core' },
        { name: 'Tool Registry', role: 'Strictly typed API bindings and sandboxes', type: 'Tool Invoker' },
        { name: 'Approval Guardrail', role: 'Human sign-off on sensitive operations', type: 'Security Gateway' },
      ],
      connections: [
        { from: 'ReAct Core Agent', to: 'Tool Registry', protocol: 'Function Calling' },
        { from: 'ReAct Core Agent', to: 'Approval Guardrail', protocol: 'Synchronous Intercept' },
      ],
      pros: [
        'Fastest time-to-market and lowest infrastructure overhead',
        'Minimal latency and straightforward debugging',
        'Lowest operational cloud cost',
      ],
      cons: [
        'Limited scalability for tasks requiring long memory contexts',
        'Requires rigorous prompt guardrails against tool hallucinations',
      ],
      risks: [
        'Context window exhaustion during extensive tool iterations',
      ],
      estimated_cost: '$30 - $60 / month',
      estimated_latency: '180ms - 400ms',
      complexity: 'Low',
      human_approval_required: true,
      is_selected: false,
      created_at: '2026-10-23T14:32:00Z',
    },
  ],
  simulation_results: [
    {
      id: 'sim-01',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      architecture_id: 'arch-opt-1',
      scenario_name: 'High Concurrency Stress: Hierarchical Multi-Agent',
      input_data: { concurrent_users: 500, duration_seconds: 60, requests_per_sec: 1200 },
      expected_outcome: 'P99 latency remains below 1000ms with zero message drops.',
      simulated_outcome: 'P99 reached 840ms. Supervisor queued 42 tasks without packet drops.',
      result_status: 'pass',
      metrics: {
        throughput_rps: 1195,
        p95_latency_ms: 620,
        error_rate_pct: 0.04,
        cost_estimate_monthly: 98,
      },
      created_at: '2026-10-23T14:33:10Z',
    },
    {
      id: 'sim-02',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      architecture_id: 'arch-opt-1',
      scenario_name: 'External Tool Failure & Recovery (ERP Gateway Outage)',
      input_data: { injected_fault: 'ERP_HTTP_503', fault_duration_seconds: 15 },
      expected_outcome: 'Worker triggers exponential backoff and routes to standby queue.',
      simulated_outcome: 'Exponential backoff activated; successfully recovered state in 4.2s.',
      result_status: 'pass',
      metrics: {
        recovery_time_ms: 4200,
        error_rate_pct: 0.0,
      },
      created_at: '2026-10-23T14:33:15Z',
    },
    {
      id: 'sim-03',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      architecture_id: 'arch-opt-1',
      scenario_name: 'Ambiguous Query Resolution & Human Sign-off Intercept',
      input_data: { ambiguous_intent: true, requires_financial_commit: true },
      expected_outcome: 'System halts execution and dispatches human confirmation webhook.',
      simulated_outcome: 'Action intercepted. Approval token generated and notification queued.',
      result_status: 'pass',
      metrics: {
        approval_gate_passed: true,
      },
      created_at: '2026-10-23T14:33:20Z',
    },
  ],
  generated_files: [
    {
      id: 'gen-01',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      relative_path: 'app/main.py',
      filename: 'main.py',
      language: 'python',
      file_size: 2150,
      validation_status: 'passed',
      created_at: '2026-10-23T14:35:00Z',
      content: `"""Chrysalis AI Generated Agent Application."""
import asyncio
from app.agents.supervisor import SupervisorAgent
from app.core.config import settings

async def main():
    print(f"Starting {settings.PROJECT_NAME} Supervisor Agent...")
    supervisor = SupervisorAgent()
    await supervisor.run()

if __name__ == "__main__":
    asyncio.run(main())
`,
    },
    {
      id: 'gen-02',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      relative_path: 'app/agents/supervisor.py',
      filename: 'supervisor.py',
      language: 'python',
      file_size: 4890,
      validation_status: 'passed',
      created_at: '2026-10-23T14:35:00Z',
      content: `"""Hierarchical Supervisor Agent Orchestrator."""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SupervisorAgent:
    def __init__(self):
        self.active_workers = []

    async def route_task(self, task: Dict[str, Any]) -> str:
        logger.info(f"Routing task: {task.get('id')}")
        return "completed"
`,
    },
    {
      id: 'gen-03',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      relative_path: 'app/tools/registry.py',
      filename: 'registry.py',
      language: 'python',
      file_size: 3410,
      validation_status: 'passed',
      created_at: '2026-10-23T14:35:00Z',
      content: `"""Tool registry with human approval guardrails."""
from typing import Callable, Dict

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}

    def register(self, name: str, func: Callable):
        self._tools[name] = func
`,
    },
    {
      id: 'gen-04',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      relative_path: 'requirements.txt',
      filename: 'requirements.txt',
      language: 'text',
      file_size: 380,
      validation_status: 'passed',
      created_at: '2026-10-23T14:35:00Z',
      content: `pydantic>=2.7.0
fastapi>=0.111.0
uvicorn>=0.30.0
httpx>=0.27.0
redis>=5.0.0
`,
    },
    {
      id: 'gen-05',
      project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
      relative_path: 'README.md',
      filename: 'README.md',
      language: 'markdown',
      file_size: 2600,
      validation_status: 'passed',
      created_at: '2026-10-23T14:35:00Z',
      content: `# Enterprise Autonomous Supply Chain Assistant
Synthesized by Chrysalis AI Middleware.

## Architecture
Option 1: Hierarchical Multi-Agent System (Supervisor-Worker)

## Setup & Run
\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # or .\\.venv\\Scripts\\activate on Windows
pip install -r requirements.txt
python -m app.main
\`\`\`
`,
    },
  ],
  verdict: {
    category: 'hybrid',
    headline: 'Hybrid System (Deterministic Rules + Agentic Orchestration)',
    confidence: 0.93,
    explanation:
      'The requirement specification demands rigorous deterministic business validations (ERP transaction consistency, rate limits, audit checkpoints) alongside autonomous multi-agent reasoning for supplier anomaly remediation and adaptive routing.',
    deterministic_count: 5,
    agentic_count: 3,
    supporting_evidence: [
      'Section 1.2: "Order state changes must strictly satisfy relational schema constraints prior to commit."',
      'Section 2.4: "Autonomous agents dynamically evaluate supply disruptions and propose alternate vendor routes."',
      'Section 3.1: "Human operator sign-off required for order changes exceeding threshold."',
    ],
    assumptions: [
      'ERP system exposes REST or gRPC interface with idempotent endpoints.',
      'Low token consumption is prioritized over fully decentralized autonomous consensus.',
    ],
    risks_and_limitations: [
      'Token consumption will scale with vendor catalog size if context indexing is omitted.',
      'Human review gateway introduces latency if operators are offline.',
    ],
    recommended_next_step:
      'Proceed with Option 1 (Hierarchical Supervisor-Worker) to achieve clear separation between deterministic rules and autonomous LLM routing.',
  },
  specification: {
    project_goal:
      'Coordinate multi-step agent actions with dynamic routing, telemetry tracking, and transactional state recovery for supply chain operations.',
    confirmed_requirements: [
      'Autonomous Multi-Agent Workflow Orchestration (High Priority)',
      'Secure Tool and API Integration Protocol (High Priority)',
      'Human-in-the-Loop Review Gateway (Medium Priority)',
      'Sub-second Decision Latency under Load (High Priority)',
    ],
    autonomy_boundary: 'Supervised (Human Approval Required for Irreversible Operations)',
    data_mode: 'Local Sandboxed & Enterprise VPC',
    connector_preferences: ['PostgreSQL DB', 'ERP REST API', 'Kafka PubSub'],
    operational_constraints: ['Max latency 750ms', 'Token rate limiting', 'Full audit logging'],
    assumptions: ['Idempotent ERP updates', 'Continuous stock feed availability'],
    source_evidence: [
      'Page 1: Requirements dictate autonomous task execution and state recovery.',
      'Page 2: Human oversight required prior to irreversible ERP commits.',
    ],
    is_user_confirmed: true,
    confirmed_at: '2026-10-23T14:31:30Z',
  },
};

export const DEMO_VALIDATION_REPORT: ValidationReport = {
  project_id: 'e8d4cf72-0012-4eb1-b1e2-3e2840049cf2',
  total_files: 5,
  passed_files: 5,
  failed_files: 0,
  validation_status: 'passed',
  details: [
    { relative_path: 'app/main.py', filename: 'main.py', status: 'passed', error: null },
    { relative_path: 'app/agents/supervisor.py', filename: 'supervisor.py', status: 'passed', error: null },
    { relative_path: 'app/tools/registry.py', filename: 'registry.py', status: 'passed', error: null },
    { relative_path: 'requirements.txt', filename: 'requirements.txt', status: 'passed', error: null },
    { relative_path: 'README.md', filename: 'README.md', status: 'passed', error: null },
  ],
  timestamp: '2026-10-23T14:35:45Z',
};

export const DEFAULT_CLARIFICATION_QUESTIONS: ClarificationQuestion[] = [
  {
    id: 'q-goal',
    category: 'goal',
    categoryLabel: 'Primary Goal',
    question: 'What is the primary operational objective of the agent system?',
    description: 'Select the primary responsibility the generated agentic system should solve.',
    options: [
      { id: 'opt-autonomous-routing', label: 'Autonomous Routing & Orchestration', description: 'Decompose incoming tasks and coordinate sub-agents dynamically' },
      { id: 'opt-data-extraction', label: 'Structured Document & Data Extraction', description: 'Ingest unstructured feeds and extract strict tabular schemas' },
      { id: 'opt-copilot', label: 'Interactive Developer / Operator Copilot', description: 'Assists human operators with contextual recommendations and tool calls' },
    ],
    allow_custom: true,
    is_required: true,
  },
  {
    id: 'q-autonomy',
    category: 'autonomy',
    categoryLabel: 'Autonomy Level',
    question: 'What level of operational autonomy should be granted to the agents?',
    description: 'Define execution guardrails and human review thresholds.',
    options: [
      { id: 'opt-supervised', label: 'Supervised (Human-in-the-Loop)', description: 'Critical actions and state mutations pause for operator approval' },
      { id: 'opt-semi-autonomous', label: 'Semi-Autonomous with Rate Bounds', description: 'Autonomous within safe execution boundaries; alerts on anomaly' },
      { id: 'opt-fully-autonomous', label: 'Fully Autonomous Closed-Loop', description: 'Complete end-to-end execution with self-healing error recovery' },
    ],
    allow_custom: false,
    is_required: true,
  },
  {
    id: 'q-connectors',
    category: 'connectors',
    categoryLabel: 'Connectors & Integrations',
    question: 'Which external protocols and data stores must be bound to the system?',
    description: 'Select the primary interface connectors to generate.',
    options: [
      { id: 'opt-db-rest', label: 'PostgreSQL Database + REST API Client', description: 'Relational data store with synchronous HTTP tool bindings' },
      { id: 'opt-event-queue', label: 'Kafka / Redis Async Message Queue', description: 'High-throughput event stream pub-sub integration' },
      { id: 'opt-cli-sdk', label: 'CLI & Python SDK Library Only', description: 'Standalone command-line interface and modular library' },
    ],
    allow_custom: true,
    is_required: true,
  },
  {
    id: 'q-data-mode',
    category: 'data_mode',
    categoryLabel: 'Data Mode & Storage',
    question: 'What is the data persistence and privacy requirement?',
    description: 'Specify where conversation memory and execution traces are persisted.',
    options: [
      { id: 'opt-local-sandbox', label: 'Local Sandboxed & In-Memory', description: 'Zero external cloud logging; strictly local or ephemeral memory' },
      { id: 'opt-hybrid-cloud', label: 'Hybrid (PostgreSQL + Encrypted S3)', description: 'Relational session states in Postgres with file artifacts in S3' },
    ],
    allow_custom: false,
    is_required: true,
  },
  {
    id: 'q-constraints',
    category: 'constraints',
    categoryLabel: 'Constraints & Compliance',
    question: 'What operational constraints must the architecture enforce?',
    description: 'Define latency, throughput, or security requirements.',
    options: [
      { id: 'opt-latency-priority', label: 'Strict Sub-Second Latency (< 800ms)', description: 'Optimize for speed with lightweight models and parallel tool execution' },
      { id: 'opt-audit-trail', label: 'Strict Audit Logging & Zero Hallucination Guardrails', description: 'Cryptographic trace logs and multi-stage output validation' },
      { id: 'opt-cost-bounded', label: 'Cost-Bounded Token Consumption', description: 'Strict token caching and context window optimization' },
    ],
    allow_custom: true,
    is_required: true,
  },
];
