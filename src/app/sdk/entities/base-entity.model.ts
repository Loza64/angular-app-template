export interface BaseEntity {
  readonly id?: string | number;
  name?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly deletedAt?: string;
}