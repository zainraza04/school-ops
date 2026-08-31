'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  'saas@schoolops.io',
  'owner@greenvalley.edu.pk',
  'admin@greenvalley.edu.pk',
  'teacher@greenvalley.edu.pk',
] as const;

export default function LoginPage(): ReactNode {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setError(null);
    try {
      await login(values);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="flex min-h-full w-full flex-1">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <GraduationCap className="size-6" aria-hidden />
          </div>
          <span className="text-2xl font-bold tracking-tight">SchoolOps</span>
        </div>
        <div className="relative z-10 space-y-3">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            School administration, simplified.
          </h1>
          <p className="max-w-sm text-base text-indigo-100">
            Manage students, attendance, fees, and staff — built for Pakistani
            schools and academies.
          </p>
        </div>
        <p className="relative z-10 text-sm text-indigo-200">SchoolOps © 2026</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" aria-hidden />
            </div>
            <span className="text-xl font-bold text-foreground">SchoolOps</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to access your school dashboard.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu.pk"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={isSubmitting}
              aria-label="Sign in"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Demo accounts (password: <span className="font-mono">admin123</span>)
            </p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              {DEMO_ACCOUNTS.map((email) => (
                <li key={email} className="font-mono">
                  {email}
                </li>
              ))}
            </ul>
          </div>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            SchoolOps © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
