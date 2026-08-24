'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Loader2, CheckCircle2, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@mcp/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@mcp/ui/components/card';
import { sdk } from '@/services/api';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    setStatus('verifying');
    sdk.verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success('Email verified successfully!');
      })
      .catch((err) => {
        const message = err?.message || 'Invalid or expired verification link';
        setError(message);
        setStatus('error');
        toast.error(message);
      });
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    try {
      const email = searchParams.get('email') || '';
      await sdk.sendVerificationEmail(email);
      toast.success('Verification email sent! Check your inbox.');
    } catch {
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-primary-foreground font-bold text-lg">MP</span>
            </div>
            Minecraft Platform
          </Link>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {!token
              ? 'No verification token found.'
              : status === 'verifying'
                ? 'Verifying your email...'
                : status === 'success'
                  ? 'Your email has been verified!'
                  : status === 'error'
                    ? 'Verification failed'
                    : ''}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {!token && (
            <>
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400 mb-4">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Invalid verification link. Please request a new one.</span>
              </div>
              <Button className="w-full" onClick={handleResend} disabled={resending}>
                {resending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Resend Verification Email</>
                )}
              </Button>
            </>
          )}

          {status === 'verifying' && (
            <div className="py-8">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You can now access all features of your account.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4 text-left">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
              <Button className="w-full" onClick={handleResend} disabled={resending}>
                {resending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Resend Verification Email</>
                )}
              </Button>
            </>
          )}

          {status === 'idle' && !token && (
            <Button className="w-full" onClick={handleResend} disabled={resending}>
              {resending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Verification Email</>
              )}
            </Button>
          )}
        </CardContent>

        <CardFooter className="justify-center pb-6">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
