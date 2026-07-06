import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../auth';
import queryClient from '../query-client';
import { clearSession } from '../auth-session';

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminStats'] });
      qc.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: authApi.register });
}

export function useVerifyEmailMutation() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}

export function useResendVerificationMutation() {
  return useMutation({ mutationFn: authApi.resendVerification });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: authApi.resetPassword });
}

export function useLogoutMutation() {
  return useMutation({ mutationFn: authApi.logout });
}

export function useLogout({ setView, setUser, setUserRole }) {
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearSession({ setUser, setUserRole });
        queryClient.clear();
        setView('LandingPage');
      },
    });
  };

  return { handleLogout, isPending: logoutMutation.isPending };
}
