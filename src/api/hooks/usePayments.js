import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as paymentApi from '../payment_api';

export function useInitiatePayment() {
  return useMutation({ mutationFn: paymentApi.initiatePayment });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.confirmPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: paymentApi.myPayments,
    select: (data) => data.payments ?? [],
  });
}
