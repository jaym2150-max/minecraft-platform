'use client';

import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@mcp/auth';
import { sdk } from '@/services/api';
import { I18nProvider } from '@/i18n/provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <I18nProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <AuthProvider sdk={sdk}>{children}</AuthProvider>
        </QueryClientProvider>
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
    </I18nProvider>
  );
}
