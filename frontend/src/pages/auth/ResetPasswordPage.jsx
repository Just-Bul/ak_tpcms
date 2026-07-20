import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Input } from './../../components/ui';
import api from '@/services/api';

/**
 * Reset Password — reached via the link emailed by ForgotPasswordPage
 * (POST /users/forgot-password), e.g. https://.../reset-password?token=<rawToken>.
 * Submits the new password to POST /users/reset-password?token=<rawToken>.
 * The token is single-use and expires 15 minutes after it was issued
 * (backend/src/utils/tokenCache.util.ts).
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing its token. Request a new one.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/users/reset-password?token=${encodeURIComponent(token)}`, { password });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Unable to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orbit-bg flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-orbit-primary/8 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-orbit-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-slate-100 font-semibold">TPCMS</span>
        </div>

        {!done ? (
          <>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Set a new password</h1>
            <p className="text-slate-500 text-sm mb-8">
              Choose a new password for your account.
            </p>
            {!token && (
              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                No reset token found in this link. Request a new one from the Forgot Password page.
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                prefix={<KeyRound className="w-3.5 h-3.5" />}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                prefix={<KeyRound className="w-3.5 h-3.5" />}
                required
              />
              <Button type="submit" size="lg" className="w-full" loading={loading} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Reset Password
              </Button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-12 h-12 rounded-2xl bg-orbit-success/15 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Password updated</h1>
            <p className="text-slate-500 text-sm mb-8">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Button size="lg" className="w-full" onClick={() => navigate('/sign-in')}>
              Go to Sign In
            </Button>
          </motion.div>
        )}

        <Link
          to="/sign-in"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </motion.div>
    </div>
  )
}
