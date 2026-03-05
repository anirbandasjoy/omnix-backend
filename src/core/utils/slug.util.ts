export class SlugUtil {
  /**
   * Generate a URL-friendly slug from a string
   * @param name - The string to convert to a slug
   * @returns A URL-friendly slug
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate a unique slug by checking against existing slugs
   * @param baseName - The base name to generate slug from
   * @param checkExists - Async function that checks if a slug exists
   * @returns A unique slug
   */
  static async generateUniqueSlug(
    baseName: string,
    checkExists: (slug: string) => Promise<boolean>,
  ): Promise<string> {
    const baseSlug = this.generateSlug(baseName);
    let slug = baseSlug;
    let counter = 1;

    // Keep trying until we find a unique slug
    while (await checkExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
