import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap, Building2, Shield, Users, Briefcase,
  Bell, FileText, ArrowRight, ChevronRight, BarChart3,
  CheckCircle, Zap, Lock
} from 'lucide-react'
import { Button } from '@/components/ui'

const features = [
  {
    icon: Shield,
    title: 'T&P / Super Admin',
    desc: 'Complete system control — manage students, companies, departments, and generate placement reports.',
    color: 'from-red-500 to-orange-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: Users,
    title: 'T&P Coordinators',
    desc: 'Department-level management — filter eligible students, post notices, and track applications.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: GraduationCap,
    title: 'Students',
    desc: 'Browse jobs, apply with one click, track application status, and receive placement notifications.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Building2,
    title: 'Companies',
    desc: 'Post job opportunities, manage recruitment drives, shortlist candidates, and schedule interviews.',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
  },
]

const stats = [
  { value: '2,400+', label: 'Students Registered', icon: GraduationCap },
  { value: '150+', label: 'Companies Onboard', icon: Building2 },
  { value: '500+', label: 'Jobs Posted', icon: Briefcase },
  { value: '89%', label: 'Placement Rate', icon: BarChart3 },
]

const steps = [
  { step: '01', title: 'Register & Login', desc: 'Students and companies register on the platform. Admin approves company registrations.' },
  { step: '02', title: 'Post & Browse Jobs', desc: 'Companies post job openings with eligibility criteria. Students browse and apply.' },
  { step: '03', title: 'Review & Shortlist', desc: 'Companies review applications, shortlist candidates, and schedule interviews.' },
  { step: '04', title: 'Get Placed', desc: 'Selected students receive offer letters. T&P cell tracks placement statistics.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-orbit-bg overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orbit-primary/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-orbit-accent/6 blur-[120px] rounded-full" />
      </div>

      {/* ─────────── Navbar ─────────── */}
      <nav className="relative z-10 border-b border-orbit-border/50 backdrop-blur-xl bg-orbit-surface/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orbit-primary flex items-center justify-center glow-primary">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="text-slate-100 font-semibold text-xl tracking-tight">TPCMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/sign-up">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Register Company
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────── Hero ─────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orbit-primary/10 border border-orbit-primary/20 text-xs font-medium text-orbit-primary-light mb-6">
            <Zap className="w-3 h-3" />
            Training & Placement Cell Management System
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight mb-6">
            Simplify Your College's{' '}
            <span className="text-gradient">Placement Process</span>
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A centralized platform connecting students, companies, and placement coordinators.
            Automate recruitment, track placements, and build careers — all in one place.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/sign-in">
              <Button size="xl" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Get Started
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="xl">
                Explore Features
              </Button>
            </a>
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Company registration is available at{' '}
            <Link to="/sign-up" className="text-orbit-primary-light hover:text-orbit-accent underline underline-offset-2">
              /sign-up
            </Link>
          </p>
        </motion.div>
      </section>

      {/* ─────────── Stats ─────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map(stat => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-orbit-surface/60 border border-orbit-border rounded-xl p-5 text-center hover:border-orbit-border2 transition-colors"
            >
              <stat.icon className="w-6 h-6 text-orbit-primary-light mx-auto mb-3 opacity-70" />
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────── Features / Roles ─────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-3">
            Four Roles, One <span className="text-gradient">Unified Platform</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Role-based access ensures every user gets exactly the tools they need.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 gap-5"
        >
          {features.map(feature => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="bg-orbit-surface border border-orbit-border rounded-2xl p-6 hover:border-orbit-border2 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg flex-shrink-0`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────── How It Works ─────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-3">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            From registration to placement — a streamlined 4-step process.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-4 gap-4"
        >
          {steps.map((s, i) => (
            <motion.div key={s.step} variants={itemVariants} className="relative">
              <div className="bg-orbit-surface border border-orbit-border rounded-xl p-5 hover:border-orbit-border2 transition-colors h-full">
                <span className="text-3xl font-bold text-orbit-primary/20 block mb-2">{s.step}</span>
                <h3 className="text-sm font-semibold text-slate-100 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orbit-border2" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────── Key Highlights ─────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="bg-orbit-surface border border-orbit-border rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Why Choose <span className="text-gradient">TPCMS</span>?
              </h2>
              <div className="space-y-3">
                {[
                  'Role-based secure authentication',
                  'Smart job filtering by CGPA, branch & skills',
                  'Real-time notifications & alerts',
                  'Automated placement report generation',
                  'Company registration with admin approval',
                  'Resume builder from student profiles',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-orbit-success flex-shrink-0" />
                    <span className="text-sm text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Lock, label: 'Secure Auth', desc: 'Encrypted & role-based' },
                { icon: Bell, label: 'Notifications', desc: 'Email & dashboard' },
                { icon: FileText, label: 'Reports', desc: 'Auto-generated' },
                { icon: BarChart3, label: 'Analytics', desc: 'Placement insights' },
              ].map(item => (
                <div key={item.label} className="bg-orbit-surface2 border border-orbit-border rounded-xl p-4 text-center hover:border-orbit-border2 transition-colors">
                  <item.icon className="w-5 h-5 text-orbit-primary-light mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-200">{item.label}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Ready to streamline your{' '}
            <span className="text-gradient">placements</span>?
          </h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Join the growing network of colleges using TPCMS to automate their training and placement activities.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/sign-in">
              <Button size="xl" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Login Now
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button variant="outline" size="xl">
                Register as Company
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─────────── Footer ─────────── */}
      <footer className="relative z-10 border-t border-orbit-border/50 bg-orbit-surface/20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orbit-primary flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">T</span>
            </div>
            <span className="text-sm text-slate-400 font-medium">TPCMS</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} TPCMS — Training & Placement Cell Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
