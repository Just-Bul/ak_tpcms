import { useMemo, useState } from 'react'
import { Trophy } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Avatar, Badge } from '@/components/ui'
import { DataTable } from '@/components/common/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import { fetchPlacementApplications } from '@/services/applications'

function formatLpa(value) {
  if (!value) return null
  return `₹${(Number(value) / 100000).toFixed(1)}L`
}

/**
 * Placed Students (item 26) — students with an approved placement application, showing
 * company/package/year. There's no dedicated "placed" status on the backend (only Pending/
 * Approved/Rejected — see utils/getApplicationStatus.js), so "Approved" placement applications
 * are used as the closest available signal for "placed".
 */
export default function PlacedStudentsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const { data: applications, loading } = useFetchList(fetchPlacementApplications)

  const placed = useMemo(() => {
    return applications
      .filter((a) => a.status_id === 2)
      .map((a) => ({
        key: `${a.placement_id}-${a.student_id}`,
        studentName: a.student_table?.user_table?.name || a.student_table?.name || `Student #${a.student_id}`,
        department: a.student_table?.department_table?.department_name || '—',
        company: a.placement_table?.organization_table?.user_table?.name || 'Company',
        title: a.placement_table?.title || 'Placement',
        package: formatLpa(a.placement_table?.salary_upper || a.placement_table?.salary_lower),
        year: a.date_of_submission ? new Date(a.date_of_submission).getFullYear() : '—',
      }))
  }, [applications])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return placed
    return placed.filter((p) => p.studentName.toLowerCase().includes(q) || p.company.toLowerCase().includes(q))
  }, [placed, debouncedSearch])

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" initials={p.studentName.slice(0, 2)} />
          <div>
            <p className="font-medium text-orbit-text-primary">{p.studentName}</p>
            <p className="text-xs text-slate-500">{p.department}</p>
          </div>
        </div>
      ),
    },
    { key: 'company', header: 'Company', render: (p) => p.company },
    { key: 'role', header: 'Role', render: (p) => p.title },
    { key: 'package', header: 'Package', render: (p) => p.package ? <Badge variant="success">{p.package}</Badge> : '—' },
    { key: 'year', header: 'Year', render: (p) => p.year },
  ]

  return (
    <DashboardShell title="Placed Students" subtitle="Students placed through campus recruitment">
      <div className="space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by student or company..." className="sm:max-w-sm" />
        <Card>
          <CardBody>
            <DataTable
              columns={columns}
              data={filtered}
              rowKey={(p) => p.key}
              loading={loading}
              emptyTitle="No placed students yet"
              emptyDescription="Students will appear here once their placement applications are approved."
            />
          </CardBody>
        </Card>
        {!loading && filtered.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Trophy size={13} className="text-amber-400" /> {filtered.length} student{filtered.length === 1 ? '' : 's'} placed
          </p>
        )}
      </div>
    </DashboardShell>
  )
}
