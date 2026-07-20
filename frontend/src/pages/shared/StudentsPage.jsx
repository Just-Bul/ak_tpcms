import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Ban, Eye, Pencil, Users, GraduationCap, Layers } from 'lucide-react'
import DashboardShell from '@/components/DashboardShell'
import { Card, CardBody, Button, Avatar } from '@/components/ui'
import { DataTable } from '@/components/common/DataTable'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { StudentModal } from '@/components/modals/StudentModal'
import { StudentDetailModal } from '@/components/modals/StudentDetailModal'
import { DisableModal } from '@/components/modals/DisableModal'
import { BulkAddStudentsModal } from '@/components/modals/BulkAddStudentsModal'
import { useAuth } from '@/hooks/useAuth'
import { useRolePermission } from '@/hooks/useRolePermission'
import { useFetchList } from '@/hooks/useFetchList'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useModal } from '@/hooks/useModal'
import api from '@/services/api'

function normalizeStudent(raw) {
  return {
    user_id: raw.user_id,
    roll_no: raw.roll_no || 'N/A',
    name: raw.user_table?.name || raw.name || 'Unknown',
    email: raw.user_table?.email || raw.email || '',
    department_name: raw.department_table?.department_name || raw.department || 'Not Assigned',
    semester: raw.semester_table?.semester || raw.semester || '—',
    cgpa: raw.cgpa ?? null,
    is_graduate: Boolean(raw.is_graduate),
    is_active: raw.is_active !== false,
    image_url: raw.image_url || '',
  }
}

/**
 * Shared Students page — replaces superadmin ViewStudents/AddStudents/EditStudent/DisableStudents
 * and coordinator ViewStudents/StudentDetails. Actions are gated by role; Add/Edit/Disable/Detail
 * are modals instead of separate pages/routes (item 2).
 */
export default function StudentsPage() {
  const { role } = useAuth()
  const { can } = useRolePermission()
  const [searchParams] = useSearchParams()
  const isSuperAdmin = role === 'Super Admin'

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data: rawStudents, loading, refetch } = useFetchList(async () => {
    const res = await api.get('/students/')
    return res?.data || []
  })

  const students = useMemo(() => rawStudents.map(normalizeStudent), [rawStudents])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return students
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.roll_no.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    )
  }, [students, debouncedSearch])

  const { page, setPage, totalPages, pageItems, total } = usePagination(filtered, 10)

  const addModal = useModal()
  const bulkAddModal = useModal()
  const editModal = useModal()
  const detailModal = useModal()
  const disableModal = useModal()
  const [selectedKeys, setSelectedKeys] = useState(new Set())
  const [bulkDisabling, setBulkDisabling] = useState(false)

  useEffect(() => {
    const id = searchParams.get('id')
    const view = searchParams.get('view')
    if (view === 'disable-students') disableModal.open()
    else if (view === 'add-students') addModal.open()
    else if (view === 'edit-students' && id) editModal.open({ user_id: Number(id) })
    else if (id) detailModal.open(Number(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleGraduate = async (student) => {
    await api.put(`/students/${student.user_id}`, { is_graduate: !student.is_graduate })
    refetch()
  }

  const handleBulkDisable = async () => {
    if (!selectedKeys.size || !window.confirm(`Disable ${selectedKeys.size} selected student(s)?`)) return
    setBulkDisabling(true)
    try {
      await Promise.all([...selectedKeys].map((id) => api.put(`/students/${id}`, { is_graduate: true })))
      setSelectedKeys(new Set())
      refetch()
    } catch (err) {
      alert(err.message || 'Failed to disable some students.')
    } finally {
      setBulkDisabling(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" src={s.image_url} initials={s.name.slice(0, 2)} />
          <div className="min-w-0">
            <p className="font-medium text-orbit-text-primary truncate">{s.name}</p>
            <p className="text-xs text-slate-500 truncate">{s.roll_no}</p>
          </div>
        </div>
      ),
    },
    { key: 'department_name', header: 'Department' },
    { key: 'semester', header: 'Semester' },
    { key: 'cgpa', header: 'CGPA', render: (s) => s.cgpa ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <span className={s.is_graduate ? 'text-slate-500' : 'text-emerald-400'}>
          {s.is_graduate ? 'Graduated' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Button size="xs" variant="outline" icon={<Eye size={13} />} onClick={() => detailModal.open(s.user_id)}>
            View
          </Button>
          {can('Super Admin') && (
            <Button size="xs" variant="ghost" icon={<Pencil size={13} />} onClick={() => editModal.open(s)}>
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardShell
      title="Students"
      subtitle={isSuperAdmin ? 'All registered students' : 'Students in your department'}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, roll no, or email..." className="sm:max-w-sm" />
          {can('Super Admin') && (
            <div className="flex flex-wrap gap-2">
              {selectedKeys.size > 0 && (
                <Button variant="destructive" loading={bulkDisabling} icon={<Ban size={16} />} onClick={handleBulkDisable}>
                  Disable Selected ({selectedKeys.size})
                </Button>
              )}
              <Button variant="outline" icon={<Ban size={16} />} onClick={() => disableModal.open()}>
                Disabled Students
              </Button>
              <Button variant="outline" icon={<Layers size={16} />} onClick={() => bulkAddModal.open()}>
                Bulk Add
              </Button>
              <Button icon={<UserPlus size={16} />} onClick={() => addModal.open()}>
                Add Student
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardBody>
            <DataTable
              columns={columns}
              data={pageItems}
              rowKey={(s) => s.user_id}
              loading={loading}
              emptyTitle="No students found"
              selectable={can('Super Admin')}
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
            />
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          </CardBody>
        </Card>

        {!isSuperAdmin && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardBody>
                <h2 className="mb-4 text-sm font-semibold text-orbit-text-primary flex items-center gap-2">
                  <Users size={16} /> Overview
                </h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Total Students</span><span className="font-semibold text-orbit-text-primary">{students.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Active</span><span className="font-semibold text-emerald-400">{students.filter((s) => !s.is_graduate).length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Graduated</span><span className="font-semibold text-slate-400">{students.filter((s) => s.is_graduate).length}</span></div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <h2 className="mb-4 text-sm font-semibold text-orbit-text-primary flex items-center gap-2">
                  <GraduationCap size={16} /> By CGPA Range
                </h2>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: '8.0 and above', test: (s) => s.cgpa >= 8 },
                    { label: '6.0 – 7.99', test: (s) => s.cgpa >= 6 && s.cgpa < 8 },
                    { label: 'Below 6.0', test: (s) => s.cgpa != null && s.cgpa < 6 },
                  ].map((bucket) => (
                    <div key={bucket.label} className="flex justify-between">
                      <span className="text-slate-500">{bucket.label}</span>
                      <span className="font-semibold text-orbit-text-primary">{students.filter(bucket.test).length}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      <StudentModal open={addModal.isOpen} onClose={addModal.close} onSaved={refetch} />
      <BulkAddStudentsModal open={bulkAddModal.isOpen} onClose={bulkAddModal.close} onSaved={refetch} />
      <StudentModal open={editModal.isOpen} onClose={editModal.close} student={editModal.payload} onSaved={refetch} />
      <StudentDetailModal open={detailModal.isOpen} onClose={detailModal.close} studentId={detailModal.payload} />
      <DisableModal
        open={disableModal.isOpen}
        onClose={disableModal.close}
        title="Disabled Students"
        items={students}
        loading={loading}
        getId={(s) => s.user_id}
        getLabel={(s) => s.name}
        getSubLabel={(s) => s.roll_no}
        isDisabled={(s) => s.is_graduate}
        onToggle={toggleGraduate}
        disabledLabel="Graduated"
      />
    </DashboardShell>
  )
}
