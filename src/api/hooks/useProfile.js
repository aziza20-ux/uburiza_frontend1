import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, updateMyProfile, changePassword } from '../profile_api';
import { useAppContext } from '../../context/AppContext';

export function useMyProfile() {
  const { isAuthenticated } = useAppContext();
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myProfile'] }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
