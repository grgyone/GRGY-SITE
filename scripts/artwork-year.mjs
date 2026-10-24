// Prefer complete DDMMYYYY dates over accidental four-digit matches inside them.
export function artworkYear(filename) {
  const date = /(?:^|\D)(\d{2})(\d{2})((?:19|20)\d{2})(?!\d)/.exec(filename);
  if (date) {
    const [, day, month, year] = date;
    const value = new Date(Date.UTC(+year, +month - 1, +day));
    if (value.getUTCFullYear() === +year && value.getUTCMonth() === +month - 1 && value.getUTCDate() === +day) return +year;
    return null;
  }
  const years = [...new Set([...filename.matchAll(/(?:^|\D)((?:19|20)\d{2})(?!\d)/g)].map(match => +match[1]))];
  return years.length === 1 ? years[0] : null;
}
