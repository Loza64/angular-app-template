import { computed, inject, Signal } from '@angular/core';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { BaseEntity } from '../../sdk/entities/base-entity.model';
import { PaginationResponse } from '../../sdk/responses/pagination-response.model';
import { Service } from '../../sdk/service';

type QueryData<Entity extends BaseEntity> = PaginationResponse<Entity>;

const EMPTY_PAGINATION: PaginationResponse<never>['pagination'] = {
  total: 0,
  page: 1,
  pageSize: 0,
  nextCursor: '',
  pageCount: 0,
};

export interface InjectFindAllConfig<Entity extends BaseEntity> {
  service: Signal<Service<Entity>>;
  queryKey: Signal<unknown[]>;
  endpoint?: Signal<string | undefined>;
  queryParams?: Signal<Record<string, unknown>>;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
  enabled?: Signal<boolean>;
}

export function injectFindAll<Entity extends BaseEntity>(config: InjectFindAllConfig<Entity>) {
  const queryClient = inject(QueryClient);
  const params = computed(() => config.queryParams?.() ?? {});
  const endpoint = computed(() => config.endpoint?.());
  const stableQueryParams = computed(() => JSON.stringify(params()));
  const finalQueryKey = computed(() => [...config.queryKey(), endpoint() ?? null, stableQueryParams()] as const);

  const query = injectQuery(() => ({
    queryKey: finalQueryKey(),
    queryFn: () =>
      config.service().findAll({
        endpoint: endpoint(),
        config: {
          params: params(),
          onForbidden: config.onForbidden,
          onUnauthorized: config.onUnauthorized,
        },
      }),
    enabled: config.enabled ? config.enabled() : true,
  }));

  const getSafeCache = (old?: QueryData<Entity>): QueryData<Entity> =>
    old ?? { data: [], pagination: { ...EMPTY_PAGINATION } };

  const updateCacheData = (updater: (base: QueryData<Entity>) => QueryData<Entity>) => {
    queryClient.setQueryData<QueryData<Entity>>(finalQueryKey() as unknown as unknown[], (old) =>
      updater(getSafeCache(old)),
    );
  };

  const addItemInCache = (item: Entity) => {
    updateCacheData((base) => {
      if (base.data.some((i) => i.id === item.id)) return base;
      return { ...base, data: [item, ...base.data] };
    });
  };

  const updateItemInCache = (id: string | number, updater: (item: Entity) => Entity) => {
    updateCacheData((base) => ({
      ...base,
      data: base.data.map((item) => (item.id === id ? updater(item) : item)),
    }));
  };

  const removeItemInCache = (id: string | number) => {
    updateCacheData((base) => ({
      ...base,
      data: base.data.filter((item) => item.id !== id),
    }));
  };

  const emptyCache = () => {
    updateCacheData(() => getSafeCache());
  };

  return {
    ...query,
    finalQueryKey,
    addItemInCache,
    updateItemInCache,
    removeItemInCache,
    emptyCache,
  };
}
