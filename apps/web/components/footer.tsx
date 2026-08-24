import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

// D3 (AUDIT.md): drop dead `#` placeholder anchors when an env-driven link
// isn't configured — render an empty <li/> so the column layout stays
// stable but the user never sees a "Discord" link that goes nowhere. The
// previous `?? '#'` left the link in the DOM, which is both a dead-end UX
// and a footgun for screen readers (announcing a clickable target that
// does nothing).
const footerLinks: Record<string, FooterLink[]> = {
  Platform: [
    { label: 'Browse Mods', href: '/mods' },
    { label: 'Modpacks', href: '/mods?type=modpack' },
    { label: 'Plugins', href: '/mods?type=plugin' },
    { label: 'API', href: '/docs' },
  ],
  Community: [
    process.env.NEXT_PUBLIC_DISCORD_URL
      ? { label: 'Discord', href: process.env.NEXT_PUBLIC_DISCORD_URL, external: true }
      : null,
    process.env.NEXT_PUBLIC_GITHUB_URL
      ? { label: 'GitHub', href: process.env.NEXT_PUBLIC_GITHUB_URL, external: true }
      : null,
    { label: 'Forums', href: '/about/forums' },
  ].filter((link): link is FooterLink => link !== null),
  Support: [
    { label: 'Documentation', href: '/docs' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'DMCA', href: '/legal/dmca' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t py-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-3">{title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Minecraft Platform. Not affiliated with Mojang Studios.
        </div>
      </div>
    </footer>
  );
}
