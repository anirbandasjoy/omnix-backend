import { GenericSchema } from '../types/common.types';

export interface BaseRepository<TSchema extends GenericSchema> {
  findOne(id: string): Promise<TSchema | null>;
  findOneByCondition(condition: Record<string, any>): Promise<TSchema | null>;
  findMany(pagination?: { limit: number; offset: number }): Promise<TSchema[]>;
  create(data: any): Promise<TSchema>;
  update(id: string, data: any): Promise<TSchema>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  exists(condition: Record<string, any>): Promise<boolean>;
  count(condition?: Record<string, any>): Promise<number>;
}
