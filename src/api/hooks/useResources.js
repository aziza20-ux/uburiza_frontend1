import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as resourceApi from '../resource_api';

const KEY = 'resources';

export function useResources(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => resourceApi.listResources(params),
    select: (data) => data.resources ?? [],
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resourceApi.createResource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resourceApi.updateResource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resourceApi.deleteResource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
