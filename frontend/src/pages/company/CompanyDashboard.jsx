import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Users,
  BookOpenCheck,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Calendar,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react'

import DashboardShell from '../../components/DashboardShell'
import { Card, CardBody } from '../../components/ui'

import CompanyProfile from './view/CompanyProfile'

import PlacementsPage from '../shared/PlacementsPage'
import PlacementDetailPage from '../shared/PlacementDetailPage'

import TrainingsPage from '../shared/TrainingsPage'
import TrainingDetailPage from '../shared/TrainingDetailPage'

import ApplicationsPage from '../shared/ApplicationsPage'
import ScheduleInterviewsPage from '../shared/ScheduleInterviewsPage'

import ChangePasswordPage from '../shared/ChangePasswordPage'
import SettingsPage from '../settings/SettingsPage'

import api from '@/services/api'


const viewComponents = {
  'post-job': PlacementsPage,
  'manage-jobs': PlacementsPage,
  'placement-detail': PlacementDetailPage,

  'post-training': TrainingsPage,
  'manage-training': TrainingsPage,
  'training-detail': TrainingDetailPage,

  'recruitment': ApplicationsPage,
  'shortlisted': ApplicationsPage,

  'interview': ScheduleInterviewsPage,

  'profile': CompanyProfile,
  'change-password': ChangePasswordPage,

  settings: SettingsPage,
}


const colorClasses = {
  violet: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-400'
  },

  cyan: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400'
  },

  emerald: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400'
  },

  amber: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400'
  },
}


function Overview() {

  const [data, setData] = useState({
    placements: [],
    trainings: [],
    placementApps: [],
    trainingApps: [],
  })

  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  useEffect(() => {

    let active = true

    const loadData = async () => {

      try {

        setLoading(true)

        setError('')

        const [
          placementsRes,
          trainingsRes,
          placementAppsRes,
          trainingAppsRes
        ] = await Promise.all([

          api
            .get('/placements')
            .catch(() => null),

          api
            .get('/trainings')
            .catch(() => null),

          api
            .get('/placement-applications')
            .catch(() => null),

          api
            .get('/training-applications')
            .catch(() => null),

        ])


        if (active) {

          const placements =
            placementsRes?.data ||
            placementsRes ||
            []

          const trainings =
            trainingsRes?.data ||
            trainingsRes ||
            []

          const placementApps =
            placementAppsRes?.data ||
            placementAppsRes ||
            []

          const trainingApps =
            trainingAppsRes?.data ||
            trainingAppsRes ||
            []


          setData({
            placements: Array.isArray(placements)
              ? placements
              : [],

            trainings: Array.isArray(trainings)
              ? trainings
              : [],

            placementApps: Array.isArray(placementApps)
              ? placementApps
              : [],

            trainingApps: Array.isArray(trainingApps)
              ? trainingApps
              : [],
          })
        }

      } catch (err) {

        if (active) {
          setError(
            err.message ||
            'Failed to load dashboard data'
          )
        }

      } finally {

        if (active) {
          setLoading(false)
        }

      }
    }


    loadData()


    return () => {
      active = false
    }

  }, [])


  /*
  |--------------------------------------------------------------------------
  | Dashboard Statistics
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {

    const activeJobs =
      data.placements.filter(
        (p) => p.is_active
      ).length


    const totalApplications =
      data.placementApps.length +
      data.trainingApps.length


    const shortlistedCount =
      data.placementApps.filter(
        (app) => app.status_id === 2
      ).length
      +
      data.trainingApps.filter(
        (app) => app.status_id === 2
      ).length


    const totalTrainings =
      data.trainings.length


    return [

      {
        id: 'active-jobs',
        label: 'Active Job Posts',
        value: String(activeJobs),
        icon: Briefcase,
        color: 'violet'
      },

      {
        id: 'applications',
        label: 'Total Applications',
        value: String(totalApplications),
        icon: Users,
        color: 'cyan'
      },

      {
        id: 'shortlisted',
        label: 'Shortlisted',
        value: String(shortlistedCount),
        icon: UserCheck,
        color: 'emerald'
      },

      {
        id: 'trainings',
        label: 'Trainings Posted',
        value: String(totalTrainings),
        icon: BookOpenCheck,
        color: 'amber'
      },

    ]

  }, [data])


  /*
  |--------------------------------------------------------------------------
  | Recent Applications
  |--------------------------------------------------------------------------
  */

  const recentApps = useMemo(() => {

    const placements =
      data.placementApps.map((app) => {

        const studentName =
          app.student_table?.user_table?.name ||
          'Student'


        const deptName =
          app.student_table
            ?.department_table
            ?.department_name ||
          'N/A'


        const cgpaVal =
          app.student_table?.cgpa ||
          'N/A'


        const title =
          app.placement_table?.title ||
          'Placement Job'


        let statusStr = 'Pending'


        if (app.status_id === 2) {
          statusStr = 'Shortlisted'
        }


        if (app.status_id === 3) {
          statusStr = 'Rejected'
        }


        return {

          student: studentName,

          position: title,

          branch: deptName,

          cgpa: cgpaVal,

          status: statusStr,

          date: new Date(
            app.date_of_submission ||
            Date.now()
          ),

        }

      })


    const trainings =
      data.trainingApps.map((app) => {

        const studentName =
          app.student_table?.user_table?.name ||
          'Student'


        const deptName =
          app.student_table
            ?.department_table
            ?.department_name ||
          'N/A'


        const cgpaVal =
          app.student_table?.cgpa ||
          'N/A'


        const title =
          app.training_table?.title ||
          'Training Program'


        let statusStr = 'Pending'


        if (app.status_id === 2) {
          statusStr = 'Shortlisted'
        }


        if (app.status_id === 3) {
          statusStr = 'Rejected'
        }


        return {

          student: studentName,

          position: title,

          branch: deptName,

          cgpa: cgpaVal,

          status: statusStr,

          date: new Date(
            app.date_of_submission ||
            Date.now()
          ),

        }

      })


    return [
      ...placements,
      ...trainings
    ]
      .sort(
        (a, b) => b.date - a.date
      )
      .slice(0, 5)

  }, [data])


  /*
  |--------------------------------------------------------------------------
  | Active Jobs
  |--------------------------------------------------------------------------
  */

  const activeJobsList = useMemo(() => {

    return data.placements

      .filter(
        (p) => p.is_active
      )

      .slice(0, 3)

      .map((p) => {

        const appCount =
          data.placementApps.filter(
            (app) =>
              app.placement_id ===
              p.placement_id
          ).length


        let deadlineStr = 'No deadline'


        if (p.last_date_of_submission) {

          deadlineStr =
            new Date(
              p.last_date_of_submission
            ).toLocaleDateString(
              'en-IN',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }
            )

        }


        return {

          title:
            p.title ||
            'Untitled Placement',

          applications:
            appCount,

          deadline:
            deadlineStr,

          status:
            'Open',

        }

      })

  }, [data])


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="flex items-center justify-center gap-2 text-slate-400 py-12">

        <Loader2 className="h-5 w-5 animate-spin" />

        Loading dashboard data...

      </div>

    )
  }


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {

    return (

      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">

        {error}

      </div>

    )
  }


  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  return (

    <>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {stats.map((stat, i) => {

          const colors =
            colorClasses[stat.color]


          /*
          |--------------------------------------------------------------------------
          | Statistic card destinations
          |--------------------------------------------------------------------------
          */

          const statViews = {
            'active-jobs': 'manage-jobs',
            applications: 'recruitment',
            shortlisted: 'shortlisted',
            trainings: 'manage-training',
          }


          const targetView =
            statViews[stat.id]


          return (

            <motion.button

              key={stat.id}

              type="button"

              initial={{
                opacity: 0,
                y: 16
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              transition={{
                duration: 0.35,
                delay: i * 0.07
              }}

              onClick={() =>
                navigate(
                  `?view=${targetView}`
                )
              }

              className="bg-orbit-surface rounded-xl border border-orbit-border hover:border-orbit-border2 transition-colors p-5 text-left w-full"

            >

              <div className="flex items-start justify-between mb-4">

                <div
                  className={`p-2 rounded-lg ${colors.bg}`}
                >

                  <stat.icon
                    className={`w-4 h-4 ${colors.text}`}
                  />

                </div>

              </div>


              <p className="text-xs text-slate-500 font-medium mb-1">

                {stat.label}

              </p>


              <p className="text-2xl font-bold text-slate-100 tracking-tight">

                {stat.value}

              </p>

            </motion.button>

          )

        })}

      </div>


      {/* =====================================================
          RECENT APPLICATIONS + ACTIVE JOBS
      ====================================================== */}

      <div className="grid lg:grid-cols-3 gap-6">


        {/* Recent Applications */}

        <div className="lg:col-span-2 bg-orbit-surface rounded-xl border border-orbit-border p-5">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-sm font-semibold text-slate-200">

              Recent Applications

            </h2>


            <button
              type="button"
              onClick={() =>
                navigate(
                  '?view=recruitment'
                )
              }
              className="text-xs text-orbit-primary-light hover:text-orbit-accent transition-colors"
            >

              View All

            </button>

          </div>


          <div className="space-y-2">

            <div className="grid grid-cols-5 gap-3 px-3 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">

              <span>Student</span>

              <span>Position</span>

              <span>Branch</span>

              <span>CGPA</span>

              <span>Status</span>

            </div>


            {recentApps.length === 0 ? (

              <div className="text-xs text-slate-500 py-6 text-center">

                No applications received yet.

              </div>

            ) : (

              recentApps.map((app, i) => (

                <motion.div

                  key={i}

                  initial={{
                    opacity: 0,
                    x: -8
                  }}

                  animate={{
                    opacity: 1,
                    x: 0
                  }}

                  transition={{
                    delay: i * 0.05
                  }}

                  className="grid grid-cols-5 gap-3 px-3 py-2.5 rounded-lg hover:bg-white/3 transition-colors items-center"

                >

                  <span className="text-sm text-slate-200 truncate">

                    {app.student}

                  </span>


                  <span className="text-sm text-slate-400 truncate">

                    {app.position}

                  </span>


                  <span className="text-sm text-slate-400">

                    {app.branch}

                  </span>


                  <span className="text-sm text-slate-300 font-medium">

                    {app.cgpa}

                  </span>


                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${
                      app.status === 'New' ||
                      app.status === 'Pending'
                        ? 'bg-blue-500/15 text-blue-400'
                        : app.status === 'Reviewed'
                        ? 'bg-violet-500/15 text-violet-400'
                        : app.status === 'Shortlisted'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >

                    {app.status}

                  </span>

                </motion.div>

              ))

            )}

          </div>

        </div>


        {/* Active Jobs */}

        <div className="bg-orbit-surface rounded-xl border border-orbit-border p-5">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-sm font-semibold text-slate-200">

              Active Jobs

            </h2>


            <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium">

              {activeJobsList.length} Open

            </span>

          </div>


          <div className="space-y-3">

            {activeJobsList.length === 0 ? (

              <div className="text-xs text-slate-500 py-6 text-center">

                No active job posts found.

              </div>

            ) : (

              activeJobsList.map((job, i) => (

                <motion.div

                  key={i}

                  initial={{
                    opacity: 0,
                    y: 8
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  transition={{
                    delay: i * 0.08
                  }}

                  className="p-3 rounded-lg border border-orbit-border hover:border-orbit-border2 transition-colors"

                >

                  <p className="text-sm font-medium text-slate-200">

                    {job.title}

                  </p>


                  <div className="flex items-center gap-3 mt-2">

                    <span className="text-xs text-slate-500">

                      <Users className="w-3 h-3 inline mr-1" />

                      {job.applications} apps

                    </span>


                    <span className="text-xs text-slate-500">

                      <Calendar className="w-3 h-3 inline mr-1" />

                      {job.deadline}

                    </span>

                  </div>


                  <div className="mt-2">

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        job.status === 'Open'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : job.status === 'Closing Soon'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >

                      {job.status}

                    </span>

                  </div>

                </motion.div>

              ))

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="bg-orbit-surface rounded-xl border border-orbit-border p-5">

        <h2 className="text-sm font-semibold text-slate-200 mb-4">

          Quick Actions

        </h2>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {[
            {
              icon: Plus,
              label: 'Post New Job',
              view: 'post-job',
              color:
                'text-violet-400 bg-violet-500/10'
            },

            {
              icon: Eye,
              label: 'View Applications',
              view: 'recruitment',
              color:
                'text-cyan-400 bg-cyan-500/10'
            },

            {
              icon: Calendar,
              label: 'Schedule Interview',
              view: 'interview',
              color:
                'text-emerald-400 bg-emerald-500/10'
            },

            {
              icon: FileText,
              label: 'Post Training',
              view: 'post-training',
              color:
                'text-amber-400 bg-amber-500/10'
            },

          ].map(action => (

            <button

              type="button"

              key={action.label}

              onClick={() =>
                navigate(
                  `?view=${action.view}`
                )
              }

              className="flex items-center gap-3 p-3 rounded-lg border border-orbit-border hover:border-orbit-border2 hover:bg-white/3 transition-all"

            >

              <div
                className={`p-2 rounded-lg ${action.color}`}
              >

                <action.icon className="w-4 h-4" />

              </div>


              <span className="text-sm text-slate-300 font-medium">

                {action.label}

              </span>

            </button>

          ))}

        </div>

      </div>

    </>

  )
}


/*
|--------------------------------------------------------------------------
| Company Dashboard
|--------------------------------------------------------------------------
*/

export default function CompanyDashboard() {

  const [searchParams] =
    useSearchParams()

  const view =
    searchParams.get('view')


  const ViewComponent =
    view
      ? viewComponents[view]
      : null


  if (ViewComponent) {

    return <ViewComponent />

  }


  return (

    <DashboardShell
      title="Company Dashboard"
      subtitle="Manage job postings, review applications, and conduct recruitment."
    >

      <Overview />

    </DashboardShell>

  )
}