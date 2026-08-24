'use client';

import { Suspense, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
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

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /[0-9]/.test(v) },
];

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = 'Must contain an uppercase letter';
    } else if (!/[a-z]/.test(form.password)) {
      errs.password = 'Must contain a lowercase letter';
    } else if (!/[0-9]/.test(form.password)) {
      errs.password = 'Must contain a number';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        '/api/v1/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: form.password }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid or expired reset token');
      }

      setSuccess(true);
      toast.success('Password reset successfully! You can now sign in.');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Password Reset Complete</CardTitle>
            <CardDescription>Your password has been successfully updated.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              You will be redirected to the sign-in page in a moment.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign In Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Set new password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>

        {!token && (
          <CardContent>
            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Invalid reset link. Please request a new password reset.</span>
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/forgot-password">Request Reset Link</Link>
            </Button>
          </CardContent>
        )}

        {token && (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={(fieldErrors.password ? 'border-destructive ring-destructive/20' : '') + ' pr-10'}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
                )}
                {form.password && (
                  <div className="space-y-1 mt-2">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(form.password);
                      return (
                        <div
                          key={rule.label}
                          className={`flex items-center gap-2 text-xs ${
                            passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-current" />
                          )}
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className={(fieldErrors.confirmPassword ? 'border-destructive ring-destructive/20' : '') + ' pr-10'}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <Button className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        )}

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
