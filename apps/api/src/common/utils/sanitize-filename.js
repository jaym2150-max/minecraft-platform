"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeObjectKey = sanitizeObjectKey;
/**
 * Sanitize a user-supplied filename so it is safe to embed in an S3 object key.
 *
 * Threat model: an attacker uploads a file whose `originalname` contains path
 * separators (`/`, `\`), traversal sequences (`..`), or control characters in
 * an attempt to escape the intended `projects/{id}/uploads/...` key prefix or
 * overwrite another object. This collapses separators, strips traversal and
 * control chars, and enforces a sane length while preserving readability.
 */
function sanitizeObjectKey(filename) {
    if (!filename || typeof filename !== 'string')
        return 'upload';
    return (filename
        // Normalize backslashes to forward slashes, then drop ALL separators so
        // the filename cannot introduce a new path segment.
        .replace(/\\+/g, '/')
        .split('/')
        .pop()
        // Remove traversal remnants and any path/control characters.
        .replace(/\.\./g, '')
        .replace(/[\x00-\x1f\x7f]/g, '')
        // Replace anything that isn't word, dash, dot, or underscore.
        .replace(/[^\w.\-]+/g, '_')
        // Collapse repeated underscores / dots.
        .replace(/_+/g, '_')
        .replace(/\.+/g, '.')
        .replace(/^[._]+|[._]+$/g, '')
        .slice(0, 128) || 'upload');
}
