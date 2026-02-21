import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from './apiClient';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export function useApi<T>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<T, AxiosError<ApiError>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, AxiosError<ApiError>>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await apiClient.get<{ data: T }>(url);
      return response.data.data;
    },
    ...options,
  });
}

export function useApiMutation<TData, TVariables = void>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: Omit<UseMutationOptions<TData, AxiosError<ApiError>, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, AxiosError<ApiError>, TVariables>({
    mutationFn: async (variables) => {
      let finalUrl = url;
      let data = variables;

      if (variables && typeof variables === 'object') {
        const vars = variables as Record<string, any>;
        for (const [key, value] of Object.entries(vars)) {
          if (finalUrl.includes(`{${key}}`)) {
            finalUrl = finalUrl.replace(`{${key}}`, String(value));
            data = { ...vars };
            delete (data as Record<string, any>)[key];
          }
        }
      }

      const response = await apiClient[method]<{ data: TData }>(finalUrl, data);
      return response.data.data;
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useInvalidateQuery() {
  const queryClient = useQueryClient();
  return (key: string | string[]) => {
    queryClient.invalidateQueries({
      queryKey: Array.isArray(key) ? key : [key],
    });
  };
}
