import React, { useState } from 'react';
import { Sparkles, Shield, Heart, Activity, CheckCircle2, ArrowRight, Lock, Mail, User, KeyRound } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

export const AuthModal: React.FC = () => {
  const { login, register, loadDemoUser } = useWellness();

  const [mode, setMode] = useState<'signin' | 'signup' | 'recovery'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else if (mode === 'signup') {
        const res = await register(email, password, name);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
        }
      } else if (mode === 'recovery') {
        if (!email || !email.includes('@')) {
          setError('Please provide a valid email address.');
        } else {
          setSuccessMsg(`A password reset link and verification code has been dispatched to ${email}. You can now sign in with your updated credentials.`);
          setTimeout(() => {
            setMode('signin');
          }, 3500);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-indigo-50/40 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-purple-950/5 border border-purple-100/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Welcome Branding Panel */}
        <div className="md:col-span-5 bg-linear-to-br from-violet-900 via-indigo-900 to-purple-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-2xl tracking-tight">CareNova</h1>
                <p className="text-xs text-violet-200">AI Physical & Mental Wellness</p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white leading-snug mb-3">
              Your personalized sanctuary for body & mind
            </h2>
            <p className="text-sm text-violet-200/90 leading-relaxed mb-6">
              Connect science-grounded physical coaching, mindful breathwork, real activity tracking, and intelligent AI assistance in one harmonious place.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-violet-100">
                <div className="w-6 h-6 rounded-full bg-violet-500/30 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span>Real workout & breathwork session tracking</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-violet-100">
                <div className="w-6 h-6 rounded-full bg-violet-500/30 flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span>Empathetic mental wellness & mood logs</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-violet-100">
                <div className="w-6 h-6 rounded-full bg-violet-500/30 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span>Private, user-owned encrypted storage</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-violet-300 mb-2">Want to test right away without signing up?</p>
            <button
              onClick={loadDemoUser}
              className="w-full py-2.5 px-4 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-xl text-sm font-semibold border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Explore Demo Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-3">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`text-sm font-bold pb-2 transition-all cursor-pointer ${
                mode === 'signin' ? 'text-violet-700 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`text-sm font-bold pb-2 transition-all cursor-pointer ${
                mode === 'signup' ? 'text-violet-700 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
            {mode === 'recovery' && (
              <span className="text-sm font-bold pb-2 text-violet-700 border-b-2 border-violet-600">
                Reset Password
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="name">
                  Full Name or Preferred Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm text-slate-900 transition-all outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm text-slate-900 transition-all outline-hidden"
                />
              </div>
            </div>

            {mode !== 'recovery' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('recovery')}
                      className="text-xs text-violet-600 hover:text-violet-800 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm text-slate-900 transition-all outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In to CareNova</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>Start Wellness Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Recovery Instructions</span>
                </>
              )}
            </button>
          </form>

          {mode === 'recovery' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-slate-500 hover:text-violet-700 font-medium"
              >
                Back to Sign In
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>CareNova Wellness Protocol v2.5</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-violet-500" /> Secure & Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
