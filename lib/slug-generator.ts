export function generateSlug(name: string, city?: string): string {
  if (!name) return 'unnamed-clinic';
  
  // Convert to lowercase and replace spaces with hyphens
  let slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  // Add city if available for better uniqueness
  if (city) {
    const citySlug = city
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    slug = `${slug}-${citySlug}`;
  }
  
  // Remove any remaining special characters and ensure it starts/ends with alphanumeric
  slug = slug.replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
  
  // Ensure it's not empty
  if (!slug) {
    return `clinic-${Date.now()}`;
  }
  
  return slug;
}

export function generateUniqueSlug(name: string, city?: string, existingSlugs: string[] = []): string {
  let baseSlug = generateSlug(name, city);
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists and add counter if needed
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
