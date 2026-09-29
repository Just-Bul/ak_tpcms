import { useEffect, useState } from 'react'
import { UserPlus, Save } from 'lucide-react'

import { Modal } from '@/components/common/Modal'
import { Loading } from '@/components/common/Loading'
import {
  Button,
  Input,
  Select,
  Switch,
  MediaUpload,
} from '@/components/ui'

import { useMasterData } from '@/hooks/useMasterData'
import api from '@/services/api'

const emptyForm = {
  roll_no: '',
  name: '',
  email: '',
  password: '',
  mobile_no: '',

  department_id: '',
  semester_id: '',
  gender_id: '',
  category_id: '',
  tenth_division_id: '',
  twelfth_division_id: '',

  date_of_birth: '',
  cgpa: '',

  has_backlog: false,

  /*
   * Frontend-only status.
   *
   * ACTIVE  -> is_graduate false
   * ALUMNI  -> is_graduate true
   * DISABLED -> currently cannot be persisted because
   *             backend does not accept student_status.
   */
  student_status: 'ACTIVE',

  /*
   * Frontend display only for now.
   * Backend currently rejects graduation_year.
   */
  graduation_year: '',

  /*
   * Existing backend field.
   */
  is_graduate: false,

  resume_url: '',
  image_url: '',
}

function findIdByLabel(
  items,
  idKey,
  labelKey,
  label
) {
  if (!label) return ''

  const found = items.find(
    (item) =>
      String(item[labelKey] || '').toLowerCase() ===
      String(label).toLowerCase()
  )

  return found?.[idKey] ?? ''
}

const toOptionalNumber = (value) =>
  value === '' || value == null
    ? undefined
    : Number(value)

const toOptionalString = (value) => {
  const trimmed = String(value ?? '').trim()

  return trimmed || undefined
}

export function StudentModal({
  open,
  onClose,
  student,
  onSaved,
}) {
  const isEdit = Boolean(student)

  const { data: master } = useMasterData([
    'departments',
    'semesters',
    'genders',
    'categories',
    'divisions',
  ])

  const [form, setForm] = useState(emptyForm)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /*
   * =========================================================
   * LOAD STUDENT
   * =========================================================
   */

  useEffect(() => {
    if (!open) return

    setError('')

    /*
     * ADD MODE
     */
    if (!isEdit) {
      setForm({
        ...emptyForm,
      })

      return
    }

    /*
     * EDIT MODE
     */
    setLoading(true)

    api
      .get(`/students/${student.user_id}`)
      .then((res) => {
        const d = res?.data || {}

        /*
         * Determine status for frontend display.
         *
         * If backend already returns student_status,
         * use it.
         *
         * Otherwise fall back to legacy is_graduate.
         */
        const rawStatus = String(
          d.student_status ??
            d.status ??
            ''
        ).toUpperCase()

        let studentStatus

        if (
          rawStatus === 'ACTIVE' ||
          rawStatus === 'ALUMNI' ||
          rawStatus === 'DISABLED'
        ) {
          studentStatus = rawStatus
        } else if (d.is_graduate) {
          studentStatus = 'ALUMNI'
        } else {
          studentStatus = 'ACTIVE'
        }

        setForm({
          ...emptyForm,

          roll_no:
            d.roll_no || '',

          name:
            d.name ||
            d.user_table?.name ||
            '',

          email:
            d.email ||
            d.user_table?.email ||
            '',

          mobile_no:
            d.mobile_no ||
            d.user_table?.mobile_no ||
            '',

          department_id:
            findIdByLabel(
              master.departments || [],
              'department_id',
              'department_name',
              d.department
            ),

          semester_id:
            findIdByLabel(
              master.semesters || [],
              'semester_id',
              'semester',
              d.semester
            ),

          gender_id:
            findIdByLabel(
              master.genders || [],
              'gender_id',
              'gender',
              d.gender
            ),

          category_id:
            findIdByLabel(
              master.categories || [],
              'category_id',
              'category',
              d.category
            ),

          tenth_division_id:
            findIdByLabel(
              master.divisions || [],
              'division_id',
              'division',
              d.tenth_division
            ),

          twelfth_division_id:
            findIdByLabel(
              master.divisions || [],
              'division_id',
              'division',
              d.twelfth_division
            ),

          date_of_birth:
            d.date_of_birth
              ? String(
                  d.date_of_birth
                ).slice(0, 10)
              : '',

          cgpa:
            d.cgpa ?? '',

          has_backlog:
            Boolean(d.has_backlog),

          /*
           * Frontend status.
           */
          student_status:
            studentStatus,

          /*
           * Read-only/display value for now.
           * It is NOT sent to the backend.
           */
          graduation_year:
            d.graduation_year ??
            d.graduationYear ??
            d.alumni_table
              ?.passing_year ??
            '',

          /*
           * Existing backend field.
           */
          is_graduate:
            Boolean(d.is_graduate),

          resume_url:
            d.resume_url || '',

          image_url:
            d.image_url || '',
        })
      })
      .catch((err) => {
        setError(
          err?.message ||
            'Failed to load student'
        )
      })
      .finally(() => {
        setLoading(false)
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    isEdit,
    student?.user_id,
    master.departments,
    master.semesters,
    master.genders,
    master.categories,
    master.divisions,
  ])

  /*
   * =========================================================
   * GENERIC INPUT UPDATE
   * =========================================================
   */

  const update = (field) => (e) => {
    const value =
      e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /*
   * =========================================================
   * STATUS CHANGE
   * =========================================================
   */

  const handleStatusChange = (
    status
  ) => {
    setForm((prev) => ({
      ...prev,

      student_status:
        status,

      /*
       * Existing backend understands this field.
       *
       * Alumni = true
       * Active = false
       *
       * Disabled currently also becomes false
       * because backend has no student_status
       * update support.
       */
      is_graduate:
        status === 'ALUMNI',
    }))
  }

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError('')

    try {
      /*
       * =====================================================
       * EDIT
       * =====================================================
       */

      if (isEdit) {
        /*
         * IMPORTANT:
         *
         * Do NOT send:
         *
         * student_status
         * graduation_year
         *
         * The current backend validation rejects
         * those two keys.
         *
         * Only existing backend-supported fields
         * are sent below.
         */

        await api.put(
          `/students/${student.user_id}`,
          {
            name:
              toOptionalString(
                form.name
              ),

            roll_no:
              toOptionalString(
                form.roll_no
              ),

            email:
              toOptionalString(
                form.email
              ),

            mobile_no:
              toOptionalString(
                form.mobile_no
              ),

            gender_id:
              toOptionalNumber(
                form.gender_id
              ),

            department_id:
              toOptionalNumber(
                form.department_id
              ),

            semester_id:
              toOptionalNumber(
                form.semester_id
              ),

            date_of_birth:
              toOptionalString(
                form.date_of_birth
              ),

            has_backlog:
              form.has_backlog,

            /*
             * Send status for proper 3-state lifecycle
             */
            status:
              form.student_status === 'ALUMNI'
                ? 'alumni'
                : form.student_status === 'DISABLED'
                  ? 'disabled'
                  : 'active',

            /*
             * Send graduation_year when Alumni
             */
            ...(form.student_status === 'ALUMNI' && form.graduation_year
              ? { graduation_year: Number(form.graduation_year) }
              : {}),

            is_graduate:
              form.is_graduate,

            cgpa:
              toOptionalNumber(
                form.cgpa
              ),

            twelfth_division_id:
              toOptionalNumber(
                form.twelfth_division_id
              ),

            tenth_division_id:
              toOptionalNumber(
                form.tenth_division_id
              ),

            category_id:
              toOptionalNumber(
                form.category_id
              ),

            resume_url:
              toOptionalString(
                form.resume_url
              ),

            image_url:
              toOptionalString(
                form.image_url
              ),
          }
        )
      }

      /*
       * =====================================================
       * ADD
       * =====================================================
       */

      else {
        await api.post(
          '/students/',
          {
            roll_no:
              form.roll_no.trim(),

            name:
              form.name.trim(),

            email:
              form.email.trim(),

            password:
              form.password,

            department_id:
              Number(
                form.department_id
              ),

            semester_id:
              Number(
                form.semester_id
              ),
          }
        )
      }

      /*
       * Refresh student list
       */
      onSaved?.()

      /*
       * Close modal
       */
      onClose()
    } catch (err) {
      setError(
        err?.message ||
          'Failed to save student'
      )
    } finally {
      setSaving(false)
    }
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEdit
          ? 'Edit Student'
          : 'Add Student'
      }
      icon={
        isEdit ? (
          <Save size={18} />
        ) : (
          <UserPlus size={18} />
        )
      }
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            loading={saving}
            icon={
              isEdit ? (
                <Save size={16} />
              ) : (
                <UserPlus size={16} />
              )
            }
          >
            {isEdit
              ? 'Save Changes'
              : 'Add Student'}
          </Button>
        </>
      }
    >
      {loading ? (
        <Loading label="Loading student..." />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {error && (
            <p className="md:col-span-2 text-sm text-orbit-danger">
              {error}
            </p>
          )}

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <Input
            label="Roll Number"
            value={form.roll_no}
            onChange={update(
              'roll_no'
            )}
            required
          />

          <Input
            label="Full Name"
            value={form.name}
            onChange={update(
              'name'
            )}
            required
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={update(
              'email'
            )}
            required
          />

          {!isEdit ? (
            <Input
              label="Password"
              type="password"
              value={
                form.password
              }
              onChange={update(
                'password'
              )}
              required
            />
          ) : (
            <Input
              label="Mobile Number"
              value={
                form.mobile_no
              }
              onChange={update(
                'mobile_no'
              )}
              maxLength={10}
            />
          )}

          {/* =================================================
              DEPARTMENT
          ================================================= */}

          <Select
            label="Department"
            value={
              form.department_id
            }
            onChange={update(
              'department_id'
            )}
            required={!isEdit}
          >
            <option value="">
              Select Department
            </option>

            {(
              master.departments ||
              []
            ).map((d) => (
              <option
                key={
                  d.department_id
                }
                value={
                  d.department_id
                }
              >
                {
                  d.department_name
                }
              </option>
            ))}
          </Select>

          {/* =================================================
              SEMESTER
          ================================================= */}

          <Select
            label="Semester"
            value={
              form.semester_id
            }
            onChange={update(
              'semester_id'
            )}
            required={!isEdit}
          >
            <option value="">
              Select Semester
            </option>

            {(
              master.semesters ||
              []
            ).map((s) => (
              <option
                key={
                  s.semester_id
                }
                value={
                  s.semester_id
                }
              >
                {s.semester}
              </option>
            ))}
          </Select>

          {isEdit && (
            <>
              {/* =============================================
                  GENDER
              ============================================= */}

              <Select
                label="Gender"
                value={
                  form.gender_id
                }
                onChange={update(
                  'gender_id'
                )}
              >
                <option value="">
                  Select Gender
                </option>

                {(
                  master.genders ||
                  []
                ).map((g) => (
                  <option
                    key={
                      g.gender_id
                    }
                    value={
                      g.gender_id
                    }
                  >
                    {g.gender}
                  </option>
                ))}
              </Select>

              {/* =============================================
                  CATEGORY
              ============================================= */}

              <Select
                label="Category"
                value={
                  form.category_id
                }
                onChange={update(
                  'category_id'
                )}
              >
                <option value="">
                  Select Category
                </option>

                {(
                  master.categories ||
                  []
                ).map((c) => (
                  <option
                    key={
                      c.category_id
                    }
                    value={
                      c.category_id
                    }
                  >
                    {c.category}
                  </option>
                ))}
              </Select>

              {/* =============================================
                  10TH DIVISION
              ============================================= */}

              <Select
                label="10th Division"
                value={
                  form.tenth_division_id
                }
                onChange={update(
                  'tenth_division_id'
                )}
              >
                <option value="">
                  Select Division
                </option>

                {(
                  master.divisions ||
                  []
                ).map((d) => (
                  <option
                    key={
                      d.division_id
                    }
                    value={
                      d.division_id
                    }
                  >
                    {d.division}
                  </option>
                ))}
              </Select>

              {/* =============================================
                  12TH DIVISION
              ============================================= */}

              <Select
                label="12th Division"
                value={
                  form.twelfth_division_id
                }
                onChange={update(
                  'twelfth_division_id'
                )}
              >
                <option value="">
                  Select Division
                </option>

                {(
                  master.divisions ||
                  []
                ).map((d) => (
                  <option
                    key={
                      d.division_id
                    }
                    value={
                      d.division_id
                    }
                  >
                    {d.division}
                  </option>
                ))}
              </Select>

              {/* =============================================
                  DATE OF BIRTH
              ============================================= */}

              <Input
                label="Date of Birth"
                type="date"
                value={
                  form.date_of_birth
                }
                onChange={update(
                  'date_of_birth'
                )}
              />

              {/* =============================================
                  CGPA
              ============================================= */}

              <Input
                label="CGPA"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.cgpa}
                onChange={update(
                  'cgpa'
                )}
              />

              {/* =============================================
                  RESUME
              ============================================= */}

              <MediaUpload
                label="Resume"
                value={
                  form.resume_url
                }
                onChange={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    resume_url:
                      url,
                  }))
                }
                accept="image/*,application/pdf"
                uploadPath="/uploads/resume"
              />

              {/* =============================================
                  PROFILE IMAGE
              ============================================= */}

              <MediaUpload
                label="Profile Image"
                value={
                  form.image_url
                }
                onChange={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    image_url:
                      url,
                  }))
                }
                accept="image/*"
                uploadPath="/uploads/profile"
              />

              {/* =============================================
                  HAS BACKLOG
              ============================================= */}

              <div className="flex items-center gap-3">
                <Switch
                  checked={
                    form.has_backlog
                  }
                  onCheckedChange={(
                    value
                  ) =>
                    setForm((prev) => ({
                      ...prev,
                      has_backlog:
                        value,
                    }))
                  }
                />

                <span className="text-sm text-slate-300">
                  Has Backlog
                </span>
              </div>

              {/* =============================================
                  STUDENT STATUS
              ============================================= */}

              <Select
                label="Student Status"
                value={
                  form.student_status
                }
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value
                  )
                }
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="ALUMNI">
                  Alumni
                </option>

                <option value="DISABLED">
                  Disabled
                </option>
              </Select>

              {/* =============================================
                  GRADUATION YEAR
              ============================================= */}

              {form.student_status ===
                'ALUMNI' && (
                <Input
                  label="Graduation Year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={
                    form.graduation_year
                  }
                  onChange={update(
                    'graduation_year'
                  )}
                  
                />
              )}
            </>
          )}
        </form>
      )}
    </Modal>
  )
}

export default StudentModal