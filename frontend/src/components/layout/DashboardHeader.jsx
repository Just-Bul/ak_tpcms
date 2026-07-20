import { motion } from 'framer-motion'

export default function DashboardHeader() {
  const auth = JSON.parse(
    localStorage.getItem('auth_user')
  )

  const user = auth?.user || {}

  const now = new Date()

  const greeting =
    now.getHours() < 12
      ? 'Good Morning'
      : now.getHours() < 17
      ? 'Good Afternoon'
      : now.getHours() < 21
      ? 'Good Evening'
      : 'Good Night'

  const dateStr = now.toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-between mb-6"
    >

      <div>

        <h1 className="text-2xl font-bold text-slate-100">

          {greeting},{" "}

          {user?.name?.toUpperCase() ||
            user?.role?.toUpperCase() ||
            "ADMIN"}

          <span className="inline-block ml-2 animate-[wave_2s_ease-in-out_infinite]">
            👋
          </span>

        </h1>

        <p className="text-sm text-slate-500 mt-1">
          {dateStr}
        </p>

      </div>

    </motion.div>
  )
}
