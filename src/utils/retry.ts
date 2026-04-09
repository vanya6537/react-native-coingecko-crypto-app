/**
 * Retry wrapper для асинхронных функций
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Exponential backoff delay
 */
export function exponentialBackoff(attempt: number, baseDelay: number = 100): number {
  return baseDelay * Math.pow(2, attempt - 1);
}
