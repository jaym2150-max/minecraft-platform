'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@mcp/ui/components/button';
import { Input } from '@mcp/ui/components/input';
import { Label } from '@mcp/ui/components/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@mcp/ui/components/card';

type Step = 'request' | 'sent';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const validate = useCallback(() => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok && response.status !== 202) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to process request');
      }

      setStep('sent');
      toast.success('If that email exists, a reset link has been sent.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="from-background via-muted/30 to-background flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-bold">
            <div className="bg-primary shadow-primary/25 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg">
              <span className="text-primary-foreground text-lg font-bold">MP</span>
            </div>
            Minecraft Platform
          </Link>
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            {step === 'request' ? (
              <KeyRound className="text-primary h-6 w-6" />
            ) : (
              <CheckCircle2 className="text-primary h-6 w-6" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === 'request' ? 'Forgot your password?' : 'Check your email'}
          </CardTitle>
          <CardDescription>
            {step === 'request'
              ? "No worries, we'll send you reset instructions"
              : `If an account exists for ${email}, a reset link has been sent.`}
          </CardDescription>
        </CardHeader>

        {step === 'request' ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-3 rounded-lg border p-3 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className={error ? 'border-destructive ring-destructive/20' : ''}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <Button className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="bg-muted/40 text-muted-foreground rounded-lg border p-4 text-sm">
              <p>
                We sent a password reset link to{' '}
                <span className="text-foreground font-medium">{email}</span>. The link expires in 1
                hour.
              </p>
              <p className="mt-2">
                Didn&apos;t get the email? Check your spam folder, or{' '}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => setStep('request')}
                >
                  try again
                </button>
                .
              </p>
            </div>
          </CardContent>
        )}

        <CardFooter className="justify-center pb-6">
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
