export type Silo = 'BF' | 'SLF' | 'BI';

export type Role = 'admin' | 'manager' | 'agent' | 'analyst';

export type PortalModule =
  | 'dashboard'
  | 'applications'
  | 'documents'
  | 'lenders'
  | 'pipeline'
  | 'communication'
  | 'admin'
  | 'ai';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  silo: Silo;
  permissions: PortalPermission[];
}

export type PortalPermission =
  | 'applications:create'
  | 'applications:submit'
  | 'applications:upload'
  | 'applications:complete'
  | 'documents:review'
  | 'documents:update-status'
  | 'lenders:view'
  | 'lenders:send'
  | 'pipeline:view'
  | 'pipeline:transition'
  | 'communication:sms'
  | 'communication:email'
  | 'communication:call'
  | 'admin:retry-queue'
  | 'admin:backups'
  | 'ai:ocr'
  | 'ai:summarize'
  | 'ai:risk'
  | 'ai:lender-match';

export interface ModuleAccessRule {
  module: PortalModule;
  enabled: boolean;
  requiredPermissions?: PortalPermission[];
  stages?: string[];
}

export interface SiloAccessRule {
  silo: Silo;
  modules: ModuleAccessRule[];
}
