import { fetchClient } from "./fetch-client";

/**
 * SWR-compatible fetcher. Pass as the second argument to `useSWR`.
 *
 * @example
 * const { data } = useSWR<User>("/users/1", swrFetcher);
 */
export async function swrFetcher<T>(path: string): Promise<T> {
  return fetchClient<T>({ path });
}
