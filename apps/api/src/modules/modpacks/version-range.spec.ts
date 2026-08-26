import { compareVersions, maxSatisfying, parseVersion, versionInRange } from './version-range';

describe('parseVersion', () => {
  it('parses dotted numbers', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
    expect(parseVersion('1.21.1')).toEqual([1, 21, 1]);
  });

  it('pads missing parts with zero', () => {
    expect(parseVersion('1')).toEqual([1, 0, 0]);
    expect(parseVersion('1.2')).toEqual([1, 2, 0]);
  });

  it('strips pre-release suffix', () => {
    expect(parseVersion('1.2.3-pre.1')).toEqual([1, 2, 3]);
    expect(parseVersion('1.2.3+build.5')).toEqual([1, 2, 3]);
  });

  it('rejects garbage', () => {
    expect(parseVersion('')).toBeNull();
    expect(parseVersion('foo')).toBeNull();
    expect(parseVersion('1.2.x')).toBeNull();
    expect(parseVersion('-1.2.3')).toBeNull();
  });
});

describe('compareVersions', () => {
  it('orders correctly', () => {
    expect(compareVersions([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(compareVersions([1, 2, 4], [1, 2, 3])).toBe(1);
    expect(compareVersions([1, 2, 3], [1, 2, 4])).toBe(-1);
    expect(compareVersions([1, 2, 3], [1, 3, 0])).toBe(-1);
    expect(compareVersions([2, 0, 0], [1, 99, 99])).toBe(1);
  });
});

describe('versionInRange', () => {
  it('returns true for empty / wildcard ranges', () => {
    expect(versionInRange('1.2.3', null)).toBe(true);
    expect(versionInRange('1.2.3', '')).toBe(true);
    expect(versionInRange('1.2.3', '*')).toBe(true);
  });

  it('handles exact / >= / > / <= / <', () => {
    expect(versionInRange('1.2.3', '1.2.3')).toBe(true);
    expect(versionInRange('1.2.4', '1.2.3')).toBe(false);
    expect(versionInRange('1.2.4', '>=1.2.3')).toBe(true);
    expect(versionInRange('1.2.3', '>1.2.3')).toBe(false);
    expect(versionInRange('1.2.4', '>1.2.3')).toBe(true);
    expect(versionInRange('1.2.3', '<=1.2.3')).toBe(true);
    expect(versionInRange('1.2.4', '<1.2.3')).toBe(false);
  });

  it('handles intersections', () => {
    expect(versionInRange('1.5.0', '>=1.2.0 <2.0.0')).toBe(true);
    expect(versionInRange('1.1.99', '>=1.2.0 <2.0.0')).toBe(false);
    expect(versionInRange('2.0.0', '>=1.2.0 <2.0.0')).toBe(false);
  });

  it('handles caret ranges', () => {
    expect(versionInRange('1.2.5', '^1.2.3')).toBe(true);
    expect(versionInRange('1.3.0', '^1.2.3')).toBe(true);
    expect(versionInRange('1.2.2', '^1.2.3')).toBe(false);
    expect(versionInRange('2.0.0', '^1.2.3')).toBe(false);
    expect(versionInRange('0.9.9', '^1.0.0')).toBe(false);
  });
});

describe('maxSatisfying', () => {
  it('returns the highest matching version', () => {
    expect(maxSatisfying(['1.2.3', '1.2.5', '1.2.4'], '>=1.2.4')).toBe('1.2.5');
    expect(maxSatisfying(['1.2.3', '1.2.5', '2.0.0'], '^1.2.3')).toBe('1.2.5');
    expect(maxSatisfying(['1.2.3', '2.0.0'], '^1.2.3 <2.0.0')).toBe('1.2.3');
  });

  it('returns null when nothing matches', () => {
    expect(maxSatisfying(['1.2.3', '1.2.4'], '>=2.0.0')).toBeNull();
    expect(maxSatisfying([], '>=1.0.0')).toBeNull();
  });
});
