import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as courseApi from '../course_api';
import * as moduleApi from '../module_api';
import * as lessonApi from '../lesson_api';
import { generateAccessCodes, getCoursesWithAccessCodes, getAccessCodesByCourse, getAdminAllCourses, deleteExpiredAccessCodes } from '../enrollment_api';

const COURSES_KEY = 'courses';

export function useCourses(params) {
  return useQuery({
    queryKey: [COURSES_KEY, params],
    queryFn: () => courseApi.listCourses(params),
    select: (data) => data.courses,
  });
}

export function useCourse(id) {
  return useQuery({
    queryKey: [COURSES_KEY, id],
    queryFn: () => courseApi.getCourseById(id),
    select: (data) => data.course,
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY] }),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseApi.updateCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
      queryClient.setQueryData([COURSES_KEY, data.course.id], data);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseApi.deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY] }),
  });
}

// ─── Module hooks ────────────────────────────────────────────────────────────
export function useCreateModule(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moduleApi.createModule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] }),
  });
}

export function useUpdateModule(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moduleApi.updateModule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] }),
  });
}

export function useDeleteModule(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moduleApi.deleteModule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] }),
  });
}

// ─── Lesson hooks ─────────────────────────────────────────────────────────────
export function useCreateLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonApi.createLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] }),
  });
}

export function useUpdateLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonApi.updateLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] }),
  });
}

export function useDeleteLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonApi.deleteLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] }),
  });
}

export function useDeleteExpiredCodes(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteExpiredAccessCodes(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessCodes', courseId] });
      queryClient.invalidateQueries({ queryKey: ['accessCodeCourses'] });
    },
  });
}

export function useGenerateAccessCodes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateAccessCodes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessCodeCourses'] }),
  });
}

export function useCoursesWithAccessCodes() {
  return useQuery({
    queryKey: ['accessCodeCourses'],
    queryFn: getCoursesWithAccessCodes,
    select: (data) => (Array.isArray(data) ? data : data.courses ?? []),
    enabled: !!localStorage.getItem('token'),
    staleTime: 0,
  });
}

export function useAdminAllCourses() {
  return useQuery({
    queryKey: ['adminAllCourses'],
    queryFn: getAdminAllCourses,
    select: (data) => (Array.isArray(data) ? data : data.courses ?? []),
    staleTime: 0,
  });
}

export function useAccessCodesByCourse(courseId) {
  return useQuery({
    queryKey: ['accessCodes', courseId],
    queryFn: () => getAccessCodesByCourse(courseId),
    select: (data) => (Array.isArray(data) ? data : data.codes ?? []),
    enabled: !!courseId,
  });
}

export function useAdminLesson(id) {
  return useQuery({
    queryKey: ['adminLesson', id],
    queryFn: () => lessonApi.getAdminLessonById(id),
    select: (data) => data.lesson,
    enabled: !!id && id !== '__new__',
  });
}

export function useLesson(id) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonApi.getLessonById(id),
    select: (data) => data.lesson,
    enabled: !!id,
  });
}
