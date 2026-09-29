import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  UserPlus,
  Ban,
  Eye,
  Pencil,
  Users,
  GraduationCap,
  Layers,
} from 'lucide-react'

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

/* =========================================================
   NORMALIZE STUDENT
========================================================= */

function normalizeStudent(raw = {}) {
  const rawStatus = String(
    raw.student_status ??
      raw.status ??
      ''
  ).toUpperCase()

  let studentStatus


  if (
    rawStatus === 'ACTIVE' ||
    rawStatus === 'ALUMNI' ||
    rawStatus === 'DISABLED'
  ) {
    studentStatus = rawStatus
  } else if (raw.is_graduate) {
    // Legacy backend fallback
    studentStatus = 'ALUMNI'
  } else if (raw.is_active === false) {
    studentStatus = 'DISABLED'
  } else {
    studentStatus = 'ACTIVE'
  }

  return {
    user_id: raw.user_id,

    roll_no:
      raw.roll_no ||
      'N/A',

    name:
      raw.user_table?.name ||
      raw.name ||
      'Unknown',

    email:
      raw.user_table?.email ||
      raw.email ||
      '',

    /* =====================================================
       Department
    ===================================================== */

    department_id:
      raw.department_id ??
      raw.department_table?.department_id ??
      raw.department?.department_id ??
      raw.department?.id ??
      null,

    department_name:
      raw.department_table?.department_name ||
      raw.department_table?.dept_name ||
      raw.department?.department_name ||
      raw.department?.dept_name ||
      raw.department?.name ||
      raw.department ||
      'Not Assigned',

    /* =====================================================
       Semester
    ===================================================== */

    semester_id:
      raw.semester_id ??
      raw.semester_table?.semester_id ??
      raw.semester?.semester_id ??
      raw.semester?.id ??
      null,

    semester:
      raw.semester_table?.semester ||
      raw.semester_table?.semester_name ||
      raw.semester?.semester ||
      raw.semester?.semester_name ||
      raw.semester?.name ||
      raw.semester ||
      '—',

    /* =====================================================
       CGPA
    ===================================================== */

    cgpa:
      raw.cgpa ??
      raw.user_table?.cgpa ??
      raw.student_table?.cgpa ??
      raw.student?.cgpa ??
      null,

    /* =====================================================
       Graduation Year
    ===================================================== */

    graduation_year:
      raw.graduation_year ??
      raw.graduationYear ??
      raw.year_of_graduation ??
      raw.user_table?.graduation_year ??
      raw.student_table?.graduation_year ??
      raw.student?.graduation_year ??
      '',

    /* =====================================================
       Legacy Fields
    ===================================================== */

    is_graduate:
      Boolean(raw.is_graduate),

    is_active:
      raw.is_active !== false,

    /* =====================================================
       New Lifecycle Status
    ===================================================== */

    student_status:
      studentStatus,

    /* =====================================================
       Image
    ===================================================== */

    image_url:
      raw.image_url || '',
  }
}

/* =========================================================
   STUDENTS PAGE
========================================================= */

export default function StudentsPage() {
  const { role } = useAuth()
  const { can } = useRolePermission()
  const [searchParams] =
    useSearchParams()

  /*
    Super Admin:
      - Can see all students
      - Can use department filter

    Coordinator:
      - Backend /students/ already returns only
        their department's students
      - No frontend department lookup/filter is needed
  */

  const isSuperAdmin =
    role === 'Super Admin'

  const isCoordinator =
    role === 'Coordinator'

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] =
    useState('')

  const debouncedSearch =
    useDebounce(search)

  /* =======================================================
     FILTERS
  ======================================================= */

  const [filters, setFilters] =
    useState({
      cgpa: '',
      status: 'all',
      semester: 'all',
      department: 'all',
      graduationYear: 'all',
    })

  /* =======================================================
     FILTER OPTIONS FROM DATABASE
  ======================================================= */

  const [filterOptions, setFilterOptions] =
    useState({
      semesters: [],
      departments: [],
    })

  /* =======================================================
     LOAD SEMESTERS + DEPARTMENTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false

    const loadFilterOptions =
      async () => {
        try {
          const [
            semesterRes,
            departmentRes,
          ] = await Promise.all([
            api.get('/semesters'),
            api.get('/departments'),
          ])

          if (cancelled) return

          const semesters =
            semesterRes?.data?.data ??
            semesterRes?.data ??
            []

          const departments =
            departmentRes?.data?.data ??
            departmentRes?.data?.dept ??
            departmentRes?.data ??
            []

          setFilterOptions({
            semesters:
              Array.isArray(
                semesters
              )
                ? semesters
                : [],

            departments:
              Array.isArray(
                departments
              )
                ? departments
                : [],
          })
        } catch (error) {
          console.error(
            'Failed to load filter options:',
            error
          )
        }
      }

    /*
      We still load departments because
      Super Admin needs them.

      Coordinator does not render the
      Department filter.
    */

    loadFilterOptions()

    return () => {
      cancelled = true
    }
  }, [])

  /* =======================================================
     FETCH STUDENTS
  ======================================================= */

  const {
    data: rawStudents,
    loading,
    refetch,
  } = useFetchList(
    async () => {
      const res =
        await api.get('/students/')

        console.log("STUDENTS RESPONSE:", res)
        console.log("STUDENTS RESPONSE DATA:", res?.data)
        console.log("STUDENTS RESPONSE DATA LENGTH:", 
          Array.res?.data?.data)
  
    }
  )

  /* =======================================================
     NORMALIZE STUDENTS
  ======================================================= */

  /*
    IMPORTANT:

    Do NOT filter Coordinator students here.

    Backend already determines which students
    a Coordinator is allowed to receive.
  */

const students = useMemo(() => {
  const list = Array.isArray(rawStudents)
    ? rawStudents
    : []

  console.log('RAW STUDENTS:', list)
  console.log('RAW STUDENTS LENGTH:', list.length)

  if (list.length > 0) {
    console.table(
      list.map((student) => ({
        user_id: student.user_id,
        roll_no: student.roll_no,
        name: student.user_table?.name,
        is_graduate: student.is_graduate,
        graduation_year: student.graduation_year,
        student_status: student.student_status,
      }))
    )
  }

  return list.map(normalizeStudent)
}, [rawStudents])

  /* =======================================================
     GRADUATION YEAR OPTIONS
  ======================================================= */

  const currentYear =
    new Date().getFullYear()

  const collegeEstablishedYear =
    2017

  const graduationYears =
    useMemo(() => {
      return Array.from(
        {
          length:
            currentYear -
            collegeEstablishedYear +
            1,
        },
        (_, index) =>
          currentYear - index
      )
    }, [
      currentYear,
      collegeEstablishedYear,
    ])

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filtered =
    useMemo(() => {
      const q = String(
        debouncedSearch ?? ''
      )
        .trim()
        .toLowerCase()

      return students.filter(
        (student) => {
          /* -----------------------------------------------
             SEARCH
          ------------------------------------------------ */

          if (q) {
            const name =
              String(
                student.name ?? ''
              ).toLowerCase()

            const rollNo =
              String(
                student.roll_no ?? ''
              ).toLowerCase()

            const email =
              String(
                student.email ?? ''
              ).toLowerCase()

            const cgpa =
              String(
                student.cgpa ?? ''
              ).toLowerCase()

            const matches =
              name.includes(q) ||
              rollNo.includes(q) ||
              email.includes(q) ||
              cgpa.includes(q)

            if (!matches) {
              return false
            }
          }

          /* -----------------------------------------------
             CGPA FILTER
          ------------------------------------------------ */

          if (
            filters.cgpa.trim()
          ) {
            const minimumCgpa =
              Number(
                filters.cgpa
              )

            const studentCgpa =
              Number(
                student.cgpa
              )

            if (
              !Number.isNaN(
                minimumCgpa
              ) &&
              (
                Number.isNaN(
                  studentCgpa
                ) ||
                studentCgpa <
                  minimumCgpa
              )
            ) {
              return false
            }
          }

          /* -----------------------------------------------
             STATUS FILTER
          ------------------------------------------------ */

          if (
            filters.status !==
              'all' &&
            student.student_status !==
              filters.status.toUpperCase()
          ) {
            return false
          }

          /* -----------------------------------------------
             SEMESTER
          ------------------------------------------------ */

          if (
            filters.semester !==
              'all' &&
            String(
              student.semester_id
            ) !==
              String(
                filters.semester
              )
          ) {
            return false
          }

          /* -----------------------------------------------
             DEPARTMENT / BRANCH
          ------------------------------------------------ */

          if (
            isSuperAdmin &&
            filters.department !==
              'all' &&
            String(
              student.department_id
            ) !==
              String(
                filters.department
              )
          ) {
            return false
          }

          /* -----------------------------------------------
             GRADUATION YEAR
          ------------------------------------------------ */

          if (
            filters.graduationYear !==
              'all' &&
            String(
              student.graduation_year
            ) !==
              String(
                filters.graduationYear
              )
          ) {
            return false
          }

          return true
        }
      )
    }, [
      students,
      debouncedSearch,
      filters,
      isSuperAdmin,
    ])

  /* =======================================================
     PAGINATION
  ======================================================= */

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    total,
  } = usePagination(
    filtered,
    10
  )

  /* =======================================================
     RESET PAGINATION WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    filters,
    setPage,
  ])

  /* =======================================================
     MODALS
  ======================================================= */

  const addModal =
    useModal()

  const bulkAddModal =
    useModal()

  const editModal =
    useModal()

  const detailModal =
    useModal()

  const disableModal =
    useModal()

  /* =======================================================
     SELECTION
  ======================================================= */

  const [
    selectedKeys,
    setSelectedKeys,
  ] = useState(
    new Set()
  )

  const [
    bulkDisabling,
    setBulkDisabling,
  ] = useState(false)

  /* =======================================================
     URL ACTIONS
  ======================================================= */

  useEffect(() => {
    const id =
      searchParams.get('id')

    const view =
      searchParams.get('view')

    if (
      view ===
      'disable-students'
    ) {
      disableModal.open()
    } else if (
      view ===
      'add-students'
    ) {
      addModal.open()
    } else if (
      view ===
        'edit-students' &&
      id
    ) {
      editModal.open({
        user_id: Number(id),
      })
    } else if (id) {
      detailModal.open(
        Number(id)
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* =======================================================
     TOGGLE GRADUATE
     
     NOTE:
     Existing backend endpoint currently uses
     is_graduate. Do not send student_status here
     until backend support is confirmed.
  ======================================================= */

  const toggleGraduate =
    async (student) => {
      try {
        await api.put(
          `/students/${student.user_id}`,
          {
            is_graduate:
              !student.is_graduate,
          }
        )

        refetch()
      } catch (error) {
        console.error(
          'Failed to update student:',
          error
        )

        alert(
          error?.message ||
            'Failed to update student.'
        )
      }
    }

  /* =======================================================
     BULK DISABLE

     Existing backend endpoint still receives
     is_graduate. This is intentionally unchanged
     until backend support for student_status is confirmed.
  ======================================================= */

  const handleBulkDisable =
    async () => {
      if (
        !selectedKeys.size ||
        !window.confirm(
          `Disable ${selectedKeys.size} selected student(s)?`
        )
      ) {
        return
      }

      setBulkDisabling(true)

      try {
        await Promise.all(
          [
            ...selectedKeys,
          ].map(
            (id) =>
              api.put(
                `/students/${id}`,
                {
                  is_graduate:
                    true,
                }
              )
          )
        )

        setSelectedKeys(
          new Set()
        )

        refetch()
      } catch (err) {
        alert(
          err?.message ||
            'Failed to disable some students.'
        )
      } finally {
        setBulkDisabling(false)
      }
    }

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      key: 'name',
      header: 'Student',

      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar
            size="sm"
            src={
              student.image_url
            }
            initials={student.name.slice(
              0,
              2
            )}
          />

          <div className="min-w-0">
            <p className="font-medium text-orbit-text-primary truncate">
              {
                student.name
              }
            </p>

            <p className="text-xs text-slate-500 truncate">
              {
                student.roll_no
              }
            </p>
          </div>
        </div>
      ),
    },

    {
      key: 'department_name',
      header: 'Department',
    },

    {
      key: 'semester',
      header: 'Semester',
    },

    {
      key: 'cgpa',
      header: 'CGPA',

      render: (student) =>
        student.cgpa ??
        '—',
    },

    /* =====================================================
       STATUS
    ===================================================== */

    {
      key: 'status',
      header: 'Status',

      render: (student) => {
        const status =
          student.student_status

        const statusClass =
          status === 'DISABLED'
            ? 'text-red-400'
            : status ===
                'ALUMNI'
              ? 'text-slate-400'
              : 'text-emerald-400'

        const statusLabel =
          status === 'DISABLED'
            ? 'Disabled'
            : status ===
                'ALUMNI'
              ? 'Alumni'
              : 'Active'

        return (
          <span
            className={
              statusClass
            }
          >
            {statusLabel}
          </span>
        )
      },
    },

    /* =====================================================
       ACTIONS
    ===================================================== */

    {
      key: 'actions',
      header: 'Actions',

      render: (student) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            icon={
              <Eye
                size={13}
              />
            }
            onClick={() =>
              detailModal.open(
                student.user_id
              )
            }
          >
            View
          </Button>

          {can(
            'Super Admin'
          ) && (
            <Button
              size="xs"
              variant="ghost"
              icon={
                <Pencil
                  size={13}
                />
              }
              onClick={() =>
                editModal.open(
                  student
                )
              }
            >
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ]

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters =
    () => {
      setFilters({
        cgpa: '',
        status: 'all',
        semester: 'all',
        department: 'all',
        graduationYear:
          'all',
      })

      setSearch('')
    }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <DashboardShell
      title="Students"
      subtitle={
        isSuperAdmin
          ? 'All registered students'
          : 'Students in your department'
      }
    >
      <div className="space-y-4">

        {/* =================================================
            SEARCH + ACTIONS
        ================================================= */}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

          <SearchBar
            value={
              search
            }
            onChange={
              setSearch
            }
            placeholder="Search by name, roll no, email, or CGPA..."
            className="sm:max-w-sm"
          />

          {can(
            'Super Admin'
          ) && (
            <div className="flex flex-wrap gap-2">

              {selectedKeys.size >
                0 && (
                <Button
                  variant="destructive"
                  loading={
                    bulkDisabling
                  }
                  icon={
                    <Ban
                      size={
                        16
                      }
                    />
                  }
                  onClick={
                    handleBulkDisable
                  }
                >
                  Disable Selected (
                  {
                    selectedKeys.size
                  })
                </Button>
              )}

              <Button
                variant="outline"
                icon={
                  <Ban
                    size={16}
                  />
                }
                onClick={() =>
                  disableModal.open()
                }
              >
                Disabled Students
              </Button>

              <Button
                variant="outline"
                icon={
                  <Layers
                    size={16}
                  />
                }
                onClick={() =>
                  bulkAddModal.open()
                }
              >
                Bulk Add
              </Button>

              <Button
                icon={
                  <UserPlus
                    size={16}
                  />
                }
                onClick={() =>
                  addModal.open()
                }
              >
                Add Student
              </Button>
            </div>
          )}
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="flex flex-wrap gap-2">

          {/* CGPA */}

          <input
            type="text"
            value={
              filters.cgpa
            }
            onChange={(e) =>
              setFilters(
                (prev) => ({
                  ...prev,
                  cgpa:
                    e.target.value,
                })
              )
            }
            placeholder="CGPA"
            className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-orbit-text-primary"
          />

          {/* STATUS */}

          <select
            value={
              filters.status
            }
            onChange={(e) =>
              setFilters(
                (prev) => ({
                  ...prev,
                  status:
                    e.target.value,
                })
              )
            }
            className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-orbit-text-primary"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="alumni">
              Alumni
            </option>

            <option value="disabled">
              Disabled
            </option>
          </select>

          {/* SEMESTER */}

          <select
            value={
              filters.semester
            }
            onChange={(e) =>
              setFilters(
                (prev) => ({
                  ...prev,
                  semester:
                    e.target.value,
                })
              )
            }
            className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-orbit-text-primary"
          >
            <option value="all">
              All Semesters
            </option>

            {filterOptions.semesters.map(
              (semester) => (
                <option
                  key={
                    semester.semester_id
                  }
                  value={
                    semester.semester_id
                  }
                >
                  {
                    semester.semester
                  }
                </option>
              )
            )}
          </select>

          {/* =================================================
              BRANCH / DEPARTMENT

              ONLY Super Admin sees this filter.
          ================================================= */}

          {isSuperAdmin && (
            <select
              value={
                filters.department
              }
              onChange={(e) =>
                setFilters(
                  (prev) => ({
                    ...prev,
                    department:
                      e.target.value,
                  })
                )
              }
              className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-orbit-text-primary"
            >
              <option value="all">
                All Branches
              </option>

              {filterOptions.departments.map(
                (
                  department
                ) => {
                  const id =
                    department.department_id ??
                    department.dept_id ??
                    department.id

                  const name =
                    department.department_name ??
                    department.dept_name ??
                    department.name ??
                    department.branch_name ??
                    department.branch ??
                    'Unknown'

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {
                        name
                      }
                    </option>
                  )
                }
              )}
            </select>
          )}

          {/* GRADUATION YEAR */}

          <select
            value={
              filters.graduationYear
            }
            onChange={(e) =>
              setFilters(
                (prev) => ({
                  ...prev,
                  graduationYear:
                    e.target.value,
                })
              )
            }
            className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-orbit-text-primary"
          >
            <option value="all">
              All Graduation Years
            </option>

            {graduationYears.map(
              (year) => (
                <option
                  key={String(
                    year
                  )}
                  value={String(
                    year
                  )}
                >
                  {year}
                </option>
              )
            )}
          </select>

          {/* RESET */}

          <Button
            variant="outline"
            onClick={
              resetFilters
            }
          >
            Reset
          </Button>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <Card>
          <CardBody>

            <DataTable
              columns={
                columns
              }
              data={
                pageItems
              }
              rowKey={(student) =>
                student.user_id
              }
              loading={
                loading
              }
              emptyTitle="No students found"
              selectable={
                can(
                  'Super Admin'
                )
              }
              selectedKeys={
                selectedKeys
              }
              onSelectionChange={
                setSelectedKeys
              }
            />

            <Pagination
              page={
                page
              }
              totalPages={
                totalPages
              }
              total={
                total
              }
              onPageChange={
                setPage
              }
            />

          </CardBody>
        </Card>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {!isSuperAdmin && (
          <div className="grid gap-4 md:grid-cols-2">

            <Card>
              <CardBody>

                <h2 className="mb-4 text-sm font-semibold text-orbit-text-primary flex items-center gap-2">
                  <Users
                    size={16}
                  />
                  Overview
                </h2>

                <div className="space-y-2.5 text-sm">

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Total Students
                    </span>

                    <span className="font-semibold text-orbit-text-primary">
                      {
                        students.length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Active
                    </span>

                    <span className="font-semibold text-emerald-400">
                      {
                        students.filter(
                          (
                            student
                          ) =>
                            student.student_status ===
                            'ACTIVE'
                        ).length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Alumni
                    </span>

                    <span className="font-semibold text-slate-400">
                      {
                        students.filter(
                          (
                            student
                          ) =>
                            student.student_status ===
                            'ALUMNI'
                        ).length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Disabled
                    </span>

                    <span className="font-semibold text-red-400">
                      {
                        students.filter(
                          (
                            student
                          ) =>
                            student.student_status ===
                            'DISABLED'
                        ).length
                      }
                    </span>
                  </div>

                </div>

              </CardBody>
            </Card>

            <Card>
              <CardBody>

                <h2 className="mb-4 text-sm font-semibold text-orbit-text-primary flex items-center gap-2">
                  <GraduationCap
                    size={16}
                  />
                  By CGPA Range
                </h2>

                <div className="space-y-2.5 text-sm">

                  {[
                    {
                      label:
                        '8.0 and above',

                      test:
                        (
                          student
                        ) =>
                          Number(
                            student.cgpa
                          ) >= 8,
                    },

                    {
                      label:
                        '6.0 – 7.99',

                      test:
                        (
                          student
                        ) =>
                          Number(
                            student.cgpa
                          ) >= 6 &&
                          Number(
                            student.cgpa
                          ) < 8,
                    },

                    {
                      label:
                        'Below 6.0',

                      test:
                        (
                          student
                        ) =>
                          student.cgpa !=
                            null &&
                          Number(
                            student.cgpa
                          ) < 6,
                    },
                  ].map(
                    (
                      bucket
                    ) => (
                      <div
                        key={
                          bucket.label
                        }
                        className="flex justify-between"
                      >
                        <span className="text-slate-500">
                          {
                            bucket.label
                          }
                        </span>

                        <span className="font-semibold text-orbit-text-primary">
                          {
                            students.filter(
                              bucket.test
                            ).length
                          }
                        </span>
                      </div>
                    )
                  )}

                </div>

              </CardBody>
            </Card>

          </div>
        )}
      </div>

      {/* =================================================
          MODALS
      ================================================= */}

      <StudentModal
        open={
          addModal.isOpen
        }
        onClose={
          addModal.close
        }
        onSaved={
          refetch
        }
      />

      <BulkAddStudentsModal
        open={
          bulkAddModal.isOpen
        }
        onClose={
          bulkAddModal.close
        }
        onSaved={
          refetch
        }
      />

      <StudentModal
        open={
          editModal.isOpen
        }
        onClose={
          editModal.close
        }
        student={
          editModal.payload
        }
        onSaved={
          refetch
        }
      />

      <StudentDetailModal
        open={
          detailModal.isOpen
        }
        onClose={
          detailModal.close
        }
        studentId={
          detailModal.payload
        }
      />

      <DisableModal
        open={
          disableModal.isOpen
        }
        onClose={
          disableModal.close
        }
        title="Disabled Students"
        items={
          students
        }
        loading={
          loading
        }
        getId={(student) =>
          student.user_id
        }
        getLabel={(student) =>
          student.name
        }
        getSubLabel={(student) =>
          student.roll_no
        }
        isDisabled={(student) =>
          student.student_status ===
          'DISABLED'
        }
        onToggle={
          toggleGraduate
        }
        disabledLabel="Disabled"
      />
    </DashboardShell>
  )
}