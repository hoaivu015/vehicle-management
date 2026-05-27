/**
 * UseCase
 * 
 * Standard interface for all application use cases.
 */
export interface UseCase<I, O> {
  execute(input: I): Promise<O>;
}

/**
 * createSimpleUseCase
 * 
 * A factory to create simple use cases that wrap a repository method.
 * This avoids creating many near-identical class files for basic CRUD.
 */
export const createSimpleUseCase = <I, O>(
  action: (input: I) => Promise<O>
): UseCase<I, O> => {
  return {
    execute: (input: I) => action(input)
  };
};

/**
 * createCrudUseCases
 * 
 * A factory to create a set of standard CRUD use cases for a repository.
 */
export const createCrudUseCases = <T>(repo: {
  getAll: () => Promise<T[]>;
  getById: (id: string | number) => Promise<T | null>;
  create: (item: Partial<T>) => Promise<T>;
  update: (id: string | number, item: Partial<T>) => Promise<T>;
  delete: (id: string | number) => Promise<void>;
}) => {
  return {
    getAll: createSimpleUseCase<void, T[]>(() => repo.getAll()),
    getById: createSimpleUseCase<string | number, T | null>((id) => repo.getById(id)),
    add: createSimpleUseCase<Partial<T>, T>((item) => repo.create(item)),
    update: createSimpleUseCase<{ id: string | number; data: Partial<T> }, T>(({ id, data }) => repo.update(id, data)),
    delete: createSimpleUseCase<string | number, void>((id) => repo.delete(id)),
  };
};
