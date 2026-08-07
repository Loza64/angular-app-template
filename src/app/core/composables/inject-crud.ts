import { inject, Signal } from '@angular/core';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { BaseEntity } from '../../sdk/entities/base-entity.model';
import {
  CreateParams, DeleteParams, FindByIdParams,
  FindByParams, RestoreParams, ServiceConfig, UpdateParams,
} from '../../sdk/params-service.model';
import { Service } from '../../sdk/service';

export interface InjectCrudConfig {
  queryKey: string | string[];
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}

type WithMeta = {
  config?: ServiceConfig;
  onForbidden?: () => void;
  onUnauthorized?: () => void;
};

export function injectCrud<Entity extends BaseEntity>(
  service: Signal<Service<Entity>>,
  { queryKey, onUnauthorized, onForbidden }: InjectCrudConfig,
) {
  const queryClient = inject(QueryClient);
  const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];

  const injectConfig = <T extends WithMeta>(params: T): T => ({
    ...params,
    config: {
      ...params.config,
      onForbidden: onForbidden ?? params.onForbidden,
      onUnauthorized: onUnauthorized ?? params.onUnauthorized,
    },
  });

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = injectMutation(() => ({
    mutationFn: (params: CreateParams<Entity>) => service().create(injectConfig(params)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  }));

  const updateMutation = injectMutation(() => ({
    mutationFn: (params: UpdateParams<Entity>) => service().update(injectConfig(params)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  }));

  const deleteMutation = injectMutation(() => ({
    mutationFn: (params: DeleteParams) => service().delete(injectConfig(params)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  }));

  const restoreMutation = injectMutation(() => ({
    mutationFn: (params: RestoreParams) => service().restore(injectConfig(params)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: normalizedQueryKey }),
  }));

  // ─── Queries ────────────────────────────────────────────────────────────────
  const findById = (params: Signal<FindByIdParams>) =>
    injectQuery(() => {
      const value = params();
      return {
        queryKey: [...normalizedQueryKey, value.id],
        queryFn: () => service().findById(injectConfig(value)),
        enabled: !!value.id,
      };
    });

  const findBy = (params: Signal<FindByParams>) =>
    injectQuery(() => {
      const value = params();
      return {
        queryKey: [...normalizedQueryKey, value.path],
        queryFn: () => service().findBy(injectConfig(value)),
        enabled: !!value.path,
      };
    });

  return {
    create: (params: CreateParams<Entity>) => createMutation.mutateAsync(params),
    update: (params: UpdateParams<Entity>) => updateMutation.mutateAsync(params),
    delete: (params: DeleteParams) => deleteMutation.mutateAsync(params),
    restore: (params: RestoreParams) => restoreMutation.mutateAsync(params),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRestoring: restoreMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    restoreError: restoreMutation.error,

    findById,
    findBy,
  };
}
