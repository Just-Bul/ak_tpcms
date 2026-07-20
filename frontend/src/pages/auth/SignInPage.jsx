import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import api from '../../services/api';
import { normalizeUiRole, DASHBOARD_PATHS } from '../../utils/auth';

// Backend requires role_id and rejects login with a generic 401 if it doesn't match the
// account's real role — there's no lookup-by-email endpoint to discover it up front. To offer
// an email+password-only form without any backend change, we try every role_id and use
// whichever one succeeds (Promise.any — first success wins, no visible extra step for the user).
const ROLE_IDS = [1, 2, 3, 4]; // Super Admin, Student, Coordinator, Company

const profileSetupPaths = {
  Company: '/company/profile-setup',
  Student: '/students/profile-setup',
};

export default function SignInPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await Promise.any(
        ROLE_IDS.map((role_id) => api.post('/users/login', { email, password, role_id }))
      );

      localStorage.setItem(
        'auth_user',
        JSON.stringify({
          user: result.data,
          token: result.data.auth_token,
        })
      );

      const uiRole = normalizeUiRole(result.data);
      const firstLogin = result.data?.first_login === true;
      if (firstLogin && profileSetupPaths[uiRole]) {
        navigate(profileSetupPaths[uiRole]);
        return;
      }

      navigate(DASHBOARD_PATHS[uiRole] || '/');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-orbit-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-orbit-border bg-orbit-surface p-8"
      >
        <div className="text-center mb-6">
          <Shield className="mx-auto mb-3 text-orbit-primary" />
          <h1 className="text-2xl font-bold text-orbit-text-primary">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your TPCMS account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefix={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefix={<Lock className="w-4 h-4" />}
            suffix={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-orbit-primary">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
