-- AlterTable: add refresh-token binding columns to the sessions table.
-- `refreshTokenHash` is the SHA-256 of the refresh-token jti, unique per
-- alive session so rotation can swap it atomically. `refreshExpiresAt`
-- bounds how long the session can keep minting new access tokens after the
-- short-lived access token has expired. Both are nullable so existing
-- sessions created before this migration keep working (no refresh issued).
ALTER TABLE "sessions" ADD COLUMN "refreshTokenHash" TEXT;
ALTER TABLE "sessions" ADD COLUMN "refreshExpiresAt" TIMESTAMP(3);

-- Index for the refresh-token lookup on POST /auth/refresh (	hash-based O(1)
-- lookup instead of scanning by userId).
CREATE INDEX "sessions_refreshTokenHash_idx" ON "sessions"("refreshTokenHash");
