// Chrysalis AI Helper Utilities

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    uploaded: 'Specification Uploaded',
    analyzing: 'Extracting Requirements...',
    analyzed: 'Requirements Extracted',
    analysis_failed: 'Analysis Failed',
    clarifying: 'Clarifications In-Progress',
    clarified: 'Clarifications Answered',
    spec_confirmed: 'Specification Confirmed',
    architectures_ready: 'Architectures Ready',
    architectures_failed: 'Architecture Synthesis Failed',
    simulating: 'Simulating Scenarios...',
    simulated: 'Simulations Completed',
    simulation_failed: 'Simulation Failed',
    architecture_selected: 'Architecture Selected',
    generating: 'Generating Code...',
    generated: 'Code Generated',
    generation_failed: 'Generation Failed',
    validating: 'Validating AST...',
    validated: 'AST Validated',
    validation_failed: 'Validation Failed',
  };
  return map[status] || status.replace(/_/g, ' ').toUpperCase();
}

export function getStatusBadgeClass(status: string): string {
  if (status.includes('fail')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (status.includes('validat') || status === 'generated' || status === 'spec_confirmed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status.includes('ing')) {
    return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function getPriorityBadgeClass(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getRequirementTypeBadgeClass(type: string): string {
  switch (type.toLowerCase()) {
    case 'agentic':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'functional':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'integration':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'non-functional':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
