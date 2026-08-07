import { inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseEntity } from './entities/base-entity.model';
import { AbstractService } from './abstract-service';
import {
  ApiServiceParams, CreateParams, DeleteParams, FindAllParams,
  FindByIdParams, FindByParams, RestoreParams, ServiceConfig, UpdateParams,
} from './params-service.model';
import { BaseResponse } from './responses/base-response.model';
import { PaginationResponse } from './responses/pagination-response.model';
import { ON_FORBIDDEN, ON_UNAUTHORIZED } from '../core/http/http-context';

export class Service<Entity extends BaseEntity> implements AbstractService<Entity> {
  private readonly http = inject(HttpClient);
  protected readonly endpoint: string;
  protected readonly baseUrl: string;

  constructor({ origin = environment.apiOrigin, initPath = 'api', endpoint = '' }: ApiServiceParams) {
    this.endpoint = endpoint;
    this.baseUrl = `${origin}/${initPath}`;
  }

  private getUrl(endpoint?: string, idOrPath?: string | number): string {
    const base = `${this.baseUrl}/${endpoint || this.endpoint}`;
    if (idOrPath == null) return base;
    return `${base}/${String(idOrPath).replace(/^\/+/, '')}`;
  }

  private buildOptions(config?: ServiceConfig) {
    let context = new HttpContext();
    if (config?.onUnauthorized) context = context.set(ON_UNAUTHORIZED, config.onUnauthorized);
    if (config?.onForbidden) context = context.set(ON_FORBIDDEN, config.onForbidden);
    return {
      headers: config?.headers as HttpHeaders | Record<string, string> | undefined,
      params: config?.params as HttpParams | Record<string, string> | undefined,
      context,
    };
  }

  async findAll(params: FindAllParams = {}): Promise<PaginationResponse<Entity>> {
    return firstValueFrom(this.http.get<PaginationResponse<Entity>>(this.getUrl(params.endpoint), this.buildOptions(params.config)));
  }

  async findById(params: FindByIdParams): Promise<BaseResponse<Entity>> {
    return firstValueFrom(this.http.get<BaseResponse<Entity>>(this.getUrl(params.endpoint, params.id), this.buildOptions(params.config)));
  }

  async findBy(params: FindByParams): Promise<BaseResponse<Entity>> {
    return firstValueFrom(this.http.get<BaseResponse<Entity>>(this.getUrl(params.endpoint, params.path), this.buildOptions(params.config)));
  }

  async create(params: CreateParams<Entity>): Promise<BaseResponse<Entity>> {
    return firstValueFrom(this.http.post<BaseResponse<Entity>>(this.getUrl(params.endpoint), params.payload, this.buildOptions(params.config)));
  }

  async update(params: UpdateParams<Entity>): Promise<BaseResponse<Entity>> {
    return firstValueFrom(this.http.put<BaseResponse<Entity>>(this.getUrl(params.endpoint, params.id), params.payload, this.buildOptions(params.config)));
  }

  async delete(params: DeleteParams): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.getUrl(params.endpoint, params.id), this.buildOptions(params.config)));
  }

  async restore(params: RestoreParams): Promise<void> {
    await firstValueFrom(this.http.patch<void>(this.getUrl(params.endpoint, `${params.id}/restore`), {}, this.buildOptions(params.config)));
  }
}