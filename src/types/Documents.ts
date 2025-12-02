export interface DocumentVersion {
  id: string;
  version: number;
  createdAt: string;
  downloadUrl: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  category: string;
  previewUrl?: string;
  downloadUrl?: string;
  s3Key?: string | null;
  versions?: DocumentVersion[];
}
