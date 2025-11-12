export interface User {
  id: string;
  name: string;
  email: string;
  silo: string;
  avatarUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read?: boolean;
}

export interface Application {
  id: string;
  applicantName: string;
  product: string;
  status: string;
  stage: string;
  updatedAt: string;
  submittedAt: string;
  amount: number;
}

export interface ApplicationPayload {
  applicantName: string;
  product: string;
  amount: number;
  notes?: string;
}

export interface Document {
  id: string;
  applicationId: string;
  name: string;
  status: 'pending' | 'accepted' | 'rejected';
  uploadedAt: string;
  url: string;
}

export interface LenderProduct {
  id: string;
  name: string;
  rate: number;
  maxAmount: number;
  minCreditScore: number;
}

export interface Lender {
  id: string;
  name: string;
  status: 'active' | 'paused';
  products: LenderProduct[];
  contactEmail: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  applications: Application[];
}

export interface SmsLog {
  id: string;
  to: string;
  body: string;
  sentAt: string;
  status: 'queued' | 'sent' | 'failed';
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: string;
  companyId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
}

export interface RetryQueueItem {
  id: string;
  job: string;
  attempts: number;
  lastAttemptAt: string;
  status: 'queued' | 'retrying' | 'failed';
}

export interface BackupSnapshot {
  id: string;
  createdAt: string;
  sizeMb: number;
  location: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  services: Record<string, 'ok' | 'degraded' | 'down'>;
  timestamp: string;
}
