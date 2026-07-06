import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as certApi from '../certificate_api';

const KEY = 'certificates';

export function useUserCertificates(userId) {
  return useQuery({
    queryKey: [KEY, userId],
    queryFn: () => certApi.getUserCertificates(userId),
    select: (data) => data.certificates ?? [],
    enabled: !!userId,
  });
}

export function useGenerateCertificate(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: certApi.generateCertificate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, userId] }),
  });
}

export function useAutoGenerateCertificate(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: certApi.autoGenerateCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, userId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useVerifyCertificate(uid) {
  return useQuery({
    queryKey: [KEY, 'verify', uid],
    queryFn: () => certApi.verifyCertificate(uid),
    enabled: !!uid,
  });
}
