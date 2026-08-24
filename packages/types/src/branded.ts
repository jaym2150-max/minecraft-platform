/**
 * Branded IDs - audit M-P: All IDs plain `string`; no branded types.
 * Branded strings prevent mixing UserId ↔ ProjectId at compile time while remaining
 * plain strings at runtime (no overhead, JSON-serializable).
 */

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type VersionId = Brand<string, 'VersionId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type CollectionId = Brand<string, 'CollectionId'>;
export type TeamId = Brand<string, 'TeamId'>;
export type ApiKeyId = Brand<string, 'ApiKeyId'>;
export type SessionId = Brand<string, 'SessionId'>;

/** Helper to assert a plain string is a branded ID (no runtime check, cast only). */
export function asUserId(id: string): UserId {
  return id as UserId;
}
export function asProjectId(id: string): ProjectId {
  return id as ProjectId;
}
export function asVersionId(id: string): VersionId {
  return id as VersionId;
}
