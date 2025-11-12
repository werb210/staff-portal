import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPipelineAISummary,
  getPipelineApplication,
  getPipelineBoard,
  getPipelineDocuments,
  getPipelineLenders,
  updatePipelineApplication,
  updatePipelineStage,
  type PipelineBoard,
  type PipelineMovePayload,
} from '../api/pipeline';

const PIPELINE_KEY = ['pipeline'];

export const usePipelineBoard = () =>
  useQuery({
    queryKey: PIPELINE_KEY,
    queryFn: getPipelineBoard,
  });

export const usePipelineApplication = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id],
    queryFn: () => getPipelineApplication(id),
    enabled: Boolean(id),
  });

export const usePipelineDocuments = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, 'documents'],
    queryFn: () => getPipelineDocuments(id),
    enabled: Boolean(id),
  });

export const usePipelineLenders = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, 'lenders'],
    queryFn: () => getPipelineLenders(id),
    enabled: Boolean(id),
  });

export const usePipelineAISummary = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, 'ai-summary'],
    queryFn: () => getPipelineAISummary(id),
    enabled: Boolean(id),
  });

export const usePipelineMutations = () => {
  const queryClient = useQueryClient();

  const stageMutation = useMutation({
    mutationFn: (payload: PipelineMovePayload) => updatePipelineStage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PIPELINE_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      updatePipelineApplication(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PIPELINE_KEY, variables.id] });
    },
  });

  return { stageMutation, updateMutation };
};

export type { PipelineBoard };
