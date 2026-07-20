const OVERRIDES = {
  'share-notes': 'Note Share',
  'shared-notes': 'Note Share',
  shared_notes: 'Note Share',
  'notice-board': 'Notices',
}

/** Turns a sidebar `?view=` query value (e.g. "view-students") into a readable breadcrumb label. */
export function formatViewLabel(view) {
  if (!view || view === 'dashboard') return 'Dashboard'
  if (OVERRIDES[view]) return OVERRIDES[view]
  return view
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default formatViewLabel
