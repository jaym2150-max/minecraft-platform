/**
 * Tiny purpose-built semver comparator + range matcher for the modpack
 * dependency resolver. Avoids adding a runtime dependency for what is
 * effectively a handful of comparators + range checks.
 *
 * Supported version forms:
 *  - "1.2.3"           (major.minor.patch)
 *  - "1.2.3-pre.1"     (pre-release suffix tolerated but compared loosely:
 *                       "1.2.3-pre.1" sorts before "1.2.3")
 *  - "1.20.1"          (Minecraft game versions, 3-part dotted strings)
 *
 * Supported range forms:
 *  - "1.2.3"           (exact)
 *  - "=1.2.3"          (exact; prefix optional)
 *  - ">=1.2.3", ">1.2.3"
 *  - "<=1.2.3", "<1.2.3"
 *  - ">=1.2.0 <2.0.0"  (intersection of two comparators, space-separated)
 *  - "^1.2.3"          (compatible with 1.2.3: same major, >=minor)
 *  - "*" or ""         (any)
 */

export type SemverPart = readonly [number, number, number];

const PART_LEN = 3;
const ANY = /^\*$/;

function stripPrefix(op: string, v: string): { op: string; ver: string } {
  for (const prefix of ['>=', '<=', '>', '<', '^', '=']) {
    if (v.startsWith(prefix)) return { op: prefix, ver: v.slice(prefix.length) };
  }
  return { op, ver: v };
}

export function parseVersion(input: string): SemverPart | null {
  if (!input) return null;
  // Strip pre-release suffix for ordering: "1.2.3-pre.1" → "1.2.3"
  const clean = input.split('-')[0].split('+')[0];
  const parts = clean.split('.');
  if (parts.length > PART_LEN) return null;
  const nums: number[] = [];
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (!Number.isFinite(n) || n < 0 || String(n) !== p) return null;
    nums.push(n);
  }
  while (nums.length < PART_LEN) nums.push(0);
  return [nums[0], nums[1], nums[2]] as SemverPart;
}

export function compareVersions(a: SemverPart, b: SemverPart): number {
  for (let i = 0; i < PART_LEN; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

type Comparator = { op: '>' | '>=' | '<' | '<=' | '=' | '^'; version: SemverPart };

function parseComparator(raw: string): Comparator | null {
  const trimmed = raw.trim();
  if (!trimmed || ANY.test(trimmed)) return null;
  const { op, ver } = stripPrefix('=', trimmed);
  const parsed = parseVersion(ver);
  if (!parsed) return null;
  if (op !== '>' && op !== '>=' && op !== '<' && op !== '<=' && op !== '=' && op !== '^')
    return null;
  return { op, version: parsed };
}

function matchComparator(c: Comparator, v: SemverPart): boolean {
  switch (c.op) {
    case '=':
      return compareVersions(v, c.version) === 0;
    case '>':
      return compareVersions(v, c.version) > 0;
    case '>=':
      return compareVersions(v, c.version) >= 0;
    case '<':
      return compareVersions(v, c.version) < 0;
    case '<=':
      return compareVersions(v, c.version) <= 0;
    case '^':
      // ^x.y.z: same major, v >= [x.y.z], v < [(x+1).0.0]
      if (v[0] !== c.version[0]) return false;
      if (compareVersions(v, c.version) < 0) return false;
      const upper: SemverPart = [c.version[0] + 1, 0, 0] as unknown as SemverPart;
      return compareVersions(v, upper) < 0;
  }
}

/**
 * Match a version against a range expression. Empty / undefined / "*" matches
 * any version. Unknown tokens cause the range to reject (caller decides).
 */
export function versionInRange(version: string, range: string | null | undefined): boolean {
  if (!range || range.trim() === '' || ANY.test(range.trim())) return true;
  const comparators = range
    .trim()
    .split(/\s+/)
    .map(parseComparator)
    .filter((c): c is Comparator => c !== null);
  if (comparators.length === 0) return true;
  const v = parseVersion(version);
  if (!v) return false;
  return comparators.every((c) => matchComparator(c, v));
}

/**
 * Return the highest version in `versions` that satisfies `range`. Returns
 * null if none match or the list is empty. Comparisons use the semver Part
 * tuple; ties retain the first occurrence.
 */
export function maxSatisfying(versions: string[], range: string | null | undefined): string | null {
  let best: { v: SemverPart; raw: string } | null = null;
  for (const raw of versions) {
    if (!versionInRange(raw, range)) continue;
    const v = parseVersion(raw);
    if (!v) continue;
    if (best === null || compareVersions(v, best.v) > 0) best = { v, raw };
  }
  return best?.raw ?? null;
}
