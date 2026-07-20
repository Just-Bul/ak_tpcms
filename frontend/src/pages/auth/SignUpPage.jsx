import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Building2, Globe, Briefcase, Phone } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import api from '../../services/api'

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [mobile_no, setMobile_no] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/organizations', {
        name,
        email,
        mobile_no,
        password,
      })
      console.log('Registration successful')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-orbit-bg flex items-center justify-center p-6 relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-orbit-primary/8 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-orbit-accent/8 blur-[100px] rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-orbit-success/15 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Registration Submitted!</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Your company registration has been submitted for review. The T&P admin will verify your details and approve your account. You'll receive an email notification once approved.
          </p>
          <Link to="/sign-in">
            <Button variant="outline" size="lg" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orbit-bg flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-orbit-primary/8 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-orbit-accent/8 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-orbit-primary flex items-center justify-center glow-primary">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-slate-100 font-semibold">TPCMS</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30 mb-4">
          <Building2 className="w-3 h-3" />
          Company Registration
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-1">Register your company</h1>
        <p className="text-slate-500 text-sm mb-6">
          Register as a recruitment partner. Admin approval required before login.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Company Name" type="text" placeholder="TechCorp Ltd." prefix={<Building2 className="w-3.5 h-3.5" />} value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Contact Person" type="text" placeholder="John Smith" prefix={<User className="w-3.5 h-3.5" />} required />
          </div>
          <Input label="Business Email" type="email" placeholder="hr@techcorp.com" prefix={<Mail className="w-3.5 h-3.5" />} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" prefix={<Phone className="w-3.5 h-3.5" />} value={mobile_no} onChange={(e) => setMobile_no(e.target.value)} required />
            <Input label="Industry" type="text" placeholder="IT / Software" prefix={<Briefcase className="w-3.5 h-3.5" />} required />
          </div>
          <Input label="Company Website (Optional)" type="url" placeholder="https://techcorp.com" prefix={<Globe className="w-3.5 h-3.5" />} />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            prefix={<Lock className="w-3.5 h-3.5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suffix={
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            }
            required
          />
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            prefix={<Lock className="w-3.5 h-3.5" />}
            suffix={
              <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="text-slate-500 hover:text-slate-300 transition-colors">
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            }
            required
          />

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input type="checkbox" className="mt-0.5 rounded border-orbit-border bg-orbit-surface2 text-orbit-primary w-3.5 h-3.5 flex-shrink-0" required />
            <span className="text-xs text-slate-500 leading-relaxed">
              I agree to the{' '}
              <a href="#" className="text-orbit-primary-light hover:text-orbit-accent transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-orbit-primary-light hover:text-orbit-accent transition-colors">Privacy Policy</a>
            </span>
          </label>

          <div className="bg-orbit-surface2 border border-orbit-border rounded-lg p-3 flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-400 text-xs">!</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your registration will be reviewed by the T&P admin. You can login only after your account is approved.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
            Submit Registration
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8">
          Already registered?{' '}
          <Link to="/sign-in" className="text-orbit-primary-light hover:text-orbit-accent transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
