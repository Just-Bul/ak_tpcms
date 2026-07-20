/** Sorts a list newest-first by a date field (default `created_on`), used across Placements, Trainings, Applications, Notices. */
export function sortByNewest(list = [], dateKey = 'created_on') {
  return [...list].sort((a, b) => new Date(b[dateKey] ?? 0) - new Date(a[dateKey] ?? 0))
}

export default sortByNewest
