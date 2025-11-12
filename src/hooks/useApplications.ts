import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCachedQuery } from './useCachedQuery';
import { getApplications, submitApplication, uploadDocument } from '../api/applications';
import type { Application, ApplicationPayload } from '../utils/types';

export function useApplications() {
  return useCachedQuery<Application[]>(['applications'], getApplications, 'applications');
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    }
  });
}

export function useUploadDocument(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => uploadDocument(applicationId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}

export type { Application, ApplicationPayload };
