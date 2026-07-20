/** Minimal dependency-free CSV parser/serializer — handles quoted fields with embedded commas. */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      pushField()
    } else if (char === '\n') {
      pushRow()
    } else if (char === '\r') {
      // skip, handled by \n
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) pushRow()

  const cleanRows = rows.filter((r) => r.some((cell) => cell.trim() !== ''))
  if (!cleanRows.length) return []

  const headers = cleanRows[0].map((h) => h.trim().toLowerCase())
  return cleanRows.slice(1).map((r) => {
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? '').trim()
    })
    return obj
  })
}

export function toCsv(rows, headers) {
  const escape = (value) => {
    const str = String(value ?? '')
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const lines = [headers.join(',')]
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(row[h])).join(','))
  })
  return lines.join('\n')
}

export function downloadCsv(filename, rows, headers) {
  const blob = new Blob([toCsv(rows, headers)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
