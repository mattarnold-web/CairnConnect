'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { CairnLogo } from '@/components/ui/CairnLogo';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signUp, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'auth_failed' ? 'Authentication failed. Please try again.' : null,
  );
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirectTo') || '/explore';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = isSignUp
        ? await signUp(email, password)
        : await signInWithEmail(email, password);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        setError(null);
        // Show confirmation message for email verification
        setLoading(false);
        alert('Check your email for a confirmation link!');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Failed to start Google sign-in.');
    }
  };

  return (
    <div className="min-h-screen bg-cairn-bg flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-canopy/20 via-cairn-bg to-cairn-bg" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-canopy/10 blur-[120px]" />
        <div className="relative flex flex-col justify-center px-16 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-canopy to-canopy-dark flex items-center justify-center shadow-lg shadow-canopy/20">
              <CairnLogo className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-slate-100">
                Cairn Connect
              </span>
              <p className="text-xs text-slate-500 tracking-[0.2em] uppercase">
                Find your trail
              </p>
            </div>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="font-display text-4xl font-bold text-slate-100">
              Your outdoor adventure starts here
            </h1>
            <p className="text-lg text-slate-400">
              Discover trails, connect with businesses, and find your people in the outdoors.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <span>5,000+ Businesses</span>
            <span>12,000+ Trails</span>
            <span>29 Activities</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 max-w-xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-canopy to-canopy-dark flex items-center justify-center">
            <CairnLogo className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-slate-100">
            Cairn Connect
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          {isSignUp
            ? 'Join the outdoor community'
            : 'Sign in to your Cairn Connect account'}
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Social auth buttons */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-cairn-border bg-cairn-card h-12 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-cairn-border bg-cairn-card h-12 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-cairn-border" />
          <span className="text-xs text-slate-500">or continue with email</span>
          <div className="flex-1 h-px bg-cairn-border" />
        </div>

        {/* Email form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full h-12 rounded-xl border border-cairn-border bg-cairn-card pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-canopy transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                required
                minLength={6}
                disabled={loading}
                className="w-full h-12 rounded-xl border border-cairn-border bg-cairn-card pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-canopy transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-canopy hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-canopy hover:underline font-medium"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cairn-bg" />}>
      <LoginForm />
    </Suspense>
  );
}
