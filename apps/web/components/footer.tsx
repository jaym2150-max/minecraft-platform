import Link from 'next/link';

const footerLinks = {
  Platform: [
    { label: 'Browse Mods', href: '/mods' },
    { label: 'Modpacks', href: '/mods' },
    { label: 'Plugins', href: '/mods' },
    { label: 'API', href: '/docs' },
  ],
  Community: [
    { label: 'Discord', href: '#' },
    { label: 'GitHub', href: '#' },
    { label: 'Forums', href: '#' },
  ],
  Support: [
    { label: 'Documentation', href: '/docs' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'DMCA', href: '#' },
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
                    <Link href={link.href} className="hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
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
