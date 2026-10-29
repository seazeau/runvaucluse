import aliasesData from '@/data/aliases.json';

const aliases: Record<string, string> = aliasesData as Record<string, string>;

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u00A0\s]+/g, '-') // Handle non-breaking space and multiple spaces
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Handle known name variations to merge profiles correctly.
 */
function normalizeName(name: string): string {
  if (!name) return '';
  
  // 1. First slugify the current name to get its ID
  const s = slugify(name);
  
  // 2. Split and sort tokens to handle inversion (Prenom Nom vs Nom Prenom)
  const canonicalId = s.split('-').filter(t => t.length > 0).sort().join('-');

  // 3. Check if this ID is an alias for another one
  if (aliases[canonicalId]) {
    return aliases[canonicalId];
  }

  return canonicalId;
}

export function canonicalSlug(name: string): string {
  if (!name) return '';
  return normalizeName(name);
}

/**
 * Splits a distances string (e.g. "43,2 km (1905D+), 22,5 km (1170D+)")
 * without breaking decimal numbers that use commas (e.g. 43,2 or 22,5).
 */
export function parseDistanceList(distances?: string): string[] {
  if (!distances) return [];
  return distances
    .split(/(?:(?<!\d),|,(?!\d)|;)+/)
    .map(d => d.trim())
    .filter(Boolean);
}
