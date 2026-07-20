import { forwardRef } from 'react'
import { Link, Mail, Phone, GraduationCap, Globe } from 'lucide-react'
import { getAssetUrl } from '@/utils/getAssetUrl'

function hasValue(value) {
  if (value === null || value === undefined) return false
  const text = String(value).trim().toLowerCase()
  return text !== '' && text !== 'null' && text !== 'undefined' && text !== 'n/a' && text !== '-'
}

/**
 * The printable ATS-friendly resume document — extracted from the old separate
 * Resume.jsx preview page so it can be rendered both on-screen (ResumePage) and
 * off-screen (auto-generation during application submit, item 33) from one source.
 * Every optional section is hidden entirely when empty (item 21).
 */
export const ResumeDocument = forwardRef(function ResumeDocument({ student, extras }, ref) {
  if (!student) return null
  const skills = (extras.skills || []).filter(hasValue)
  const projects = (extras.projects || []).filter((p) => hasValue(p.title) || hasValue(p.description))
  const internships = (extras.internships || []).filter((i) => hasValue(i.company) || hasValue(i.role))
  const certificates = (extras.certificates || []).filter((c) => hasValue(c.title) || hasValue(c.issuer) || hasValue(c.year))

  return (
    <div ref={ref} className="mx-auto max-w-[850px] bg-white text-black">
      <div className="flex gap-8 border-b p-8">
        <div className="h-36 w-36 overflow-hidden rounded-lg border flex-shrink-0">
          {student.image_url ? (
            <img src={getAssetUrl(student.image_url)} alt={student.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400 text-xs">No Photo</div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{student.name}</h1>
          <p className="mt-2 text-lg text-gray-600">{student.department}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2"><Mail size={15} />{student.email}</div>
            <div className="flex items-center gap-2"><Phone size={15} />{student.mobile_no}</div>
            <div className="flex items-center gap-2"><GraduationCap size={15} />{student.roll_no}</div>
            <div>CGPA : {student.cgpa}</div>
          </div>
        </div>
      </div>

      <div className="resume-section border-b p-6">
        <h2 className="mb-4 text-xl font-bold border-l-4 border-blue-600 pl-3">Career Objective</h2>
        <p className="leading-8 text-gray-700">
          {hasValue(extras.objective)
            ? extras.objective
            : `A highly motivated ${student.department} student currently studying in ${student.semester} Semester with a CGPA of ${student.cgpa}. Passionate about learning new skills and seeking an opportunity to contribute while gaining industry experience.`}
        </p>
      </div>

      <div className="resume-section border-b p-6">
        <h2 className="mb-4 text-xl font-bold border-l-4 border-blue-600 pl-3">Education</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Qualification</th>
              <th className="border p-3 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border px-3 py-2">Department</td><td className="border px-3 py-2">{student.department}</td></tr>
            <tr><td className="border px-3 py-2">Semester</td><td className="border px-3 py-2">{student.semester}</td></tr>
            <tr><td className="border px-3 py-2">CGPA</td><td className="border px-3 py-2">{student.cgpa}</td></tr>
            {hasValue(student.tenth_division) && <tr><td className="border px-3 py-2">10th Division</td><td className="border px-3 py-2">{student.tenth_division}</td></tr>}
            {hasValue(student.twelfth_division) && <tr><td className="border px-3 py-2">12th Division</td><td className="border px-3 py-2">{student.twelfth_division}</td></tr>}
          </tbody>
        </table>
      </div>

      {hasValue(extras.address) && (
        <div className="resume-section border-b p-6">
          <strong>Address:</strong>
          <div className="mt-1 whitespace-pre-wrap">{extras.address}</div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="resume-section border-b p-6">
          <h2 className="mb-4 text-xl font-bold border-l-4 border-blue-600 pl-3">Technical Skills</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {(hasValue(extras.github) || hasValue(extras.linkedin) || hasValue(extras.portfolio)) && (
        <div className="resume-section border-b p-6">
          <h2 className="mb-4 border-l-4 border-blue-600 pl-3 text-xl font-bold">Professional Links</h2>
          <div className="mt-4 space-y-2">
            {hasValue(extras.github) && <div className="flex items-center gap-3"><Link size={18} /><span>{extras.github}</span></div>}
            {hasValue(extras.linkedin) && <div className="flex items-center gap-3"><Link size={18} /><span>{extras.linkedin}</span></div>}
            {hasValue(extras.portfolio) && <div className="flex items-center gap-3"><Globe size={18} /><span>{extras.portfolio}</span></div>}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="resume-section border-b p-6">
          <h2 className="mb-4 border-l-4 border-blue-600 pl-3 text-xl font-bold">Projects</h2>
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={index} className="rounded-lg border p-5">
                <h3 className="text-lg font-bold">{project.title}</h3>
                {hasValue(project.technology) && <p className="mt-2 text-sm font-medium text-blue-600">Tools/Technology: {project.technology}</p>}
                <p className="mt-3 leading-7 text-gray-700">{project.description}</p>
                {(hasValue(project.github) || hasValue(project.live)) && (
                  <div className="mt-4 space-y-1 text-sm">
                    {hasValue(project.github) && <p><strong>Link:</strong> {project.github}</p>}
                    {hasValue(project.live) && <p><strong>Live/Demo:</strong> {project.live}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {internships.length > 0 && (
        <div className="resume-section border-b p-6">
          <h2 className="mb-4 border-l-4 border-blue-600 pl-3 text-xl font-bold">Internship</h2>
          <div className="space-y-3">
            {internships.map((item, index) => (
              <div key={index} className="rounded-lg border p-5">
                <h3 className="text-lg font-bold">{item.company}</h3>
                <p className="mt-1 font-medium">{item.role}</p>
                <p className="text-sm text-gray-500">{item.duration}</p>
                <p className="mt-3 leading-7 text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {certificates.length > 0 && (
        <div className="resume-section border-b p-6">
          <h2 className="mb-4 border-l-4 border-blue-600 pl-3 text-xl font-bold">Certifications</h2>
          <div className="space-y-3">
            {certificates.map((c, index) => (
              <div key={index} className="rounded-lg border p-4">
                {hasValue(c.title) && <h3 className="font-semibold">{c.title}</h3>}
                {hasValue(c.issuer) && <p className="mt-1 text-sm">{c.issuer}</p>}
                {hasValue(c.year) && <p className="text-sm text-gray-500">{c.year}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {(hasValue(extras.languages) || hasValue(extras.hobbies)) && (
        <div className="resume-section border-b p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {hasValue(extras.languages) && (
              <div>
                <h2 className="mb-3 border-l-4 border-blue-600 pl-3 text-xl font-bold">Languages</h2>
                <p className="leading-7 text-gray-700">{extras.languages}</p>
              </div>
            )}
            {hasValue(extras.hobbies) && (
              <div>
                <h2 className="mb-3 border-l-4 border-blue-600 pl-3 text-xl font-bold">Hobbies</h2>
                <p className="leading-7 text-gray-700">{extras.hobbies}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {extras.declaration && (
        <div className="resume-section border-b p-6">
          <h2 className="mb-4 border-l-4 border-blue-600 pl-3 text-xl font-bold">Declaration</h2>
          <p>I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief.</p>
        </div>
      )}

      <div className="p-8">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Place</p>
            <p className="mt-3 text-gray-600">___________________</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Signature</p>
            <p className="mt-5 text-lg font-bold">{student.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ResumeDocument
