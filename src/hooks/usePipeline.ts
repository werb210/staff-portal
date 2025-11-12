import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPipelineAISummary,
  getPipelineCard,
  getPipelineBoards,
  getPipelineDocuments,
  getPipelineLenders,
  movePipelineCard,
  updatePipelineCard,
  type PipelineColumn,
  type PipelineMovePayload,
} from '../api/pipeline';

const PIPELINE_KEY = ['pipeline'];

export const usePipelineBoard = () =>
  useQuery({
    queryKey: PIPELINE_KEY,
    queryFn: getPipelineBoards,
  });

export const usePipelineApplication = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id],
    queryFn: () => getPipelineCard(id),
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
    mutationFn: (payload: PipelineMovePayload) => movePipelineCard(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PIPELINE_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) => updatePipelineCard(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PIPELINE_KEY, variables.id] });
    },
  });

  return { stageMutation, updateMutation };
};

export type { PipelineColumn };
