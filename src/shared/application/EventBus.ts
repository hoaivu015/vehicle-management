/**
 * Simple Event Bus for inter-module communication.
 * Helps decouple modules by avoiding direct use case dependencies.
 */
type EventHandler<T = any> = (data: T) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  subscribe<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  async publish<T>(event: string, data: T): Promise<void> {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) return;

    const promises: Promise<void>[] = [];
    eventHandlers.forEach(handler => {
      const result = handler(data);
      if (result instanceof Promise) {
        promises.push(result);
      }
    });

    await Promise.all(promises);
  }
}

export const eventBus = new EventBus();

export const DOMAIN_EVENTS = {
  STAFF_UPDATED: 'STAFF_UPDATED',
  VEHICLE_UPDATED: 'VEHICLE_UPDATED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  EXPENSE_ADDED: 'EXPENSE_ADDED',
};
