export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string | number): Promise<T | null>;
  create(item: Partial<T>): Promise<T>;
  update(id: string | number, item: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<void>;
}
