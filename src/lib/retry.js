// Retry helper for API calls with exponential backoff
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 2,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry = null,
  } = options

  let lastError
  let delay = delayMs

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }

      // Don't retry if we've exhausted retries
      if (attempt === maxRetries) {
        throw error
      }

      // Call retry callback for UI updates
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, error)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= backoffMultiplier
    }
  }

  throw lastError
}
