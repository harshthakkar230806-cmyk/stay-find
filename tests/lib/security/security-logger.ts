export function securityLog(message: string, context?: Record<string, any>): void {
  // Simple implementation of security logger
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    context,
  };

  // In a real implementation, this would write to secure logs
  console.log("[SECURITY LOG]", JSON.stringify(logEntry, null, 2));
}