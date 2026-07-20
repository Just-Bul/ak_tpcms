import jsPDF from 'jspdf'

/**
 * Generates a simple interview call-letter PDF (item 28). Interviews are stored in
 * localStorage (`company_interviews`) since there is no backend interview model — this is a
 * browser-local stub, so the letter is generated client-side from that same local record.
 */
export function generateInterviewLetterPdf(interview) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const marginX = 20
  let y = 25

  pdf.setFontSize(18)
  pdf.setFont(undefined, 'bold')
  pdf.text('Interview Call Letter', marginX, y)
  y += 12

  pdf.setDrawColor(200)
  pdf.line(marginX, y, 190, y)
  y += 12

  pdf.setFontSize(11)
  pdf.setFont(undefined, 'normal')
  pdf.text(`Dear ${interview.student_name || 'Candidate'},`, marginX, y)
  y += 10

  const intro = `You have been shortlisted for the position of "${interview.job_title || 'the applied role'}". Please find your interview details below.`
  const introLines = pdf.splitTextToSize(intro, 170)
  pdf.text(introLines, marginX, y)
  y += introLines.length * 6 + 6

  const rows = [
    ['Date', interview.date ? new Date(interview.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'To be confirmed'],
    ['Time', interview.time || 'To be confirmed'],
    ['Mode', interview.mode || 'Online'],
    interview.mode === 'Offline'
      ? ['Location', interview.offline_location || 'To be confirmed']
      : ['Meeting Link', interview.meeting_link || 'To be shared'],
  ]

  pdf.setFont(undefined, 'bold')
  rows.forEach(([label, value]) => {
    pdf.text(`${label}:`, marginX, y)
    pdf.setFont(undefined, 'normal')
    pdf.text(String(value), marginX + 40, y)
    pdf.setFont(undefined, 'bold')
    y += 8
  })
  pdf.setFont(undefined, 'normal')
  y += 4

  if (interview.notes) {
    pdf.setFont(undefined, 'bold')
    pdf.text('Notes:', marginX, y)
    y += 7
    pdf.setFont(undefined, 'normal')
    const noteLines = pdf.splitTextToSize(interview.notes, 170)
    pdf.text(noteLines, marginX, y)
    y += noteLines.length * 6 + 6
  }

  y += 6
  pdf.text('Please carry a valid ID proof and a copy of your resume.', marginX, y)
  y += 14
  pdf.text('Best regards,', marginX, y)
  y += 7
  pdf.setFont(undefined, 'bold')
  pdf.text('Training & Placement Cell', marginX, y)

  return pdf.output('blob')
}

export function downloadInterviewLetter(interview) {
  const blob = generateInterviewLetterPdf(interview)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Interview_Letter_${(interview.student_name || 'candidate').replace(/\s+/g, '_')}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export default generateInterviewLetterPdf
