import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Globe,
  Briefcase,
  Phone,
  Upload,
  FileText,
  CheckCircle,
} from 'lucide-react'

import { Button, Input } from '@/components/ui'
import api from '../../services/api'

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  /* =====================================================
     COMPANY FORM
  ===================================================== */

  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [mobile_no, setMobile_no] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /* =====================================================
     SECTORS
  ===================================================== */

  const [sectors, setSectors] = useState([])
  const [sectorsLoading, setSectorsLoading] = useState(true)

  /* =====================================================
     DOCUMENT UPLOAD
  ===================================================== */

  const [docFile, setDocFile] = useState(null)
  const [docUploading, setDocUploading] = useState(false)
  const [docUploaded, setDocUploaded] = useState(false)
  const [docUrl, setDocUrl] = useState('')


  /* =====================================================
     FETCH SECTORS
  ===================================================== */

  useEffect(() => {
    const loadSectors = async () => {
      setSectorsLoading(true)

      try {
        const res = await api.get('/sectors')

        /*
         * Support common API response structures:
         *
         * 1. [ ... ]
         * 2. { data: [ ... ] }
         * 3. { data: { data: [ ... ] } }
         */

        const sectorData =
          Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res?.data?.data)
                ? res.data.data
                : []

        setSectors(sectorData)
      } catch (err) {
        console.error('Failed to load sectors:', err)

        setError(
          err?.message ||
            'Unable to load industry sectors.'
        )
      } finally {
        setSectorsLoading(false)
      }
    }

    loadSectors()
  }, [])


  /* =====================================================
     DOCUMENT SELECT / UPLOAD
  ===================================================== */

  const handleDocSelect = async (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setDocFile(file)
    setDocUploading(true)
    setDocUploaded(false)
    setError('')

    try {
      const res = await api.upload(
        '/uploads/document',
        file
      )

      const url =
        res?.fileUrl ||
        res?.data?.fileUrl ||
        ''

      if (!url) {
        throw new Error('Upload failed')
      }

      setDocUrl(url)
      setDocUploaded(true)
    } catch (err) {
      setError(
        err?.message ||
          'Document upload failed'
      )

      setDocFile(null)
      setDocUrl('')
      setDocUploaded(false)
    } finally {
      setDocUploading(false)
    }
  }


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    /* Password validation */

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      )
      return
    }

    /* Sector validation */

    if (!industry) {
      setError(
        'Please select an industry sector.'
      )
      return
    }

    setLoading(true)

    try {
      const body = {
        name,
        email,
        mobile_no,
        password,

        /*
         * Send sector_id to backend.
         *
         * `industry` contains the selected sector_id.
         */
        sector_id: Number(industry),
      }

      /*
       * Website is optional.
       * Only send it when provided.
       */
      if (website.trim()) {
        body.website = website.trim()
      }

      /*
       * Contact person is optional from the
       * current backend contract.
       */
      if (contactPerson.trim()) {
        body.contact_person = contactPerson.trim()
      }

      if (docUrl) {
        body.document_url = docUrl
      }

      await api.post(
        '/organizations',
        body
      )

      setSubmitted(true)
    } catch (err) {
      setError(
        err?.message ||
          'Unable to submit registration.'
      )
    } finally {
      setLoading(false)
    }
  }


  /* =====================================================
     SUCCESS SCREEN
  ===================================================== */

  if (submitted) {
    return (
      <div className="min-h-screen bg-orbit-bg flex items-center justify-center p-6 relative">

        <div className="fixed inset-0 pointer-events-none">

          <div
            className="
              absolute
              top-0
              left-1/4
              w-[500px]
              h-[300px]
              bg-orbit-primary/8
              blur-[100px]
              rounded-full
            "
          />

          <div
            className="
              absolute
              bottom-0
              right-1/4
              w-[400px]
              h-[300px]
              bg-orbit-accent/8
              blur-[100px]
              rounded-full
            "
          />

        </div>


        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            w-full
            max-w-sm
            text-center
            relative
          "
        >

          <div
            className="
              w-16
              h-16
              rounded-2xl
              bg-orbit-success/15
              flex
              items-center
              justify-center
              mx-auto
              mb-6
            "
          >
            <Building2
              className="
                w-8
                h-8
                text-emerald-400
              "
            />
          </div>


          <h1
            className="
              text-2xl
              font-bold
              text-slate-100
              mb-2
            "
          >
            Registration Submitted!
          </h1>


          <p
            className="
              text-slate-500
              text-sm
              mb-8
              leading-relaxed
            "
          >
            Your company registration has
            been submitted for review. The T&P
            admin will verify your details and
            approve your account. You'll receive
            an email notification once approved.
          </p>


          <Link to="/sign-in">

            <Button
              variant="outline"
              size="lg"
              className="w-full"
            >
              Back to Sign In
            </Button>

          </Link>

        </motion.div>

      </div>
    )
  }


  /* =====================================================
     MAIN SIGNUP PAGE
  ===================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-orbit-bg
        flex
        items-center
        justify-center
        p-6
        relative
      "
    >

      <div
        className="
          fixed
          inset-0
          pointer-events-none
        "
      >

        <div
          className="
            absolute
            top-0
            left-1/4
            w-[500px]
            h-[300px]
            bg-orbit-primary/8
            blur-[100px]
            rounded-full
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-1/4
            w-[400px]
            h-[300px]
            bg-orbit-accent/8
            blur-[100px]
            rounded-full
          "
        />

      </div>


      <motion.div
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          w-full
          max-w-md
          relative
        "
      >

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-2
            mb-8
          "
        >

          <div
            className="
              w-8
              h-8
              rounded-lg
              bg-orbit-primary
              flex
              items-center
              justify-center
              glow-primary
            "
          >
            <span
              className="
                text-white
                font-bold
                text-sm
              "
            >
              T
            </span>
          </div>

          <span
            className="
              text-slate-100
              font-semibold
            "
          >
            TPCMS
          </span>

        </div>


        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div
          className="
            inline-flex
            items-center
            gap-1.5
            px-2.5
            py-1
            rounded-full
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            border
            bg-gradient-to-r
            from-emerald-500/20
            to-green-500/20
            text-emerald-300
            border-emerald-500/30
            mb-4
          "
        >

          <Building2 className="w-3 h-3" />

          Company Registration

        </div>


        <h1
          className="
            text-2xl
            font-bold
            text-slate-100
            mb-1
          "
        >
          Register your company
        </h1>


        <p
          className="
            text-slate-500
            text-sm
            mb-6
          "
        >
          Register as a recruitment partner.
          Admin approval required before login.
        </p>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="
              mb-4
              rounded-lg
              border
              border-red-500/30
              bg-red-500/10
              px-3
              py-2
              text-xs
              text-red-300
            "
          >
            {error}
          </div>

        )}


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Company + Contact */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >

            <Input
              label="Company Name"
              type="text"
              placeholder="TechCorp Ltd."
              prefix={
                <Building2
                  className="w-3.5 h-3.5"
                />
              }
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />


            <Input
              label="Contact Person"
              type="text"
              placeholder="John Smith"
              prefix={
                <User
                  className="w-3.5 h-3.5"
                />
              }
              value={contactPerson}
              onChange={(e) =>
                setContactPerson(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* Email */}

          <Input
            label="Business Email"
            type="email"
            placeholder="hr@techcorp.com"
            prefix={
              <Mail
                className="w-3.5 h-3.5"
              />
            }
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          {/* Phone + Sector */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              prefix={
                <Phone
                  className="w-3.5 h-3.5"
                />
              }
              value={mobile_no}
              onChange={(e) =>
                setMobile_no(
                  e.target.value
                )
              }
              required
            />


            {/* =================================================
                INDUSTRY / SECTOR DROPDOWN
            ================================================= */}

            <div>

              <label
                className="
                  block
                  text-xs
                  font-medium
                  text-slate-400
                  mb-1.5
                "
              >
                Industry
              </label>


              <div className="relative">

                <Briefcase
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-3.5
                    h-3.5
                    text-slate-500
                    pointer-events-none
                    z-10
                  "
                />


                <select
                  value={industry}
                  onChange={(e) =>
                    setIndustry(
                      e.target.value
                    )
                  }
                  required
                  disabled={sectorsLoading}
                  className="
                    w-full
                    h-10
                    appearance-none
                    bg-white
                    rounded-lg
                    border
                    border-orbit-border
                    bg-orbit-surface2
                    pl-9
                    pr-8
                    text-sm
                    text-slate-200
                    outline-none
                    transition-colors
                    focus:border-orbit-primary
                    focus:ring-1
                    focus:ring-orbit-primary/30
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  <option
                    value=""
                    className="bg-white text-slate-900"
                  >
                    {sectorsLoading
                      ? 'Loading sectors...'
                      : 'Select industry'}
                  </option>


                  {sectors.map((sector) => (

                    <option
                      key={sector.sector_id}
                      value={sector.sector_id}
                      className="bg-white bg-text-900"
                    >
                      {sector.sector_name}
                      {sector.sector_shorthand
                        ? ` (${sector.sector_shorthand})`
                        : ''}
                    </option>

                  ))}

                </select>


                {/* Dropdown arrow */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                    text-xs
                  "
                >
                  ▼
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              WEBSITE
          ================================================= */}

          <Input
            label="Company Website (Optional)"
            type="url"
            placeholder="https://techcorp.com"
            prefix={
              <Globe
                className="w-3.5 h-3.5"
              />
            }
            value={website}
            onChange={(e) =>
              setWebsite(e.target.value)
            }
          />


          {/* =================================================
              DOCUMENT UPLOAD
          ================================================= */}

          <div>

            <label
              className="
                block
                text-xs
                font-medium
                text-slate-400
                mb-1.5
              "
            >
              Company Document{' '}
              <span className="text-slate-600">
                (Certificate of Incorporation,
                Registration, etc.)
              </span>
            </label>


            <label
              className="cursor-pointer block"
            >

              <div
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  border
                  border-dashed
                  px-4
                  py-3
                  text-sm
                  transition-colors
                  ${
                    docUploaded
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                      : docUploading
                        ? 'border-orbit-primary/40 bg-orbit-primary/5 text-orbit-primary-light'
                        : 'border-slate-600 bg-orbit-surface2 text-slate-400 hover:border-orbit-primary hover:text-orbit-primary-light'
                  }
                `}
              >

                {docUploaded ? (

                  <CheckCircle
                    className="
                      w-4
                      h-4
                      flex-shrink-0
                    "
                  />

                ) : docUploading ? (

                  <div
                    className="
                      w-4
                      h-4
                      border-2
                      border-current
                      border-t-transparent
                      rounded-full
                      animate-spin
                      flex-shrink-0
                    "
                  />

                ) : (

                  <Upload
                    className="
                      w-4
                      h-4
                      flex-shrink-0
                    "
                  />

                )}


                <span className="truncate">

                  {docUploaded && docFile
                    ? docFile.name
                    : docUploading
                      ? 'Uploading...'
                      : 'Choose document file...'}

                </span>

              </div>


              <input
                type="file"
                className="hidden"
                accept="
                  image/*,
                  application/pdf,
                  .doc,
                  .docx
                "
                onChange={handleDocSelect}
                disabled={docUploading}
              />

            </label>

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <Input
            label="Password"
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            placeholder="Min. 6 characters"
            prefix={
              <Lock
                className="w-3.5 h-3.5"
              />
            }
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            suffix={

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (v) => !v
                  )
                }
                className="
                  text-slate-500
                  hover:text-slate-300
                  transition-colors
                "
              >

                {showPassword ? (
                  <EyeOff
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                ) : (
                  <Eye
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                )}

              </button>

            }
            required
          />


          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <Input
            label="Confirm Password"
            type={
              showConfirmPassword
                ? 'text'
                : 'password'
            }
            placeholder="Re-enter password"
            prefix={
              <Lock
                className="w-3.5 h-3.5"
              />
            }
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            suffix={

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (v) => !v
                  )
                }
                className="
                  text-slate-500
                  hover:text-slate-300
                  transition-colors
                "
              >

                {showConfirmPassword ? (
                  <EyeOff
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                ) : (
                  <Eye
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                )}

              </button>

            }
            required
          />


          {/* =================================================
              TERMS
          ================================================= */}

          <label
            className="
              flex
              items-start
              gap-2
              cursor-pointer
              pt-1
            "
          >

            <input
              type="checkbox"
              className="
                mt-0.5
                rounded
                border-orbit-border
                bg-orbit-surface2
                text-orbit-primary
                w-3.5
                h-3.5
                flex-shrink-0
              "
              required
            />


            <span
              className="
                text-xs
                text-slate-500
                leading-relaxed
              "
            >
              I agree to the{' '}

              <a
                href="#"
                className="
                  text-orbit-primary-light
                  hover:text-orbit-accent
                  transition-colors
                "
              >
                Terms of Service
              </a>

              {' '}and{' '}

              <a
                href="#"
                className="
                  text-orbit-primary-light
                  hover:text-orbit-accent
                  transition-colors
                "
              >
                Privacy Policy
              </a>

            </span>

          </label>


          {/* =================================================
              INFORMATION
          ================================================= */}

          <div
            className="
              bg-orbit-surface2
              border
              border-orbit-border
              rounded-lg
              p-3
              flex
              items-start
              gap-2
            "
          >

            <div
              className="
                w-5
                h-5
                rounded-full
                bg-amber-500/15
                flex
                items-center
                justify-center
                flex-shrink-0
                mt-0.5
              "
            >
              <span
                className="
                  text-amber-400
                  text-xs
                "
              >
                !
              </span>
            </div>


            <p
              className="
                text-xs
                text-slate-500
                leading-relaxed
              "
            >
              Your registration will be
              reviewed by the T&P admin.
              You can login only after your
              account is approved. Upload a
              document to speed up verification.
            </p>

          </div>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={
              docUploading ||
              sectorsLoading
            }
            icon={
              <ArrowRight
                className="w-4 h-4"
              />
            }
            iconPosition="right"
          >
            Submit Registration
          </Button>

        </form>


        {/* =================================================
            SIGN IN
        ================================================= */}

        <p
          className="
            text-center
            text-xs
            text-slate-500
            mt-8
          "
        >
          Already registered?{' '}

          <Link
            to="/sign-in"
            className="
              text-orbit-primary-light
              hover:text-orbit-accent
              transition-colors
              font-medium
            "
          >
            Sign in
          </Link>

        </p>

      </motion.div>

    </div>
  )
}