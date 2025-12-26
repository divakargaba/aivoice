export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
}

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffMultiplier = 2,
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Check if it's a rate limit error
            const isRateLimit =
                error instanceof Error &&
                (error.message.includes("rate limit") ||
                    error.message.includes("429") ||
                    error.message.includes("quota"));

            // Don't retry on non-rate-limit errors after first attempt
            if (!isRateLimit && attempt > 0) {
                throw lastError;
            }

            // Don't retry if we've exhausted attempts
            if (attempt === maxRetries) {
                throw lastError;
            }

            // Wait before retrying
            console.log(
                `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
                lastError.message
            );
            await sleep(delay);

            // Exponential backoff with max delay
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }

    throw lastError!;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

