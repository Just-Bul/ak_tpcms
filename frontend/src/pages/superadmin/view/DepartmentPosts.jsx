import { useEffect, useState } from "react"
import DashboardShell from "../../../components/DashboardShell"
import { Card, CardBody, Badge } from "../../../components/ui"
import { Loader2, Briefcase, BookOpenCheck } from "lucide-react"
import { api } from "../../../services/api"

export default function DepartmentPosts() {
  const [loading, setLoading] = useState(true)
  const [placements, setPlacements] = useState([])
  const [trainings, setTrainings] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes] = await Promise.all([api.get("/placements"), api.get("/trainings/")])
        setPlacements(pRes.data || [])
        setTrainings(tRes.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardShell title="Department Posts" subtitle="Job and training posts">
      {loading ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              Loading posts...
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Briefcase size={16} /> Placements / Jobs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {placements.map((p) => (
                <Card key={p.placement_id}>
                  <CardBody>
                    <p className="text-sm font-medium text-slate-200">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Min CGPA: {p.min_cgpa}</p>
                    <Badge variant={p.is_active ? "success" : "neutral"} className="mt-2">
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <BookOpenCheck size={16} /> Trainings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trainings.map((t) => (
                <Card key={t.training_id}>
                  <CardBody>
                    <p className="text-sm font-medium text-slate-200">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Min CGPA: {t.min_cgpa}</p>
                    <Badge variant={t.is_active ? "success" : "neutral"} className="mt-2">
                      {t.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
