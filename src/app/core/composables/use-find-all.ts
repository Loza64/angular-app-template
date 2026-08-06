import { injectQuery } from '@tanstack/angular-query-experimental';
import { Signal } from '@angular/core';
import { FindAllParams } from '../../sdk/params-service.model';
import { Service } from '../../sdk/service';
import { BaseEntity } from '../../sdk/entities/base-entity.model';

export function injectFindAll<T extends BaseEntity>(config: {
  service: Signal<Service<T>>;
  queryKey: Signal<unknown[]>;
  queryParams: Signal<FindAllParams>;
  enabled?: Signal<boolean>;
}) {
  return injectQuery(() => ({
    queryKey: config.queryKey(),
    queryFn: () => config.service().findAll(config.queryParams()),
    enabled: config.enabled ? config.enabled() : true,
  }));
}