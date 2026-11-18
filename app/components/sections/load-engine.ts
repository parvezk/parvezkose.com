// An engine import waits on more than one chunk (D3 and the engine). The
// first failure rejects the import while the other chunks can still be in
// flight, and webpack reuses an in-flight request. Wait so those settle
// before the retry asks for them again.
const RETRY_DELAY_MS = 1000;

/**
 * Lazy-loads a graph engine chunk. A chunk load can time out on a slow
 * network, so try once more before giving up. Resolves to null when both
 * tries fail: the caller keeps the static panel and nothing throws.
 */
export function loadEngine<T>(load: () => Promise<T>): Promise<T | null> {
  return load()
    .catch(
      () =>
        new Promise<T>((resolve, reject) => {
          setTimeout(() => load().then(resolve, reject), RETRY_DELAY_MS);
        }),
    )
    .catch(() => null);
}
