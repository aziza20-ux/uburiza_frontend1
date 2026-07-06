import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as enrollmentApi from '../enrollment_api';

const KEY = 'enrollments';
const PROGRESS_KEY = 'progress';

export function useMyEnrollments() {
  return useQuery({
    queryKey: [KEY],
    queryFn: enrollmentApi.getMyEnrollments,
    select: (data) => data.courses ?? [],
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollmentApi.enrollCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRedeemAccessCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollmentApi.redeemAccessCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCourseProgress(courseId) {
  return useQuery({
    queryKey: [PROGRESS_KEY, courseId],
    queryFn: () => enrollmentApi.getCourseProgress(courseId),
    select: (data) => data.progress,
    enabled: !!courseId,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: enrollmentApi.getAdminStats,
    enabled: !!localStorage.getItem('token'),
    select: (data) => ({
      ...data,
      total_learners: data.totalUsers ?? 0,
      active_courses: data.activeUsers ?? 0,
      total_revenue: data.revenue?.total ?? 0,
      paid_enrollments: data.revenue?.paidEnrollments ?? 0,
      pending_payments: data.revenue?.pendingPayments ?? 0,
      monthly_chart: data.monthly_chart ?? [],
      total_lessons: data.total_lessons ?? 0,
    }),
  });
}

export function useAdminLearners() {
  return useQuery({
    queryKey: ['adminLearners'],
    queryFn: enrollmentApi.getLearners,
    enabled: !!localStorage.getItem('token'),
  });
}

export function useMarkLessonComplete(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      console.log('🚀 API call: markLessonComplete', data);
      const result = await enrollmentApi.markLessonComplete(data);
      console.log('📝 API response: markLessonComplete', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎉 Mutation success:', data);
      queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: [KEY] });
      // Also invalidate certificates if a certificate was generated
      if (data?.certificate) {
        console.log('🏆 Certificate found, invalidating certificate queries');
        queryClient.invalidateQueries({ queryKey: ['certificates'] });
      }
    },
  });
}
