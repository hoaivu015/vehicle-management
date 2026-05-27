/**
 * Base class for all domain errors in the application.
 */
export class DomainError extends Error {
  constructor(public message: string, public code?: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when an entity is not found.
 */
export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string | number) {
    super(`${entity} with ID ${id} not found`, 'ENTITY_NOT_FOUND');
  }
}

/**
 * Thrown when an invalid status transition is attempted.
 */
export class InvalidStatusTransitionError extends DomainError {
  constructor(current: string, next: string) {
    super(`Cannot transition from ${current} to ${next}`, 'INVALID_STATUS_TRANSITION');
  }
}

/**
 * Thrown when financial constraints are violated.
 */
export class FinancialConstraintError extends DomainError {
  constructor(message: string) {
    super(message, 'FINANCIAL_CONSTRAINT_VIOLATION');
  }
}

/**
 * Thrown when authentication or authorization fails.
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED');
  }
}
