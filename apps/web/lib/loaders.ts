/**
 * Loader slug ↔ LoaderType enum mapping for the marketing site.
 *
 * The URL is lowercase ("/loaders/fabric") so a short slug dictionary covers
 * the 8 supported loaders. Mirrors the API's `LoaderType` enum, which the
 * `/projects?loaders=FABRIC` facet accepts directly.
 */
export const LOADER_SLUGS: { slug: string; label: string; type: string }[] = [
  { slug: 'fabric', label: 'Fabric', type: 'FABRIC' },
  { slug: 'forge', label: 'Forge', type: 'FORGE' },
  { slug: 'neoforge', label: 'NeoForge', type: 'NEOFORGE' },
  { slug: 'quilt', label: 'Quilt', type: 'QUILT' },
  { slug: 'bukkit', label: 'Bukkit', type: 'BUKKIT' },
  { slug: 'spigot', label: 'Spigot', type: 'SPIGOT' },
  { slug: 'paper', label: 'Paper', type: 'PAPER' },
  { slug: 'purpur', label: 'Purpur', type: 'PURPUR' },
];

export function findLoader(slug: string) {
  return LOADER_SLUGS.find((l) => l.slug === slug.toLowerCase());
}
