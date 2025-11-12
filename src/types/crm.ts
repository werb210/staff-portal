export type CRMTaskStatus = 'open' | 'completed' | 'overdue';
export type CRMTaskPriority = 'low' | 'medium' | 'high';

export interface CRMContact {
  id: string;
  name: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  stage: string;
  owner?: string;
  status: 'lead' | 'active' | 'inactive';
  tags?: string[];
  lastInteractionAt?: string;
  nextFollowUpAt?: string;
  silo: 'BF' | 'SLF' | 'BI';
}

export interface CRMTask {
  id: string;
  contactId: string;
  title: string;
  description?: string;
  dueAt: string;
  status: CRMTaskStatus;
  priority: CRMTaskPriority;
  assignedTo?: string;
  silo: 'BF' | 'SLF' | 'BI';
}

export interface CRMReminder {
  id: string;
  contactId: string;
  scheduledFor: string;
  channel: 'sms' | 'email' | 'call';
  notes?: string;
  createdBy?: string;
  silo: 'BF' | 'SLF' | 'BI';
}

export interface CRMReminderPayload {
  contactId: string;
  scheduledFor: string;
  channel: 'sms' | 'email' | 'call';
  notes?: string;
}

export interface CRMTaskUpdatePayload {
  id: string;
  status: CRMTaskStatus;
}

export interface CRMContactAssignmentPayload {
  contactId: string;
  ownerId: string;
}
