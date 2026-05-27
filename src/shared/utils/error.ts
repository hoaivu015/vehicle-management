export const handleDatabaseError = (error: unknown, operation: string, path: string) => {
  console.error(`Database Error [${operation}] on ${path}:`, error);
  // You can add more sophisticated error handling here, like toast notifications
  throw error;
};
