import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ResumeDocument } from '@/components/resume/ResumeDocument'

/**
 * Renders <ResumeDocument> off-screen and produces a single/multi-page A4 PDF Blob.
 * Used both by the Resume page's "Download PDF" button and by the auto-generate-on-apply
 * flow (item 33), which needs a PDF without navigating to a visible resume page.
 */
export async function generateResumePdfBlob(student, extras) {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-10000px'
  container.style.width = '850px'
  document.body.appendChild(container)

  const root = createRoot(container)
  await new Promise((resolve) => {
    root.render(<ResumeDocument student={student} extras={extras} />)
    // Wait a frame for layout/images before capturing.
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = 210
    const pdfHeight = 297
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const imgData = canvas.toDataURL('image/png')

    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    return pdf.output('blob')
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}

export default generateResumePdfBlob
