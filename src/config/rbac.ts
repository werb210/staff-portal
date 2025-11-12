import type { ModuleAccessRule, PortalModule, PortalPermission, Silo } from '../types/rbac';

export const MODULE_LABELS: Record<PortalModule, string> = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  documents: 'Documents',
  lenders: 'Lenders & Products',
  pipeline: 'Pipeline',
  communication: 'Communication Center',
  admin: 'Admin',
  ai: 'AI Insights',
};

const baseModules: ModuleAccessRule[] = [
  { module: 'dashboard', enabled: true, requiredPermissions: [] },
  { module: 'applications', enabled: true, requiredPermissions: ['applications:create'] },
  { module: 'documents', enabled: true, requiredPermissions: ['documents:review'] },
  { module: 'lenders', enabled: true, requiredPermissions: ['lenders:view'] },
  { module: 'pipeline', enabled: true, requiredPermissions: ['pipeline:view'], stages: ['New', 'In Review', 'Approved', 'Funded'] },
  { module: 'communication', enabled: true, requiredPermissions: ['communication:sms', 'communication:email'] },
  { module: 'admin', enabled: true, requiredPermissions: ['admin:retry-queue'] },
  { module: 'ai', enabled: true, requiredPermissions: ['ai:ocr', 'ai:summarize'] },
];

export const SILO_ACCESS: Record<Silo, ModuleAccessRule[]> = {
  BF: baseModules.map((rule) => ({
    ...rule,
    requiredPermissions: rule.requiredPermissions?.map(normalizeBFPermissions),
  })),
  SLF: baseModules.map((rule) => ({
    ...rule,
    stages: rule.module === 'pipeline'
      ? ['Submitted', 'Underwriting', 'Cleared', 'Funded']
      : rule.stages,
  })),
  BI: baseModules.map((rule) => ({
    ...rule,
    enabled: rule.module === 'dashboard',
  })),
};

function normalizeBFPermissions(permission: PortalPermission): PortalPermission {
  if (permission === 'applications:create') {
    return 'applications:create';
  }
  return permission;
}

export function isModuleEnabled(silo: Silo, module: PortalModule, permissions: PortalPermission[] = []): boolean {
  const rule = SILO_ACCESS[silo].find((r) => r.module === module);
  if (!rule) return false;
  if (!rule.enabled) return false;
  if (!rule.requiredPermissions || rule.requiredPermissions.length === 0) {
    return true;
  }
  return rule.requiredPermissions.every((perm) => permissions.includes(perm));
}

export function getPipelineStagesForSilo(silo: Silo): string[] {
  const rule = SILO_ACCESS[silo].find((r) => r.module === 'pipeline');
  return rule?.stages ?? [];
}
