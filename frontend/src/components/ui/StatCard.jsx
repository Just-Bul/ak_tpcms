import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const colorMap = {
  primary: {
    icon: 'bg-orbit-primary/15 text-orbit-primary-light',
    chart: '#7C3AED',
    positive: 'text-violet-400',
  },
  accent: {
    icon: 'bg-orbit-accent/15 text-orbit-accent-light',
    chart: '#06B6D4',
    positive: 'text-cyan-400',
  },
  success: {
    icon: 'bg-orbit-success/15 text-emerald-400',
    chart: '#10B981',
    positive: 'text-emerald-400',
  },
  warning: {
    icon: 'bg-orbit-warning/15 text-amber-400',
    chart: '#F59E0B',
    positive: 'text-amber-400',
  },
}

export function StatCard({ data, index = 0 }) {
  const colors = colorMap[data.color]
  const isPositive = data.change >= 0
  const isNegativeGood = data.id === 'churn'
  const changeIsGood = isNegativeGood ? !isPositive : isPositive

  const maxVal = Math.max(...data.sparkData.map(d => d.value), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="bg-orbit-surface rounded-xl border border-orbit-border hover:border-orbit-border2 transition-colors overflow-hidden group"
    >
      <div className="p-5">
        {/* Top row: icon + change badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2 rounded-lg', colors.icon)}>
            <data.icon className="w-4 h-4" />
          </div>
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              changeIsGood
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {changeIsGood ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(data.change)}%
          </div>
        </div>

        {/* Label + Value */}
        <p className="text-xs text-slate-500 font-medium mb-1">{data.label}</p>
        <p className="text-2xl font-bold text-slate-100 tracking-tight">{data.value}</p>
        <p className="text-xs text-slate-600 mt-1">{data.changeLabel}</p>
      </div>

      {/* Sparkline */}
      <div className="h-14 -mb-0.5 flex items-end gap-0.5 px-5 pb-3">
        {data.sparkData.map((d, i) => {
          const height = Math.max((d.value / maxVal) * 100, 8)
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-300"
              style={{
                height: `${height}%`,
                backgroundColor: colors.chart,
                opacity: 0.6 + (i / data.sparkData.length) * 0.4,
              }}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
