import { BaseEntity } from './entities/base-entity.model';
import { BaseResponse } from './responses/base-response.model';
import { PaginationResponse } from './responses/pagination-response.model';
import {
  CreateParams, DeleteParams, FindAllParams, FindByIdParams,
  FindByParams, RestoreParams, UpdateParams,
} from './params-service.model';

export abstract class AbstractService<Entity extends BaseEntity> {
  abstract findAll(params?: FindAllParams): Promise<PaginationResponse<Entity>>;
  abstract findById(params: FindByIdParams): Promise<BaseResponse<Entity>>;
  abstract findBy(params: FindByParams): Promise<BaseResponse<Entity>>;
  abstract create(params: CreateParams<Entity>): Promise<BaseResponse<Entity>>;
  abstract update(params: UpdateParams<Entity>): Promise<BaseResponse<Entity>>;
  abstract delete(params: DeleteParams): Promise<void>;
  abstract restore(params: RestoreParams): Promise<void>;
}