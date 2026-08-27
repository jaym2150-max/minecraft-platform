import type { Metadata } from 'next';
import AiClient from './ai-client';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';

export const metadata: Metadata = {
  title: 'AI Search — Natural Language Mod Discovery',
  description:
    'Ask for mods in plain English — semantic search, modpack suggestions and compatibility explanations.',
  alternates: { canonical: `${siteUrl}/ai` },
};

export default function Page() {
  return <AiClient />;
}
