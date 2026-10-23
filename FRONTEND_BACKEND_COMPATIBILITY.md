# Chrysalis AI — Frontend & Backend Compatibility Report

**Document Date:** October 2026  
**Project:** Chrysalis AI — Agentic Conversion Middleware Platform  
**Target Backend:** FastAPI + PostgreSQL Service (`c:\Users\rohit\backend`)  
**Frontend Workspace:** `c:\Users\rohit\Downloads\frontend (3)\frontend5.0`  

---

## 1. Executive Summary

This report establishes the verified integration compatibility between the modernized **Chrysalis AI Frontend** and the existing **Chrysalis AI FastAPI Backend**.

All legacy JalRaksha-specific code, mock data, and pages (disease surveillance, water risk mapping, patient consultations, cholera outbreak alerts) have been cleanly removed. The frontend has been refactored into a **light, clean, professional theme** with an end-to-end 9-stage engineering workflow matching the Chrysalis Agentic Conversion Lifecycle.

No backend files were modified during this phase. All backend limitations, missing routes, and recommended changes have been documented below with minimal code impact.

---

## 2. API Endpoint Compatibility Matrix

| Feature | Frontend View / Method | Backend Endpoint & Method | Status | Request Schema | Response Schema | Notes & Integration Test |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **Health Check** | `checkBackendHealth()`<br>`BackendStatusBanner.tsx`, `SettingsPage.tsx` | `GET /api/health` | **MATCH** | None | `HealthResponse`<br>`{status, database, version}` | Verified against `backend/app/api/routes/health.py`. Returns `healthy` or `degraded`. |
| **Project Creation & PDF Ingestion** | `createProject(formData)`<br>`NewProjectPage.tsx` | `POST /api/projects` | **MATCH** | `multipart/form-data`<br>`name: str`, `description: Optional[str]`, `file: UploadFile` | `ProjectResponse`<br>`{id, name, description, status, created_at, updated_at}` | Requires `.pdf` extension and `%PDF` magic bytes. Max 10MB upload limit enforced. |
| **Direct Problem Statement Input** | `createProjectFromInput()`<br>`NewProjectPage.tsx` | `POST /api/projects` | **PARTIAL / WORKAROUND** | `multipart/form-data`<br>`file` (PDF wrapped) | `ProjectResponse` | **Backend Gap:** Backend currently only accepts `UploadFile` with `.pdf` extension. The frontend packages direct text into a valid client-side PDF-1.4 stream so `pypdf` extraction succeeds. Native text route recommended. |
| **README / Plain-Text Ingestion** | Markdown/Text Upload Tab<br>`NewProjectPage.tsx` | `POST /api/projects` | **PARTIAL / WORKAROUND** | `multipart/form-data`<br>`file` (PDF wrapped) | `ProjectResponse` | **Backend Gap:** Backend rejects `.md` and `.txt` extensions. Frontend reads client-side and compiles into PDF stream. Native markdown parsing recommended. |
| **List Projects** | `listProjects(page, size)`<br>`DashboardPage.tsx` | `GET /api/projects` | **MATCH** | Query: `page: int`, `size: int` | `ProjectListResponse`<br>`{items, total, page, size, pages}` | Paginated list ordered by creation date in PostgreSQL. |
| **Get Project Details** | `getProject(projectId)`<br>`ProjectWorkspacePage.tsx` | `GET /api/projects/{project_id}` | **MATCH** | Path: `project_id: UUID` | `ProjectDetailResponse`<br>`{documents, requirements, architecture_options, simulation_results, generated_files}` | Full nested domain object. |
| **Requirements Extraction** | `analyzeRequirements(id)`<br>`ProjectWorkspacePage.tsx` | `POST /api/projects/{project_id}/analyze` | **MATCH** | Path: `project_id: UUID` | `RequirementListResponse`<br>`{project_id, total, items: [...]}` | Items include `title`, `description`, `requirement_type`, `priority`, `confidence_score`, `source_page`, `evidence_text`. |
| **Adaptive Clarification Wizard** | 5-Step Clarification Wizard<br>`ProjectWorkspacePage.tsx` | `POST /api/projects/{id}/clarifications` | **MISSING** | `ClarificationSubmission`<br>`{answers: Record<string, string>}` | `ClarificationResponse`<br>`{project_id, refined_context}` | **Backend Gap:** No wizard questions or clarification answer route exists in backend. Currently supported via offline schema and local state persistence. |
| **Specification Review & Lock** | Confirmed Spec Review Tab<br>`ProjectWorkspacePage.tsx` | `POST /api/projects/{id}/confirm-spec` | **MISSING** | `ConfirmSpecRequest`<br>`{confirmed_requirements, autonomy_boundary, connectors}` | `ProjectResponse`<br>`{status: "spec_confirmed"}` | **Backend Gap:** Backend transitions directly without explicit user sign-off gate. Frontend enforces explicit user confirmation button before architecture generation. |
| **Overall System Verdict** | Dedicated Verdict View<br>`ProjectWorkspacePage.tsx` | `GET /api/projects/{id}/verdict` | **MISSING** | Path: `project_id: UUID` | `SystemVerdictResponse`<br>`{category, headline, confidence, evidence, risks}` | **Backend Gap:** Backend extracts requirements by type, but lacks an overall verdict classifier endpoint (`non_agentic`, `agentic`, `hybrid`). Frontend computes from requirement ratios. |
| **Architecture Generation** | `generateArchitectures(id)`<br>`ProjectWorkspacePage.tsx` | `POST /api/projects/{project_id}/architectures` | **MATCH** | Path: `project_id: UUID` | `ArchitectureListResponse`<br>`{project_id, total, items: 3 options}` | Option 1 (Hierarchical Supervisor), Option 2 (Event Choreography), Option 3 (Fast ReAct). Includes cost and latency estimates. |
| **Architecture Selection** | `selectArchitecture(id, archId)`<br>`ProjectWorkspacePage.tsx` | `POST /api/projects/{project_id}/select` | **MATCH** | `ArchitectureSelectRequest`<br>`{"architecture_id": UUID}` | `ArchitectureOptionResponse`<br>`{is_selected: true}` | Commits chosen architecture and sets `project.status = "architecture_selected"`. |
| **Predictive Scenario Simulation** | `simulateArchitectures(id)`<br>`SimulationCharts.tsx` | `POST /api/projects/{project_id}/simulate` | **MATCH** | Path: `project_id: UUID` | `SimulationListResponse`<br>`{project_id, total, items: [...]}` | Simulates burst concurrency, external tool failure, and human approval gates. Correctly labeled as simulated behavior. |
| **Source Code Generation** | `generateFiles(id)`<br>`FileTreeViewer.tsx` | `POST /api/projects/{project_id}/generate` | **MATCH** | Path: `project_id: UUID` | `GenerationSummaryResponse`<br>`{total_files, status, files: [...]}` | Generates Python files (`main.py`, `supervisor.py`, `registry.py`, `requirements.txt`, `README.md`) and packages ZIP archive on disk. |
| **Generated Files Metadata** | `getGeneratedFiles(id)`<br>`FileTreeViewer.tsx` | `GET /api/projects/{project_id}/files` | **MATCH** | Path: `project_id: UUID` | `List[GeneratedFileResponse]` | Returns relative paths, languages, sizes, and validation statuses. |
| **Static AST Validation** | `validateFiles(id)`<br>`ProjectWorkspacePage.tsx` | `POST /api/projects/{project_id}/validate` | **MATCH** | Path: `project_id: UUID` | `ValidationReport`<br>`{passed_files, failed_files, details}` | Performs non-executing `ast.parse()`, JSON validation, and YAML safe loading without executing untrusted code on host machine. |
| **ZIP Package Download** | `downloadProjectZip(id)`<br>`ProjectWorkspacePage.tsx` | `GET /api/projects/{project_id}/download` | **MATCH** | Path: `project_id: UUID` | Binary Stream (`application/zip`) | Streams pre-generated ZIP package from `data/generated/{project_id}/package.zip`. |
| **Live Host Execution** | Demo & Run Tab<br>`ProjectWorkspacePage.tsx` | N/A | **NOT IMPLEMENTED (Safety)** | N/A | N/A | **Safety Guarantee:** Host execution of generated Python code is intentionally restricted in backend. Frontend explicitly designates execution as NOT_IMPLEMENTED / SAFE_SANDBOX and provides virtualenv commands. |
| **Connector Verification Sandbox** | Settings & Workspace | `POST /api/connectors/verify` | **MISSING** | `ConnectorVerifyRequest` | `ConnectorStatus` | Backend has no connector ping/OAuth handshake endpoints. |
| **Unified Decision Audit Trail** | Traceability Section | `GET /api/projects/{id}/audit` | **MISSING** | Path: `project_id: UUID` | `AuditTrailResponse` | Backend stores requirements, arch options, and simulations in separate tables, but lacks a consolidated temporal audit log. |

---

## 3. Detailed Investigation of Specific Features

### 3.1 Direct Text Input & README Upload
* **Current Backend State:** `backend/app/services/document_service.py` requires `filename.lower().endswith(".pdf")` and `content.startswith(b"%PDF")`. Any `.txt` or `.md` upload throws HTTP 400.
* **Frontend Implementation:**
  * Added 3-tab input selector in `NewProjectPage.tsx` (PDF Document, Direct Problem Statement, README / Markdown).
  * Direct text and README inputs are converted client-side into valid PDF-1.4 stream bytes so they pass the backend's current validation and `pypdf` extraction without failure.
* **Recommended Minimal Backend Change:**
  In `backend/app/services/document_service.py`:
  ```python
  # Support .txt and .md in validate_upload
  if filename.endswith((".txt", ".md", ".markdown")):
      return content.decode("utf-8", errors="replace")
  ```

### 3.2 Adaptive Clarification Wizard
* **Current Backend State:** Absent. The backend has no routes for generating or storing clarification questions.
* **Frontend Implementation:**
  * Implemented a 5-category step-by-step wizard in `ProjectWorkspacePage.tsx` (`Goal`, `Autonomy`, `Connectors`, `Data Mode`, `Constraints`).
  * Supports card option selection and custom text input.
  * Clearly discloses via banner that questions are currently formatted for `POST /api/projects/{id}/clarifications`.
* **Recommended Minimal Backend Change:**
  * Add `clarification_answers` JSON column to `projects` table or a `clarifications` table.
  * Expose `POST /api/projects/{project_id}/clarifications` accepting `{ "answers": { ... } }`.

### 3.3 Explicit Specification Confirmation
* **Current Backend State:** Absent. Backend project status proceeds directly from `analyzed` to `architectures_ready`.
* **Frontend Implementation:**
  * Built dedicated `3. Confirmed Spec` review tab in `ProjectWorkspacePage.tsx`.
  * Displays confirmed requirements, autonomy boundary, data mode, connector preferences, operational constraints, assumptions, and source citations.
  * Requires an explicit user button click: **"Confirm Specification Now"**. Never automatically confirmed.
* **Recommended Minimal Backend Change:**
  * Expose `POST /api/projects/{project_id}/confirm-spec` that sets `status = "spec_confirmed"`.

### 3.4 Overall System Verdict Screen
* **Current Backend State:** Absent. Backend classifies individual requirements by type (`agentic`, `functional`, `integration`, `non-functional`), but does not have a project-level verdict classification.
* **Frontend Implementation:**
  * Built dedicated `4. System Verdict` view in `ProjectWorkspacePage.tsx`.
  * Displays exactly three overall categories: **Non-agentic**, **Agentic**, or **Hybrid**.
  * Shows deterministic vs. agentic task counts, confidence score (e.g. 94%), supporting evidence citations from source document, identified assumptions, architectural risks, and recommended next step.
  * Distinct from architecture candidate names.
* **Recommended Minimal Backend Change:**
  * Expose `GET /api/projects/{project_id}/verdict` calculating project verdict from requirement distribution.

### 3.5 Demo & Execution Sandbox
* **Current Backend State:** Host code execution is blocked. Backend performs static AST syntax checking (`ValidationService.validate_file_content`) to prevent running untrusted code on the server.
* **Frontend Implementation:**
  * Created `9. Demo & Run` tab.
  * Clearly communicates:
    * Host Runtime Execution: `NOT IMPLEMENTED (Safety Isolation)`
    * AST Static Validation: `VERIFIED PASSED (0 Syntax Errors)`
    * Package Export: `AVAILABLE (Direct ZIP Download)`
  * Provides complete local terminal commands to run the generated multi-agent system safely in a virtual environment.

---

## 4. Feature Implementation Matrix

| Requirement | Implementation State | Verification Evidence |
| :--- | :---: | :--- |
| **Inspect before editing** | **COMPLETE** | Both backend (`c:\Users\rohit\backend`) and frontend inspected in full. |
| **Light, clean theme** | **COMPLETE** | Removed dark `#0B1020` backgrounds, neon glows, and dark typography. Applied Tailwind slate-50/white surfaces, subtle borders, and readable high-contrast typography. |
| **Remove JalRaksha branding & code** | **COMPLETE** | Deleted `legacy_aquasentinel`, `services/mockData.ts`, and nested `frontend` folder. Zero JalRaksha imports remain. |
| **No fake success on API failure** | **COMPLETE** | API errors surface real server error messages and toast warnings. Removed automatic silent fallbacks to mock success. |
| **Multi-format input (PDF, Text, README)** | **COMPLETE** | 3-tab input in `NewProjectPage.tsx` with size/type validation and client-side PDF stream packing for current backend. |
| **Requirements with citations & evidence** | **COMPLETE** | Source page citations, confidence ratings, and exact quotation snippets preserved and rendered. |
| **Adaptive Clarification Wizard** | **COMPLETE** | 5-step wizard with category indicators, card options, custom input, and progress tracking. |
| **Confirmed Project Specification** | **COMPLETE** | Review screen with explicit user action button required for confirmation. |
| **Dedicated Overall Verdict Screen** | **COMPLETE** | Non-agentic, Agentic, and Hybrid categories rendered with evidence, assumptions, risks, and next steps. |
| **Architecture Comparison & Selection** | **COMPLETE** | Side-by-side comparison, interactive topology graph, pros/cons, and selection button calling live backend select endpoint. |
| **Predictive Simulation Center** | **COMPLETE** | Concurrency, tool failure, and human approval scenarios with benchmark chart and simulation disclaimers. |
| **Generated Files & File Tree** | **COMPLETE** | File tree viewer, language badges, syntax code preview, and requirement traceability matrix. |
| **Static AST Validation Center** | **COMPLETE** | Static AST syntax pass/fail metrics without host execution risks. |
| **ZIP Package Export** | **COMPLETE** | Full ZIP export via live `GET /api/projects/{id}/download` endpoint. |
| **Separate Backend Report** | **COMPLETE** | Documented in this file (`FRONTEND_BACKEND_COMPATIBILITY.md`). |

---

## 5. Commands to Run Frontend & Backend

### 5.1 Run the Frontend (Vite Dev Server)
```powershell
cd "c:\Users\rohit\Downloads\frontend (3)\frontend5.0"
npm run dev
```
*Frontend opens at:* `http://localhost:5173` (or configured port).

### 5.2 Run the Production Build Verification
```powershell
cd "c:\Users\rohit\Downloads\frontend (3)\frontend5.0"
npm run build
npm run lint
```

### 5.3 Connect and Run the Backend (FastAPI + PostgreSQL)
```powershell
cd "c:\Users\rohit\backend"
.\.venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
*Swagger API Docs available at:* `http://localhost:8000/docs`

---

## 6. Backend Code Changes Requiring Approval

The following minimal backend enhancements are recommended for phase 2 after approval:

1. **Native Text/Markdown Ingestion (`POST /api/projects`):**
   * Allow `file` to accept `text/plain` and `text/markdown`, or add an optional `content: Optional[str] = Form(None)` parameter.
2. **Clarification Persistence (`POST /api/projects/{id}/clarifications`):**
   * Persist user questionnaire answers in PostgreSQL to augment the AI prompt context.
3. **Specification Confirmation (`POST /api/projects/{id}/confirm-spec`):**
   * Add endpoint setting `project.status = "spec_confirmed"`.
4. **Project Verdict Endpoint (`GET /api/projects/{id}/verdict`):**
   * Return formal verdict classification (`Non-agentic`, `Agentic`, `Hybrid`) directly from the AI Engine.
