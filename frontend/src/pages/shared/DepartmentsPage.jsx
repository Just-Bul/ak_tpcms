import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Ban, Pencil, Upload } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Button } from '@/components/ui'
import { DataTable } from '@/components/common/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DepartmentModal } from '@/components/modals/DepartmentModal'
import { DisableModal } from '@/components/modals/DisableModal'
import { BulkAddDepartmentsModal } from '@/components/modals/BulkAddDepartmentsModal'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import { useModal } from '@/hooks/useModal'
import { fetchDepartments, setDepartmentActiveState } from '@/services/departmentApi'

/** Shared Departments page — replaces ViewDepartments/AddDepartment/EditDepartment pages with one page + modals. */
export default function DepartmentsPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data: departments, loading, refetch } = useFetchList(fetchDepartments)

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return departments
    return departments.filter(
      (d) =>
        (d.department_name || '').toLowerCase().includes(q) ||
        (d.user_table?.name || '').toLowerCase().includes(q)
    )
  }, [departments, debouncedSearch])

  const formModal = useModal()
  const disableModal = useModal()
  const bulkModal = useModal()

  useEffect(() => {
    const id = searchParams.get('id')
    const view = searchParams.get('view')
    if (view === 'add-department') formModal.open()
    else if (view === 'edit-department' && id && departments.length) {
      const dept = departments.find((d) => String(d.department_id) === String(id))
      if (dept) formModal.open(dept)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments])

  const handleToggleActive = async (department) => {
    await setDepartmentActiveState(department.department_id, department.is_active === false)
    refetch()
  }

  const columns = [
    { key: 'department_id', header: 'ID', render: (d) => <span className="font-mono text-xs text-slate-500">{d.department_id}</span> },
    { key: 'department_name', header: 'Department', render: (d) => <span className="font-medium text-orbit-text-primary">{d.department_name}</span> },
    { key: 'coordinator', header: 'Coordinator', render: (d) => d.user_table?.name || '—' },
    { key: 'email', header: 'Email', render: (d) => <span className="text-xs text-slate-500">{d.user_table?.email || '—'}</span> },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={{ label: d.is_active ? 'Active' : 'Inactive', variant: d.is_active ? 'success' : 'neutral' }} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (d) => (
        <Button size="xs" variant="outline" icon={<Pencil size={13} />} onClick={() => formModal.open(d)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <DashboardShell title="Departments" subtitle="Manage academic departments and coordinators">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search department or coordinator..." className="sm:max-w-sm" />
          <div className="flex gap-2">
            <Button variant="outline" icon={<Ban size={16} />} onClick={() => disableModal.open()}>
              Disabled Departments
            </Button>
            <Button variant="outline" icon={<Upload size={16} />} onClick={() => bulkModal.open()}>
              Bulk Add
            </Button>
            <Button icon={<UserPlus size={16} />} onClick={() => formModal.open()}>
              Add Department
            </Button>
          </div>
        </div>

        <Card>
          <CardBody>
            <DataTable columns={columns} data={filtered} rowKey={(d) => d.department_id} loading={loading} emptyTitle="No departments found" />
          </CardBody>
        </Card>
      </div>

      <DepartmentModal open={formModal.isOpen} onClose={formModal.close} department={formModal.payload} onSaved={refetch} />

      <BulkAddDepartmentsModal open={bulkModal.isOpen} onClose={bulkModal.close} onSaved={refetch} />

      <DisableModal
        open={disableModal.isOpen}
        onClose={disableModal.close}
        title="Department Status"
        items={departments}
        loading={loading}
        getId={(d) => d.department_id}
        getLabel={(d) => d.department_name}
        getSubLabel={(d) => d.user_table?.name}
        isDisabled={(d) => d.is_active === false}
        onToggle={handleToggleActive}
      />
    </DashboardShell>
  )
}
