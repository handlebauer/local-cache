/**
 * @param {import("../LocalHTTPCache.js").LocalHTTPCacheBaseURL} baseURL
 */
export const getHost = baseURL => new URL(baseURL).host
