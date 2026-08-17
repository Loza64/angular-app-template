import { computed, inject, Signal } from '@angular/core';
import { injectInfiniteQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { BaseEntity } from '../../sdk/entities/base-entity.model';
import { PaginationResponse } from '../../sdk/responses/pagination-response.model';
import { Service } from '../../sdk/service';

type QueryData<Entity extends BaseEntity> = PaginationResponse<Entity>;

interface InfiniteCache<Entity extends BaseEntity> {
  pages: QueryData<Entity>[];
  pageParams: unknown[];
}

const EMPTY_INFINITE_CACHE: InfiniteCache<never> = {
  pages: [],
  pageParams: [],
};

export interface InjectInfiniteFindAllConfig<Entity extends BaseEntity, PageParam = Record<string, unknown>> {
  service: Signal<Service<Entity>>;
  queryKey: Signal<unknown[]>;
  endpoint?: Signal<string | undefined>;
  queryParams?: Signal<Record<string, unknown>>;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
  enabled?: Signal<boolean>;
  getNextPageParam: (
    lastPage: QueryData<Entity>,
    allPages: QueryData<Entity>[],
    lastPageParam: PageParam,
    allPageParams: PageParam[],
  ) => PageParam | undefined | null;
  initialPageParam: PageParam;
}

export function injectInfiniteFindAll<Entity extends BaseEntity, PageParam = Record<string, unknown>>(
  config: InjectInfiniteFindAllConfig<Entity, PageParam>,
) {
  const queryClient = inject(QueryClient);

  const params = computed(() => config.queryParams?.() ?? {});
  const endpoint = computed(() => config.endpoint?.());
  const stableQueryParams = computed(() => JSON.stringify(params()));
  const finalQueryKey = computed(
    () => [...config.queryKey(), endpoint() ?? null, stableQueryParams()] as const,
  );

  const query = injectInfiniteQuery(() => ({
    queryKey: finalQueryKey(),
    queryFn: (context) => {
      const pageParam = context.pageParam as PageParam;
      return config.service().findAll({
        endpoint: endpoint(),
        config: {
          params: {
            ...params(),
            ...(pageParam && typeof pageParam === 'object' && !Array.isArray(pageParam)
              ? (pageParam as Record<string, unknown>)
              : {}),
          },
          onForbidden: config.onForbidden,
          onUnauthorized: config.onUnauthorized,
        },
      });
    },
    getNextPageParam: config.getNextPageParam,
    initialPageParam: config.initialPageParam,
    enabled: config.enabled ? config.enabled() : true,
  }));

  const getSafeCache = (old?: InfiniteCache<Entity>): InfiniteCache<Entity> =>
    old ?? { ...(EMPTY_INFINITE_CACHE as InfiniteCache<Entity>) };

  const updateInfiniteCacheData = (updater: (base: InfiniteCache<Entity>) => InfiniteCache<Entity>) => {
    queryClient.setQueryData<InfiniteCache<Entity>>(finalQueryKey() as unknown as unknown[], (old) =>
      updater(getSafeCache(old)),
    );
  };

  const addItemInCache = (item: Entity) => {
    updateInfiniteCacheData((base) => {
      if (base.pages.length === 0) return base;

      const alreadyExists = base.pages.some((page) => page.data.some((i) => i.id === item.id));
      if (alreadyExists) return base;

      return {
        ...base,
        pages: base.pages.map((page, index) =>
          index === 0 ? { ...page, data: [item, ...page.data] } : page,
        ),
      };
    });
  };

  const updateItemInCache = (id: string | number, updater: (item: Entity) => Entity) => {
    updateInfiniteCacheData((base) => ({
      ...base,
      pages: base.pages.map((page) => ({
        ...page,
        data: page.data.map((item) => (item.id === id ? updater(item) : item)),
      })),
    }));
  };

  const removeItemInCache = (id: string | number) => {
    updateInfiniteCacheData((base) => ({
      ...base,
      pages: base.pages.map((page) => ({
        ...page,
        data: page.data.filter((item) => item.id !== id),
      })),
    }));
  };

  const emptyCache = () => {
    updateInfiniteCacheData(() => ({ ...(EMPTY_INFINITE_CACHE as InfiniteCache<Entity>) }));
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