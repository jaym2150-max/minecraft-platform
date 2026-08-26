import { ImageResponse } from 'next/og';

/**
 * Dynamic Open Graph image — rendered at request time and cached.
 * Referenced from layout metadata as the site's og:image / twitter:image.
 * ImageResponse sets Content-Type: image/png itself; a `contentType` route
 * segment export is not part of Next 15's validated config set and fails
 * the generated build-time typecheck, so we rely on the response header.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'Find Your Next Mod';
  const subtitle =
    searchParams.get('subtitle') ??
    'Minecraft mods, modpacks & plugins — every loader, every version.';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#0e0e10',
        padding: 80,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(#ff6a1a22 1px, transparent 1px), linear-gradient(90deg, #ff6a1a22 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -160,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 400,
          borderRadius: '100%',
          background: 'radial-gradient(closest-side, #ff6a1a33, transparent)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: '#ff6a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          MP
        </div>
        <div style={{ color: '#a1a1aa', fontSize: 24, fontWeight: 800, letterSpacing: 4 }}>
          MINECRAFT PLATFORM
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          fontSize: title.length > 30 ? 72 : 88,
          fontWeight: 900,
          letterSpacing: -3,
          lineHeight: 1,
          color: '#ffffff',
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: title.length > 30 ? 30 : 34,
          color: '#ff8c42',
          fontWeight: 800,
        }}
      >
        {subtitle}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 80,
          display: 'flex',
          gap: 12,
          color: '#71717a',
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        <span>FABRIC</span>
        <span>•</span>
        <span>FORGE</span>
        <span>•</span>
        <span>NEOFORGE</span>
        <span>•</span>
        <span>QUILT</span>
        <span>•</span>
        <span>BUKKIT</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
